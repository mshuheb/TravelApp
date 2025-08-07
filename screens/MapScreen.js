import {
  Text,
  View,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
  Animated,
  TouchableWithoutFeedback,
  Modal,
  Pressable,
} from 'react-native';
import React, {useRef, useEffect, useState, useContext} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import MapView, {Marker} from 'react-native-maps';
import Entypo from 'react-native-vector-icons/Entypo';
import {DarkModeContext} from '../AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from '../styles/MapScreenStyles';

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
  {featureType: 'road', elementType: 'geometry', stylers: [{color: '#38414e'}]},
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

const MapScreen = () => {
  const route = useRoute();
  const mapView = useRef(null);
  const places = route?.params?.places;
  const firstPlace = places?.[0];
  const {isDarkMode} = useContext(DarkModeContext);
  const navigation = useNavigation();

  const coordinates = places?.map(place => ({
    latitude: place.geometry.location.lat,
    longitude: place.geometry.location.lng,
  }));

  useEffect(() => {
    if (places && mapView.current) {
      mapView.current.fitToCoordinates(coordinates, {
        edgePadding: {top: 50, right: 50, bottom: 50, left: 50},
        animated: true,
      });
    }
  }, [places]);

  const [selectedMarker, setSelectedMarker] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(150)).current;
  const [fullScreenImage, setFullScreenImage] = useState(null);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    Animated.timing(animatedHeight, {
      toValue: isExpanded ? 150 : 400,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const backgroundColor = isDarkMode ? '#1c1c1e' : '#fff';
  const textColor = isDarkMode ? '#f2f2f7' : '#000';
  const subTextColor = isDarkMode ? '#a9a9b0' : 'gray';

  const currentStyles = styles(isDarkMode);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor}}>
      <Pressable
        onPress={() => navigation.goBack()}
        style={currentStyles.backButton}>
        <View style={currentStyles.backIconContainer}>
          <Ionicons name="arrow-back" size={20} color="black" />
        </View>
      </Pressable>
      <MapView
        loadingEnabled
        ref={mapView}
        initialRegion={{
          latitude: firstPlace?.geometry?.location?.lat || 28.6139,
          longitude: firstPlace?.geometry?.location?.lng || 77.209,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        }}
        style={currentStyles.map}
        customMapStyle={isDarkMode ? darkMapStyle : []}>
        {places?.map((item, index) => (
          <Marker
            key={index}
            onPress={() => setSelectedMarker(item)}
            coordinate={{
              latitude: item.geometry.location.lat,
              longitude: item.geometry.location.lng,
            }}
            title={item.name}
            description={item.briefDescription}
          />
        ))}
      </MapView>

      {selectedMarker && (
        <Animated.View
          style={[
            currentStyles.infoWrapper,
            {height: animatedHeight, backgroundColor},
          ]}>
          {/* Header */}
          <View style={[currentStyles.fixedHeader, {backgroundColor}]}>
            <View style={currentStyles.indexContainer}>
              <Entypo name="location-pin" size={20} color="white" />
            </View>
            <Text
              numberOfLines={2}
              style={[currentStyles.placeName, {color: textColor}]}>
              {selectedMarker?.name}
            </Text>
            <Entypo
              onPress={() => {
                setSelectedMarker(null);
                setIsExpanded(false);
                animatedHeight.setValue(150);
              }}
              name="cross"
              size={25}
              color="gray"
            />
          </View>

          {/* Scrollable Info */}
          <ScrollView
            style={currentStyles.scrollContainer}
            contentContainerStyle={currentStyles.infoContainer}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}>
            <TouchableOpacity onPress={toggleExpand} activeOpacity={0.8}>
              <Text style={[currentStyles.description, {color: subTextColor}]}>
                {selectedMarker?.briefDescription}
              </Text>

              {selectedMarker.photos && selectedMarker.photos[0] && (
                <TouchableOpacity
                  onPress={() => setFullScreenImage(selectedMarker.photos[0])}>
                  <Image
                    source={{uri: selectedMarker.photos[0]}}
                    style={currentStyles.image}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </ScrollView>

          {/* Fullscreen Image */}
          <Modal
            visible={!!fullScreenImage}
            transparent={true}
            animationType="fade">
            <TouchableWithoutFeedback onPress={() => setFullScreenImage(null)}>
              <View
                style={[
                  currentStyles.modalContainer,
                  {
                    backgroundColor: isDarkMode
                      ? 'rgba(0,0,0,0.95)'
                      : 'rgba(255,255,255,0.95)',
                  },
                ]}>
                <TouchableOpacity
                  style={currentStyles.closeButton}
                  onPress={() => setFullScreenImage(null)}>
                  <Entypo name="cross" size={30} color="white" />
                </TouchableOpacity>
                <Image
                  source={{uri: fullScreenImage}}
                  style={currentStyles.fullScreenImage}
                  resizeMode="contain"
                />
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

export default MapScreen;
