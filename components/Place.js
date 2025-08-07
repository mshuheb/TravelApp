import {
  Text,
  View,
  Pressable,
  Image,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, {useState, useEffect, useContext} from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import {Swipeable} from 'react-native-gesture-handler';
import {fetchHost} from '../utils/fetchHost';
import {AuthContext, DarkModeContext} from '../AuthContext';
import styles from '../styles/PlaceStyles';

const Place = ({
  item,
  items,
  setItems,
  index,
  refreshPlaces,
  refreshItinerary,
  route,
}) => {
  const [places, setPlaces] = useState([]);
  const choosePlaces = name => {
    setItems(prevItems => {
      if (prevItems.includes(name)) {
        return prevItems.filter(item => item !== name);
      } else {
        return [...prevItems, name];
      }
    });
  };

  const [isHost, setIsHost] = useState(false);
  const [hostData, setHostData] = useState(null);
  const {userId} = useContext(AuthContext);
  const tripId = route?.params?.item?._id;
  const [isHostLoading, setIsHostLoading] = useState(true);
  const {isDarkMode, toggleDarkMode} = useContext(DarkModeContext);

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

  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [onModalClose, setOnModalClose] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
  const handleDelete = () => {
    console.log('Place ID:', item._id);

    if (!item._id) {
      console.error('Missing placeId:', {placeId: item._id});
      showModal('Place ID is missing.');
      return;
    }
    setModalMessage(`Are you sure you want to remove ${item.name}?`);
    setCustomModalVisible(true);
    setShowDeleteConfirm(true);

    setOnModalClose(() => async () => {
      try {
        const response = await axios.delete(
          `http://192.168.31.48:8000/removePlace/${item._id}`,
          {headers: {'Content-Type': 'application/json'}},
        );
        console.log('Delete response:', response.data);

        showModal('Place deleted successfully.', () => {
          if (typeof refreshPlaces === 'function') {
            refreshPlaces();
          }
          if (typeof refreshItinerary === 'function') {
            refreshItinerary();
          }
        });
      } catch (error) {
        console.error(
          'Error deleting place:',
          error.response?.data || error.message,
        );
        showModal('Failed to delete the place. Please try again.');
      }
    });
  };

  const renderRightActions = () => (
    <View style={currentStyles.rightAction}>
      <Pressable onPress={handleDelete} style={currentStyles.deleteButton}>
        <AntDesign name="delete" size={24} color="white" />
      </Pressable>
    </View>
  );

  const currentStyles = styles(isDarkMode);

  return (
    <Swipeable enabled={isHost} renderRightActions={renderRightActions}>
      <Pressable
        onPress={() => choosePlaces(item?.name)}
        key={index}
        style={{marginTop: 12}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 10,
            backgroundColor: isDarkMode ? '#2e2e2e' : 'white',
          }}>
          <View style={{flex: 1}}>
            {/* Allow this view to take available space */}
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
                  {index + 1}
                </Text>
              </View>

              <Text
                numberOfLines={2}
                style={{
                  fontSize: 16,
                  fontWeight: '500',
                  width: '82%',
                  color: isDarkMode ? 'lightgray' : 'black',
                }}>
                {item?.name}
              </Text>
            </View>
            <Text
              numberOfLines={3}
              style={{
                color: isDarkMode ? 'lightgray' : 'gray',
                marginTop: 7,
                width: '80%',
              }}>
              {item?.briefDescription}
            </Text>
          </View>
          <View>
            {/* Only show the first image from the photos array */}
            {item.photos && item.photos.length > 0 && item.photos[0] ? (
              <Image
                source={{uri: item.photos[0]}}
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
                  backgroundColor: isDarkMode ? 'lightgray' : '#f0f0f0',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={{color: 'black', fontSize: 12, textAlign: 'center'}}>
                  No Image Available
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={{backgroundColor: isDarkMode ? '#2e2e2e' : 'white'}}>
          {items?.includes(item?.name) && (
            <>
              {item?.phoneNumber && (
                <View
                  style={{
                    marginHorizontal: 8,
                    marginBottom: 6,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  }}>
                  <AntDesign name="phone" size={23} color="#2a52be" />

                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#4B61D1',
                    }}>
                    {item?.phoneNumber}
                  </Text>
                </View>
              )}

              <View
                style={{
                  marginHorizontal: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}>
                <Ionicons name="time-outline" size={23} color="#2a52be" />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: '#4B61D1',
                  }}>
                  <Text>
                    <Text style={{color: 'green'}}>Open </Text>
                    <Text style={{fontWeight: 'bold'}}>
                      {item?.openingHours?.[0]?.includes(': ')
                        ? item.openingHours[0].split(': ')[1]
                        : 'Hours Not Provided'}
                    </Text>
                  </Text>
                </Text>
              </View>
              {item?.website && (
                <View
                  style={{
                    marginHorizontal: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    marginTop: 6,
                  }}>
                  <Ionicons name="earth" size={23} color="#2a52be" />

                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '400',
                      color: '#4B61D1',
                    }}>
                    {item?.website}
                  </Text>
                </View>
              )}

              {item?.formatted_address && (
                <View
                  style={{
                    marginHorizontal: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    marginTop: 8,
                  }}>
                  <Entypo name="location" size={23} color="#2a52be" />

                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '400',
                      color: '#4B61D1',
                      width: '95%',
                    }}>
                    {item?.formatted_address}
                  </Text>
                </View>
              )}

              {item?.types && (
                <View
                  style={{
                    marginHorizontal: 8,
                    marginBottom: 6,
                    marginTop: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    flexWrap: 'wrap',
                  }}>
                  {item?.types?.map((item, index) => (
                    <View
                      key={index}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 7,
                        borderRadius: 23,
                        backgroundColor: '#4B61D1',
                      }}>
                      <Text
                        style={{
                          textAlign: 'center',
                          color: 'white',
                          fontSize: 13,
                          fontWeight: '500',
                        }}>
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
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
      </Pressable>
    </Swipeable>
  );
};

export default Place;
