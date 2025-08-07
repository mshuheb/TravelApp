import React, {useState, useContext, useEffect} from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  Pressable,
  Image,
  Animated,
  Modal,
  TouchableOpacity,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import {Swipeable} from 'react-native-gesture-handler';
import AntDesign from 'react-native-vector-icons/AntDesign';
import axios from 'axios';
import useBlinkingAnimation from '../hooks/useBlinkingAnimation';
import {AuthContext, DarkModeContext} from '../AuthContext';
import {fetchHost} from '../utils/fetchHost';
import styles from '../styles/ItineraryStyles';

const Itinerary = ({route, itinerary, setOpenModal, refreshItinerary}) => {
  const opacity = useBlinkingAnimation(5000);
  const formatDate = date => {
    return moment(date).format('D MMMM');
  };

  const [expandedDates, setExpandedDates] = useState(
    route?.params?.item?.itinerary?.reduce((acc, item) => {
      acc[item.date] = true;
      return acc;
    }, {}),
  );

  const toggleExpand = date => {
    setExpandedDates(prev => ({
      ...prev,
      [date]: !prev[date],
    }));
  };
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  const toggleDescription = key => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [onModalClose, setOnModalClose] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const {isDarkMode, toggleDarkMode} = useContext(DarkModeContext);

  const handleCloseModal = () => {
    setCustomModalVisible(false);
    setShowDeleteConfirm(false);
    if (typeof onModalClose === 'function') {
      onModalClose();
      setOnModalClose(null);
    }
  };

  const showModal = (message, callback = null) => {
    setModalMessage(message);
    setCustomModalVisible(true);
    setOnModalClose(() => callback);
  };

  const handleDeleteActivity = (tripId, activityId) => {
    if (!tripId || !activityId) {
      console.error('Missing required parameters:', {tripId, activityId});
      showModal('Required information is missing.');
      return;
    }

    setModalMessage('Are you sure you want to remove this activity?');
    setCustomModalVisible(true);
    setShowDeleteConfirm(true);

    setOnModalClose(() => async () => {
      try {
        const response = await axios.delete(
          `https://travelapp-32u1.onrender.com/trips/${tripId}/itinerary/${activityId}`,
        );

        console.log('Delete response:', response.data);
        showModal('Activity deleted successfully.', () => {
          if (typeof refreshItinerary === 'function') {
            refreshItinerary();
          }
        });
      } catch (error) {
        console.error(
          'Error deleting activity:',
          error.response?.data || error.message,
        );
        showModal('Failed to delete the activity. Please try again.');
      }
    });
  };

  const [isHost, setIsHost] = useState(false);
  const [hostData, setHostData] = useState(null);
  const {userId} = useContext(AuthContext);
  const tripId = route?.params?.item?._id;
  const [isHostLoading, setIsHostLoading] = useState(true);

  useEffect(() => {
    if (tripId && userId) {
      setIsHostLoading(true);
      fetchHost(tripId, userId, ({isHost, hostData}) => {
        setIsHost(isHost);
        setHostData(hostData);
        setIsHostLoading(false);
      });
    }
  }, [tripId, userId]);

  const renderRightActions = (tripId, activity) => {
    return (
      <View style={currentStyles.rightAction}>
        <Pressable
          onPress={() => handleDeleteActivity(tripId, activity._id)}
          style={currentStyles.deleteButton}>
          <AntDesign name="delete" size={24} color="white" />
        </Pressable>
      </View>
    );
  };

  const currentStyles = styles(isDarkMode);

  return (
    <ScrollView
      style={{marginTop: 15, borderRadius: 10}}
      contentContainerStyle={{paddingBottom: 50}}>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
        {route?.params?.item?.itinerary?.map((item, index) => (
          <View
            key={index}
            style={{
              padding: 10,
              borderRadius: 8,
              marginBottom: 7,
              backgroundColor: 'orange',
              marginLeft: 10,
            }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: '500',
                textAlign: 'center',
                color: 'white',
              }}>
              {formatDate(item.date)}
            </Text>
          </View>
        ))}
      </View>

      <View>
        {route?.params?.item?.itinerary?.map((item, index) => (
          <View
            key={index}
            style={{
              padding: 10,
              borderRadius: 8,
              marginBottom: 7,
              backgroundColor: isDarkMode ? '#2C2C2C' : 'white',
              marginVertical: 10,
            }}>
            {/* Clickable Date Header to Expand/Collapse */}
            <Pressable
              onPress={() => toggleExpand(item.date)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                justifyContent: 'space-between',
              }}>
              <View
                style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                <Text
                  style={{
                    fontSize: 27,
                    fontWeight: 'bold',
                    color: isDarkMode ? 'white' : 'black',
                  }}>
                  {formatDate(item.date)}
                </Text>
              </View>
              {isHost && (
                <View style={{marginRight: -100}}>
                  <Animated.View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      opacity,
                    }}>
                    <MaterialCommunityIcons
                      name="arrow-left"
                      size={13}
                      color={isDarkMode ? 'lightgray' : 'gray'}
                    />
                    <Text
                      style={{
                        fontSize: 13,
                        color: isDarkMode ? 'lightgray' : 'gray',
                        marginLeft: 3,
                      }}>
                      Swipe left to delete place
                    </Text>
                  </Animated.View>
                </View>
              )}

              {/* Expand/Collapse Icon */}
              <MaterialIcons
                name={expandedDates[item.date] ? 'expand-less' : 'expand-more'}
                size={24}
                color={isDarkMode ? 'lightgray' : 'gray'}
              />
            </Pressable>

            {/* Activities - Shown only if expanded */}
            {expandedDates[item.date] && (
              <View>
                {itinerary?.some(place => place.date === item?.date)
                  ? itinerary
                      ?.filter(place => place.date === item?.date)
                      .map(filteredItem =>
                        filteredItem.activities.length > 0
                          ? filteredItem.activities.map(
                              (activity, activityIndex) => {
                                const uniqueKey = `${item.date}-${activityIndex}`;

                                return (
                                  <Swipeable
                                    key={uniqueKey}
                                    enabled={isHost}
                                    renderRightActions={() =>
                                      renderRightActions(
                                        route?.params?.item?._id,
                                        activity,
                                      )
                                    }>
                                    <Pressable
                                      key={activityIndex}
                                      style={{marginTop: 12}}>
                                      <View
                                        style={{
                                          flexDirection: 'row',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          padding: 10,
                                        }}>
                                        <View style={{flex: 1}}>
                                          <View
                                            style={{
                                              flexDirection: 'row',
                                              alignItems: 'center',
                                              gap: 7,
                                            }}>
                                            <View
                                              style={{
                                                width: 30,
                                                height: 30,
                                                borderRadius: 15,
                                                backgroundColor: '#0066b2',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                              }}>
                                              <Text
                                                style={{
                                                  color: 'white',
                                                  fontWeight: '500',
                                                }}>
                                                {activityIndex + 1}
                                              </Text>
                                            </View>

                                            <Text
                                              style={{
                                                fontSize: 16,
                                                fontWeight: '500',
                                                color: isDarkMode
                                                  ? 'lightgray'
                                                  : 'black',
                                              }}>
                                              {activity?.name}
                                            </Text>
                                          </View>

                                          {/* Expandable Description */}
                                          <Pressable
                                            onPress={() =>
                                              toggleDescription(uniqueKey)
                                            }>
                                            <Text
                                              style={{
                                                color: isDarkMode
                                                  ? 'white'
                                                  : 'gray',
                                                marginTop: 7,
                                                width: '80%',
                                              }}
                                              numberOfLines={
                                                expandedDescriptions[uniqueKey]
                                                  ? undefined
                                                  : 2
                                              }>
                                              {activity?.briefDescription}
                                            </Text>
                                          </Pressable>
                                        </View>

                                        <View>
                                          {activity?.photos?.length > 0 &&
                                          activity.photos[0] ? (
                                            <Image
                                              source={{uri: activity.photos[0]}}
                                              style={{
                                                width: 100,
                                                height: 100,
                                                borderRadius: 10,
                                              }}
                                              resizeMode="cover"
                                            />
                                          ) : (
                                            <View
                                              style={{
                                                width: 100,
                                                height: 100,
                                                borderRadius: 10,
                                                backgroundColor: '#f0f0f0',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                              }}>
                                              <Text
                                                style={{
                                                  color: '#888',
                                                  fontSize: 12,
                                                  textAlign: 'center',
                                                }}>
                                                No Image Available
                                              </Text>
                                            </View>
                                          )}
                                        </View>
                                      </View>
                                    </Pressable>
                                  </Swipeable>
                                );
                              },
                            )
                          : !isHost && (
                              <Text
                                key={filteredItem.date}
                                style={{
                                  marginTop: 10,
                                  fontSize: 16,
                                  color: isDarkMode ? 'white' : 'gray',
                                  marginLeft: 10,
                                }}>
                                No places added
                              </Text>
                            ),
                      )
                  : !isHost && (
                      <Text
                        style={{
                          marginTop: 10,
                          fontSize: 16,
                          color: isDarkMode ? 'white' : 'gray',
                          marginLeft: 10,
                        }}>
                        No places added
                      </Text>
                    )}
              </View>
            )}

            {/* "Add a place" input section */}
            {expandedDates[item.date] && (
              <>
                {isHost && (
                  <View
                    style={{
                      marginTop: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                      width: 400,
                    }}>
                    <Pressable
                      onPress={() => setOpenModal(item)}
                      style={{
                        padding: 10,
                        borderRadius: 10,
                        backgroundColor: isDarkMode ? '#4A4A4A' : '#F0F0F0',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 5,
                        flex: 1,
                      }}>
                      <MaterialIcons
                        name="location-pin"
                        size={25}
                        color={isDarkMode ? 'lightgray' : 'gray'}
                      />
                      <TextInput
                        placeholderTextColor={
                          isDarkMode ? 'lightgray' : 'black'
                        }
                        placeholder="Add a place"
                      />
                    </Pressable>
                  </View>
                )}
              </>
            )}
          </View>
        ))}
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
  );
};

export default Itinerary;
