import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Image,
  Pressable,
  ImageBackground,
  Animated,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from 'react-native';
import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import moment from 'moment';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import {AuthContext, DarkModeContext} from '../AuthContext';
import {jwtDecode} from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'core-js/stable/atob';
import {Swipeable} from 'react-native-gesture-handler';
import useBlinkingAnimation from '../hooks/useBlinkingAnimation';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {useFocusEffect} from '@react-navigation/native';
import styles from '../styles/HomeScreenStyles';

const HomeScreen = () => {
  const currentYear = moment().year();
  const navigation = useNavigation();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const {userId, setUserId, setToken, userInfo, setUserInfo, clearAuthToken} =
    useContext(AuthContext);
  const [user, setUser] = useState(null);
  const swipeableRefs = useRef({});
  const opacity = useBlinkingAnimation(5000);

  const [showSearch, setShowSearch] = useState(false);
  const searchBarHeight = useRef(new Animated.Value(0)).current;
  const [isLoading, setIsLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const {isDarkMode, toggleDarkMode} = useContext(DarkModeContext);

  useEffect(() => {
    Animated.timing(searchBarHeight, {
      toValue: showSearch ? 60 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showSearch]);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, []),
  );

  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem('authToken');
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;
      setUserId(userId);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchTrips();
    }
  }, [userId]);

  const fetchUserData = async () => {
    const response = await axios.get(`https://travelapp-32u1.onrender.com/user/${userId}`);
    setUser(response.data);
    setLoadingUser(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.warn('No auth token found');
        return;
      }

      const decoded = jwtDecode(token);
      const id = decoded.userId;

      const res = await fetch(`https://travelapp-32u1.onrender.com/users/${id}`);
      const text = await res.text();

      console.log('User data response text:', text);
      console.log('Status:', res.status);

      if (res.ok) {
        const user = JSON.parse(text);
        setUser(user);
      } else {
        console.error('Failed to fetch user data:', res.status);
      }
    } catch (err) {
      console.error('Error in fetchUserData:', err.message);
    } finally {
      setLoadingUser(false);
    }
  };
  // const fetchUserData = async () => {
  //   const response = await axios.get(`http://10.0.2.2:8000/user/${userId}`);
  //   setUser(response.data);
  // };
  // const fetchUserData = async () => {
  //   const response = await axios.get(`http://localhost:8000/user/${userId}`);
  //   setUser(response.data);
  // };

  const fetchTrips = async () => {
    setLoadingTrips(true);
    try {
      console.log('userdata', userId);
      const response = await axios.get(
        `https://travelapp-32u1.onrender.com/trips/${userId}`,
      );
      setTrips(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching trips:', error);
      setLoading(false);
    } finally {
      setLoadingTrips(false);
    }
  };
  console.log('user', userId);
  const logout = () => {
    clearAuthToken();
  };

  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [onModalClose, setOnModalClose] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleCloseModal = () => {
    setCustomModalVisible(false);
    setShowDeleteConfirm(false);

    if (typeof onModalClose === 'function') {
      const callback = onModalClose;
      setOnModalClose(null);
      callback();
    }
  };

  const showModal = (message, callback = null) => {
    setModalMessage(message);
    setCustomModalVisible(true);
    setOnModalClose(() => callback);
  };

  const handleDeleteTrip = tripId => {
    if (!tripId || !userId) {
      console.error('Missing required parameters:', {tripId, userId});
      showModal('Required trip or user information is missing.');
      return;
    }

    setModalMessage('Are you sure you want to delete this trip?');
    setCustomModalVisible(true);
    setShowDeleteConfirm(true);

    setOnModalClose(() => async () => {
      try {
        const response = await axios.delete(
          `https://travelapp-32u1.onrender.com/trip/${tripId}?userId=${userId}`,
        );

        console.log('Trip deleted:', response.data);

        showModal('Trip deleted successfully.', () => {
          fetchTrips();
        });
      } catch (error) {
        console.error('Delete error:', error.response?.data || error.message);

        showModal(
          error.response?.data?.message || 'Failed to delete trip.',
          () => {
            if (swipeableRefs.current[tripId]) {
              swipeableRefs.current[tripId].close();
            }
          },
        );
      }
    });
  };

  const renderRightActions = tripId => (
    <View style={{justifyContent: 'center', marginRight: 15}}>
      <Pressable
        onPress={() => handleDeleteTrip(tripId)}
        style={{
          width: 80,
          height: 80,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'red',
          borderRadius: 8,
          marginVertical: 10,
          alignSelf: 'center',
          transform: [{translateY: 6}, {translateX: 10}],
        }}>
        <AntDesign name="delete" size={24} color="white" />
      </Pressable>
    </View>
  );

  const currentStyles = styles(isDarkMode);
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDarkMode ? '#1c1c1c' : '#F0F8FF',
        paddingTop: 20,
      }}>
      {isLoading && (
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: isDarkMode
              ? 'rgba(255,255,255,0.1)'
              : 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}>
          <ActivityIndicator
            size="large"
            color={isDarkMode ? '#00BCC4' : '#00bfa5'}
          />
        </View>
      )}
      <ScrollView contentContainerStyle={{paddingBottom: 80}}>
        <View
          style={{
            padding: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          {/* Left Side: Small Logo Image */}
          <Image
            style={{width: 140, height: 60, marginLeft: -5, marginTop: 5}}
            source={{
              uri: 'https://res.cloudinary.com/dvqaaywos/image/upload/v1743418465/TripPlanner/sfsm5xr1lpeqxbiayx4u.png',
            }}
          />

          {/* Right Side Icons */}
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 15}}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#e0e0e0',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <AntDesign
                name="search1"
                size={24}
                color="#00BCC4"
                onPress={() => setShowSearch(!showSearch)}
              />
            </View>

            {loadingUser ? (
              <ActivityIndicator size="small" color="#0000ff" />
            ) : (
              user && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('Profile', {user})}>
                  <Image
                    source={{uri: user.photo}}
                    style={{width: 35, height: 35, borderRadius: 17.5}}
                  />
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        <View style={{padding: 10, marginTop: -25, zIndex: 999}}>
          <Animated.View
            style={{
              height: searchBarHeight,
              paddingHorizontal: 10,
              zIndex: 999,
            }}>
            {showSearch && (
              <GooglePlacesAutocomplete
                placeholder="🔍 Search places..."
                fetchDetails={true}
                onPress={async (data, details = null) => {
                  setIsLoading(true);
                  if (!details) {
                    console.error('Details are null or undefined');
                    return;
                  }

                  let description = details.editorial_summary?.overview;

                  if (!description) {
                    try {
                      const placeName =
                        data.structured_formatting?.main_text ||
                        data.description;
                      const kgResponse = await fetch(
                        `https://kgsearch.googleapis.com/v1/entities:search?query=${encodeURIComponent(
                          placeName,
                        )}&key=AIzaSyAcrTZPToPzWZJhtGgehxe3MYxhkUN_W0U&limit=1&indent=true`,
                      );
                      const kgData = await kgResponse.json();

                      const kgResult = kgData.itemListElement?.[0]?.result;
                      description =
                        kgResult?.detailedDescription?.articleBody ||
                        'No description available for this place.';
                    } catch (error) {
                      console.error('Knowledge Graph API error:', error);
                      description = 'No description available for this place.';
                    }
                  }

                  setIsLoading(false);

                  navigation.navigate('PlacesScreen', {
                    placeId: details.place_id,
                    name: data.description,
                    address: details.formatted_address,
                    location: details.geometry?.location,
                    photos: details.photos,
                    details: details,
                    description: description,
                  });
                }}
                query={{
                  key: 'AIzaSyAcrTZPToPzWZJhtGgehxe3MYxhkUN_W0U',
                  language: 'en',
                  types: 'geocode',
                }}
                styles={{
                  container: {
                    marginTop: 10,
                    marginHorizontal: 10,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: 'teal',
                    backgroundColor: '#fff',
                    position: 'relative',
                    marginLeft: -5,
                    marginRight: 40,
                  },
                  textInput: {
                    height: 40,
                    fontSize: 16,
                    borderRadius: 10,
                  },
                  textInputContainer: {
                    borderTopWidth: 0,
                    borderBottomWidth: 0,
                  },
                  listView: {
                    borderRadius: 10,
                    elevation: 10,
                    zIndex: 10,
                    position: 'absolute',
                    top: 50,
                    left: 0,
                    right: 0,
                    backgroundColor: '#fff',
                  },
                }}
              />
            )}
          </Animated.View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text
              style={{
                fontSize: 25,
                fontWeight: 'bold',
                marginLeft: 5,
                color: isDarkMode ? 'white' : 'black',
              }}>
              My Trips
            </Text>

            <Animated.View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                opacity,
                paddingRight: 15,
              }}>
              <MaterialCommunityIcons
                name="arrow-left"
                size={13}
                color={isDarkMode ? '#ccc' : 'gray'}
              />
              <Text
                style={{
                  fontSize: 13,
                  color: isDarkMode ? '#ccc' : 'gray',
                  marginLeft: 3,
                }}>
                Swipe left to delete Trip
              </Text>
            </Animated.View>
          </View>

          <Text
            style={{
              marginTop: 6,
              fontSize: 19,
              color: '#00BCC4',
              fontWeight: '600',
              marginLeft: 5,
            }}>
            {currentYear}
          </Text>
        </View>

        <View style={{padding: 15}}>
          {loadingTrips ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            trips?.map((item, index) => (
              <Swipeable
                key={item._id}
                ref={ref => (swipeableRefs.current[item._id] = ref)}
                renderRightActions={() => renderRightActions(item._id)}>
                <Pressable
                  key={item.id || index}
                  style={{marginTop: 15}}
                  onPress={() => {
                    navigation.navigate('Plan', {
                      item: item,
                      user: user,
                    });
                  }}>
                  <ImageBackground
                    imageStyle={{borderRadius: 10}}
                    style={{width: '100%', height: 220}}
                    source={{
                      uri: item?.background,
                    }}>
                    <View
                      style={{
                        padding: 15,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                      <Text
                        style={{
                          fontSize: 17,
                          color: 'white',
                          fontWeight: 'bold',
                        }}>
                        {item?.startDate} - {item?.endDate}
                      </Text>
                      <Text
                        style={{
                          fontSize: 17,
                          color: 'white',
                          fontWeight: 'bold',
                        }}>
                        {moment(item.createdAt).format('MMMM Do')}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 19,
                        fontWeight: 'bold',
                        color: 'white',
                        marginHorizontal: 15,
                      }}>
                      {item?.tripName}
                    </Text>
                  </ImageBackground>
                </Pressable>
              </Swipeable>
            ))
          )}
        </View>

        <View style={{padding: 10}}>
          <Image
            style={{
              width: 420,
              height: 220,
              alignSelf: 'center',
              borderRadius: 20,
            }}
            resizeMode="stretch"
            source={{
              uri: 'https://res.cloudinary.com/dvqaaywos/image/upload/v1746211340/travel-around-the-world-landmark-design-famous-landmarks-around-the-world-elements-with-travel-vacation-text-in-blue-background-illustration-vector_tqenvq.jpg',
            }}
          />
        </View>

        <View
          style={{
            marginTop: 20,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontSize: 17,
              fontWeight: '600',
              textAlign: 'center',
              color: isDarkMode ? '#fff' : '#000',
            }}>
            Organize your next trip
          </Text>

          <Text
            style={{
              marginTop: 15,
              color: isDarkMode ? '#aaa' : 'gray',
              width: 250,
              textAlign: 'center',
              fontSize: 16,
            }}>
            Create your next trip and plan the activities of your itinerary
          </Text>

          <Pressable
            onPress={() => navigation.navigate('Create')}
            style={{
              marginTop: 25,
              backgroundColor: isDarkMode ? '#fff' : '#000',
              padding: 14,
              width: 200,
              borderRadius: 25,
            }}>
            <Text
              style={{
                textAlign: 'center',
                color: isDarkMode ? '#000' : '#fff',
                fontSize: 16,
                fontWeight: '600',
              }}>
              Create a Trip
            </Text>
          </Pressable>
        </View>
        <Modal
          visible={customModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={handleCloseModal}>
          <View style={currentStyles.modalOverlay}>
            <View style={currentStyles.modalContent}>
              <ScrollView
                contentContainerStyle={currentStyles.modalTextContainer}>
                <Text style={currentStyles.modalMessage}>{modalMessage}</Text>
              </ScrollView>

              {showDeleteConfirm ? (
                <View style={currentStyles.confirmButtonContainer}>
                  <TouchableOpacity
                    onPress={() => {
                      setCustomModalVisible(false);
                      setShowDeleteConfirm(false);
                      setOnModalClose(null);
                    }}
                    style={[
                      currentStyles.modalButton,
                      currentStyles.cancelButton,
                    ]}>
                    <Text style={currentStyles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={async () => {
                      setCustomModalVisible(false);
                      setShowDeleteConfirm(false);

                      if (typeof onModalClose === 'function') {
                        const callback = onModalClose;
                        setOnModalClose(null);
                        await callback();
                      }
                    }}
                    style={currentStyles.modalButton}>
                    <Text style={currentStyles.modalButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleCloseModal}
                  style={currentStyles.modalButton}>
                  <Text style={currentStyles.modalButtonText}>Close</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
