import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useContext,
} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Dimensions,
  FlatList,
  Linking,
  Pressable,
  Modal,
  Animated,
  TouchableOpacity,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import MapView, {Marker} from 'react-native-maps';
import axios from 'axios';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import {useNavigation} from '@react-navigation/native';
import {AuthContext, DarkModeContext} from '../AuthContext';
import styles from '../styles/PlacesScreenStyles';

const {width} = Dimensions.get('window');

const GOOGLE_API_KEY = 'AIzaSyAcrTZPToPzWZJhtGgehxe3MYxhkUN_W0U';

const PlacesScreen = () => {
  const navigation = useNavigation();

  const route = useRoute();
  const {placeId, name, address, location, photos, description} = route.params;
  console.log('Received placeId in PlacesScreen:', placeId);
  const {userId} = useContext(AuthContext);
  const [mostLovedPlaces, setMostLovedPlaces] = useState([]);
  const [foodieHotspots, setFoodieHotspots] = useState([]);
  const [resortsAndStays, setResortsAndStays] = useState([]);

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [placeDetails, setPlaceDetails] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const {isDarkMode, toggleDarkMode} = useContext(DarkModeContext);

  const getPhotoUrl = photoRef =>
    `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${GOOGLE_API_KEY}`;

  const fetchPlacesByType = async type => {
    try {
      const res = await axios.get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
        {
          params: {
            location: `${location.lat},${location.lng}`,
            radius: 5000,
            type: type,
            key: GOOGLE_API_KEY,
          },
        },
      );
      return res.data.results.slice(0, 6);
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      return [];
    }
  };

  const fetchAllRecommendations = useCallback(async () => {
    const [loved, food, stays] = await Promise.all([
      fetchPlacesByType('tourist_attraction'),
      fetchPlacesByType('restaurant'),
      fetchPlacesByType('lodging'),
    ]);

    setMostLovedPlaces(loved);
    setFoodieHotspots(food);
    setResortsAndStays(stays);
  }, [location]);

  useEffect(() => {
    if (location) {
      fetchAllRecommendations();
    }
  }, [location]);

  const fetchPlaceDetails = async placeId => {
    try {
      const res = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json`,
        {
          params: {
            place_id: placeId,
            fields:
              'name,photos,formatted_address,formatted_phone_number,website,opening_hours,reviews,types',
            key: GOOGLE_API_KEY,
          },
        },
      );
      return res.data.result;
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  };
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const loopedPhotos = [...photos, photos[0]];
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => prev + 1);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let isResetting = false;

    const scrollToIndex = () => {
      const nextIndex = activeIndex % loopedPhotos.length;

      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          x: nextIndex * (width - 30),
          animated: true,
        });
      }

      if (activeIndex === photos.length) {
        isResetting = true;

        setTimeout(() => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({
              x: 0,
              animated: false,
            });
          }

          setTimeout(() => {
            setActiveIndex(1);
            isResetting = false;
          }, 2000);
        }, 400);
      }
    };

    if (!isResetting) scrollToIndex();
  }, [activeIndex]);

  const handlePlacePress = async item => {
    const details = await fetchPlaceDetails(item.place_id);
    if (details) {
      setPlaceDetails(details);
      setSelectedPlace(item);
      setModalVisible(true);
    }
  };

  const handleWishlistToggle = async () => {
    if (!placeId) {
      console.warn('No place selected');
      return;
    }

    try {
      const res = await axios.post(
        `http://192.168.31.48:8000/user/${userId}/wishlist`,
        {
          placeId: placeId,
        },
      );

      setIsWishlisted(res.data.wishlisted);
    } catch (error) {
      console.error('Error saving to wishlist:', error);
    }
  };

  const [modalScrollX] = useState(new Animated.Value(0));
  const modalScrollViewRef = useRef(null);
  const modalDotSize = 8;
  const IMAGE_WIDTH = width;
  const scrollXRef = useRef(0);
  const isAnimatingRef = useRef(false);

  const goToNextSlide = () => {
    if (
      modalScrollViewRef.current &&
      placeDetails?.photos?.length > 0 &&
      !isAnimatingRef.current
    ) {
      const currentIndex = Math.round(scrollXRef.current / IMAGE_WIDTH);
      const nextIndex = Math.min(
        currentIndex + 1,
        placeDetails.photos.length - 1,
      );

      isAnimatingRef.current = true;
      modalScrollViewRef.current.scrollTo({
        x: nextIndex * IMAGE_WIDTH,
        animated: true,
      });

      setTimeout(() => {
        isAnimatingRef.current = false;
      }, 300);
    }
  };

  const goToPrevSlide = () => {
    if (modalScrollViewRef.current && !isAnimatingRef.current) {
      const currentIndex = Math.round(scrollXRef.current / IMAGE_WIDTH);
      const prevIndex = Math.max(currentIndex - 1, 0);

      isAnimatingRef.current = true;
      modalScrollViewRef.current.scrollTo({
        x: prevIndex * IMAGE_WIDTH,
        animated: true,
      });

      setTimeout(() => {
        isAnimatingRef.current = false;
      }, 300);
    }
  };

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!userId || !placeId) return;

      try {
        const res = await axios.get(`http://192.168.31.48:8000/user/${userId}`);
        setIsWishlisted(res.data.wishlist.includes(placeId));
      } catch (err) {
        console.error('Error fetching wishlist:', err);
      }
    };

    fetchWishlist();
  }, [userId, placeId]);

  const currentStyles = styles(isDarkMode);

  const darkMapStyle = [
    {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
    {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
    {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{color: '#d59563'}],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{color: '#d59563'}],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{color: '#263c3f'}],
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{color: '#6b9a76'}],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{color: '#38414e'}],
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{color: '#212a37'}],
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{color: '#9ca5b3'}],
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{color: '#2f3948'}],
    },
    {
      featureType: 'transit.station',
      elementType: 'labels.text.fill',
      stylers: [{color: '#d59563'}],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{color: '#17263c'}],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{color: '#515c6d'}],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [{color: '#17263c'}],
    },
  ];

  const renderPlaceItem = ({item}) => {
    const photo = item?.photos?.[0];
    const imageUrl = photo ? getPhotoUrl(photo.photo_reference) : null;

    return (
      <Pressable
        style={currentStyles.card}
        onPress={() => handlePlacePress(item)}>
        {imageUrl ? (
          <Image source={{uri: imageUrl}} style={currentStyles.cardImage} />
        ) : (
          <View style={[currentStyles.cardImage, currentStyles.noImage]}>
            <Text>No Image</Text>
          </View>
        )}
        <Text style={currentStyles.cardTitle}>{item.name}</Text>
        <Text style={currentStyles.cardAddress} numberOfLines={2}>
          {item.vicinity || item.formatted_address}
        </Text>
      </Pressable>
    );
  };

  return (
    <ScrollView
      style={currentStyles.container}
      contentContainerStyle={{paddingBottom: 50, paddingTop: 30}}>
      <View style={currentStyles.headerRow}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={currentStyles.backButton}>
          <View style={currentStyles.backIconContainer}>
            <Ionicons name="arrow-back" size={20} color="black" />
          </View>
        </Pressable>
        <Pressable
          onPress={handleWishlistToggle}
          style={currentStyles.heartButton}>
          <View style={currentStyles.backIconContainer}>
            <Ionicons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={20}
              color={isWishlisted ? 'red' : 'black'}
            />
          </View>
        </Pressable>
      </View>
      <Text style={currentStyles.title}>{name}</Text>
      <Text style={currentStyles.address}>{address}</Text>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={currentStyles.carousel}>
        {loopedPhotos.map((photo, index) => (
          <Image
            key={index}
            source={{uri: getPhotoUrl(photo.photo_reference)}}
            style={currentStyles.image}
          />
        ))}
      </ScrollView>

      <Text style={currentStyles.sectionTitle}>About</Text>
      <Text style={currentStyles.description}>{description}</Text>

      {/* Things to Do Section */}
      <Text style={currentStyles.sectionTitle}>Things to Do</Text>

      <Text style={currentStyles.subSectionTitle}>Most Loved Places</Text>
      <FlatList
        data={mostLovedPlaces}
        renderItem={renderPlaceItem}
        keyExtractor={(item, index) => item.place_id + index}
        horizontal
        showsHorizontalScrollIndicator={false}
      />

      <Text style={currentStyles.subSectionTitle}>Foodie Hotspots</Text>
      <FlatList
        data={foodieHotspots}
        renderItem={renderPlaceItem}
        keyExtractor={(item, index) => item.place_id + index}
        horizontal
        showsHorizontalScrollIndicator={false}
      />

      <Text style={currentStyles.subSectionTitle}>Resorts & Stays</Text>
      <FlatList
        data={resortsAndStays}
        renderItem={renderPlaceItem}
        keyExtractor={(item, index) => item.place_id + index}
        horizontal
        showsHorizontalScrollIndicator={false}
      />

      {location && (
        <Pressable
          onPress={() => setMapModalVisible(true)}
          style={currentStyles.mapContainer}>
          <MapView
            style={currentStyles.map}
            initialRegion={{
              latitude: location.lat,
              longitude: location.lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            pointerEvents="none"
            customMapStyle={isDarkMode ? darkMapStyle : []}>
            <Marker
              coordinate={{latitude: location.lat, longitude: location.lng}}
              title={name}
            />
          </MapView>
        </Pressable>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View
          style={{flex: 1, backgroundColor: isDarkMode ? '#121212' : '#fff'}}>
          <Pressable
            onPress={() => setModalVisible(false)}
            style={currentStyles.modalCloseButton}>
            <View style={currentStyles.modalCloseIconContainer}>
              <AntDesign name="close" size={20} color="black" />
            </View>
          </Pressable>

          {placeDetails &&
            placeDetails.photos &&
            placeDetails.photos.length > 0 && (
              <View style={currentStyles.modalCarouselContainer}>
                <ScrollView
                  ref={modalScrollViewRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  style={currentStyles.modalCarousel}
                  onScroll={Animated.event(
                    [{nativeEvent: {contentOffset: {x: modalScrollX}}}],
                    {
                      useNativeDriver: false,
                      listener: event => {
                        scrollXRef.current = event.nativeEvent.contentOffset.x;
                      },
                    },
                  )}
                  scrollEventThrottle={16}>
                  {placeDetails.photos.map((photo, index) => (
                    <Image
                      key={index}
                      source={{uri: getPhotoUrl(photo.photo_reference)}}
                      style={currentStyles.modalImage}
                    />
                  ))}
                </ScrollView>

                {placeDetails.photos.length > 1 && (
                  <View style={currentStyles.pagination}>
                    {Array.from({length: placeDetails.photos.length}).map(
                      (_, index) => (
                        <Animated.View
                          key={index}
                          style={[
                            currentStyles.paginationDot,
                            {
                              opacity: modalScrollX.interpolate({
                                inputRange: [
                                  (index - 1) * (width - 30),
                                  index * (width - 30),
                                  (index + 1) * (width - 30),
                                ],
                                outputRange: [0.3, 1, 0.3],
                                extrapolate: 'clamp',
                              }),
                              width: modalDotSize,
                              height: modalDotSize,
                              borderRadius: modalDotSize / 2,
                            },
                          ]}
                        />
                      ),
                    )}
                  </View>
                )}

                {placeDetails.photos.length > 1 && (
                  <>
                    <TouchableOpacity
                      onPress={goToPrevSlide}
                      style={[
                        currentStyles.carouselButton,
                        currentStyles.carouselButtonLeft,
                      ]}>
                      <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={goToNextSlide}
                      style={[
                        currentStyles.carouselButton,
                        currentStyles.carouselButtonRight,
                      ]}>
                      <Ionicons
                        name="chevron-forward"
                        size={24}
                        color="white"
                      />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

          {placeDetails && (
            <ScrollView style={currentStyles.modalDetails}>
              <Text style={currentStyles.modalTitle}>{placeDetails.name}</Text>
              <Text style={currentStyles.modalReview}>
                {placeDetails.reviews?.[0]?.text || 'No reviews available'}
              </Text>
              {placeDetails.formatted_phone_number && (
                <View style={currentStyles.row}>
                  <AntDesign name="phone" size={23} color="#2a52be" />
                  <Text style={currentStyles.detailText}>
                    {placeDetails.formatted_phone_number}
                  </Text>
                </View>
              )}
              {placeDetails.opening_hours?.weekday_text?.[0] && (
                <View style={currentStyles.row}>
                  <Ionicons name="time-outline" size={23} color="#2a52be" />
                  <Text style={currentStyles.detailText}>
                    {placeDetails.opening_hours.weekday_text[0]}
                  </Text>
                </View>
              )}
              {placeDetails.website && (
                <View style={currentStyles.row}>
                  <Ionicons name="earth" size={23} color="#2a52be" />
                  <Text
                    style={currentStyles.website}
                    onPress={() => Linking.openURL(placeDetails.website)}>
                    {placeDetails.website}
                  </Text>
                </View>
              )}
              {placeDetails.formatted_address && (
                <View style={currentStyles.row}>
                  <Entypo name="location" size={23} color="#2a52be" />
                  <Text style={currentStyles.detailText}>
                    {placeDetails.formatted_address}
                  </Text>
                </View>
              )}
              {placeDetails.types?.length > 0 && (
                <View style={currentStyles.tagsContainer}>
                  {placeDetails.types.map((tag, idx) => (
                    <View key={idx} style={currentStyles.tag}>
                      <Text style={currentStyles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
      <Modal
        visible={mapModalVisible}
        animationType="slide"
        onRequestClose={() => setMapModalVisible(false)}>
        <View style={{flex: 1}}>
          <Pressable
            onPress={() => setMapModalVisible(false)}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              zIndex: 10,
              backgroundColor: isDarkMode ? '#e0e0e0' : '#333',
              borderRadius: 15,
              padding: 8,
            }}>
            <AntDesign
              name="close"
              size={20}
              color={isDarkMode ? 'black' : '#fff'}
            />
          </Pressable>
          <MapView
            style={{flex: 1}}
            initialRegion={{
              latitude: location.lat,
              longitude: location.lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            customMapStyle={isDarkMode ? darkMapStyle : []}>
            <Marker
              coordinate={{latitude: location.lat, longitude: location.lng}}
              title={name}
            />
          </MapView>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default PlacesScreen;
