import {
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Pressable,
  TextInput,
  Button,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import React, {useContext, useEffect, useState, useMemo} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import DateRangePicker from 'react-native-daterange-picker';
import moment from 'moment-timezone';
import axios from 'axios';
import {AuthContext, DarkModeContext} from '../AuthContext';
import {BackHandler} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import styles from '../styles/CreateTripStyles';

const CreateTrip = () => {
  const images = [
    {
      id: '0',
      image:
        'https://res.cloudinary.com/dvqaaywos/image/upload/v1743233586/TripPlanner/jg0uscftsqbdxq6jmn4f.jpg',
    },
    {
      id: '1',
      image:
        'https://res.cloudinary.com/dvqaaywos/image/upload/v1743232996/TripPlanner/yc8m5ln1bvrdo9ixgeud.jpg',
    },
    {
      id: '2',
      image:
        'https://res.cloudinary.com/dvqaaywos/image/upload/v1743232996/TripPlanner/nw6iyz5ac1ufsfnhmyw0.jpg',
    },
    {
      id: '3',
      image:
        'https://res.cloudinary.com/dvqaaywos/image/upload/v1743232996/TripPlanner/eemhkpkmqgpi8avaapew.jpg',
    },
    {
      id: '4',
      image:
        'https://res.cloudinary.com/dvqaaywos/image/upload/v1743232996/TripPlanner/b7kz3e3lplpyjt3lime2.jpg',
    },
    {
      id: '5',
      image:
        'https://res.cloudinary.com/dvqaaywos/image/upload/v1743232996/TripPlanner/fxi7sqmvyeq4i3rvmmrr.jpg',
    },
    {
      id: '6',
      image:
        'https://res.cloudinary.com/dvqaaywos/image/upload/v1743232995/TripPlanner/wpc9cqdphyl9kdjakqcv.jpg',
    },
    {
      id: '7',
      image:
        'https://res.cloudinary.com/dvqaaywos/image/upload/v1743232995/TripPlanner/gdrogea1fdyp0hyktute.jpg',
    },
    {
      id: '8',
      image:
        'https://res.cloudinary.com/dvqaaywos/image/upload/v1743233711/TripPlanner/sh6cc6susnqcon4fgtgh.jpg',
    },
    {
      id: '9',
      image:
        'https://res.cloudinary.com/dvqaaywos/image/upload/v1743190763/TripPlanner/mhcz5fo3kea9b8sn7m3e.jpg',
    },
  ];

  useEffect(() => {
    const backAction = () => {
      navigation.navigate('Home');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);
  const route = useRoute();
  const [tripName, setTripName] = useState('');
  const [image, setImage] = useState('');
  const navigation = useNavigation();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [displayedDate, setDisplayedDate] = useState(moment());
  const [startDay, setStartDay] = useState('');
  const [endDay, setEndDay] = useState('');
  const [background, setBackground] = useState(images[0].image);
  const {userId, setUserId, setToken, userInfo, setUserInfo} =
    useContext(AuthContext);
  const {isDarkMode, toggleDarkMode} = useContext(DarkModeContext);

  useEffect(() => {
    if (route?.params?.image) {
      setBackground(route?.params?.image);
    }
  }, [route?.params]);

  useEffect(() => {
    if (route?.params?.image) {
      setBackground(route?.params?.image);
    }
    if (route?.params?.tripName) {
      setTripName(route?.params?.tripName);
    }
    if (route?.params?.startDate) {
      setStartDate(route?.params?.startDate);
    }
    if (route?.params?.endDate) {
      setEndDate(route?.params?.endDate);
    }
    if (route?.params?.startDay) {
      setStartDay(route?.params?.startDay);
    }
    if (route?.params?.endDay) {
      setEndDay(route?.params?.endDay);
    }
    if (route?.params?.selectedTimeZone) {
      setSelectedTimeZone(route?.params?.selectedTimeZone);
    }
  }, [route?.params]);

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

  const handleCreateTrip = async () => {
    if (!tripName || !startDate || !endDate) {
      showModal('Please fill all fields');
      return;
    }

    const tripData = {
      tripName,
      startDate,
      endDate,
      startDay,
      endDay,
      background,
      host: userId,
    };

    try {
      const response = await axios.post(
        'http://192.168.31.48:8000/trip',
        tripData,
      );
      console.log('Trip created successfully:', response.data);

      showModal('Trip created successfully', () => {
        navigation.navigate('Home');
      });
    } catch (error) {
      console.error(
        'Error creating trip:',
        error.response ? error.response.data : error.message,
      );

      showModal('Failed to create the trip. Please try again.');
    }
  };

  const setDates = dates => {
    if (dates.startDate) {
      setStartDate(dates.startDate);
      setStartDay(moment(dates.startDate).format('dddd'));
    }
    if (dates.endDate) {
      setEndDate(dates.endDate);
      setEndDay(moment(dates.endDate).format('dddd'));
    }
    if (dates.displayedDate) {
      setDisplayedDate(dates.displayedDate);
    }
  };

  const formatDate = date => {
    if (date) {
      return moment(date).format('DD MMMM YYYY');
    }
    return '';
  };

  console.log(displayedDate);

  const customButton = onConfirm => {
    return (
      <Button
        onPress={onConfirm}
        style={{
          container: {width: '80%', marginHorizontal: '3%'},
          text: {fontSize: 20},
        }}
        primary
        title="Submit"
      />
    );
  };

  const darkImages = [
    images[0].image,
    images[1].image,
    images[2].image,
    images[8].image,
    images[9].image,
  ];

  const timeZones = moment.tz.names().map(tz => ({label: tz, value: tz}));

  const [open, setOpen] = useState(false);
  const [selectedTimeZone, setSelectedTimeZone] = useState('Asia/Kolkata');
  const items = useMemo(() => {
    return moment.tz.names().map(tz => ({label: tz, value: tz}));
  }, []);

  const textColor = darkImages.includes(background) ? 'black' : 'white';

  const currentStyles = styles(isDarkMode);

  return (
    <SafeAreaView>
      <ImageBackground
        style={{width: '100%', height: '100%'}}
        source={{
          uri: background ? background : image,
        }}>
        <View
          style={{
            padding: 15,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.7}>
            <Text
              style={{
                color: textColor,
                fontSize: 16,
                fontWeight: '600',
                padding: 10,
              }}>
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCreateTrip}
            activeOpacity={0.7}
            style={{padding: 10, borderRadius: 25}}>
            <Text
              style={{
                textAlign: 'center',
                color: textColor,
                fontSize: 16,
                fontWeight: '500',
                padding: 10,
              }}>
              Create
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{padding: 15}}>
          <DateRangePicker
            onChange={setDates}
            endDate={endDate}
            startDate={startDate}
            displayedDate={displayedDate}
            range
            containerStyle={{
              backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
            }}
            headerTextStyle={{
              color: isDarkMode ? '#fff' : '#000',
            }}
            dayTextStyle={{
              color: isDarkMode ? '#fff' : '#000',
            }}
            selectedDayStyle={{
              backgroundColor: '#720e9e',
            }}
            selectedDayTextStyle={{
              color: '#fff',
              fontWeight: 'bold',
            }}
            dayHeaderTextStyle={{
              color: isDarkMode ? '#fff' : '#000',
            }}>
            <AntDesign name="calendar" size={25} color={textColor} />
          </DateRangePicker>
          <View>
            <View>
              <TextInput
                value={tripName}
                onChangeText={setTripName}
                placeholderTextColor={textColor}
                style={{fontSize: 25, fontWeight: 'bold', color: textColor}}
                placeholder="Trip name"
              />
            </View>

            <View
              style={{
                backgroundColor: '#c1c9d6',
                marginVertical: 15,
                borderRadius: 20,
              }}>
              <View
                style={{
                  padding: 15,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 7,
                }}>
                <AntDesign name="calendar" size={25} color="black" />
                <Text style={{fontSize: 16, color: '#505050'}}>Itinerary</Text>
              </View>

              <View style={{borderColor: '#e0e0e0', borderWidth: 1}} />

              <View
                style={{
                  padding: 15,
                }}>
                <Pressable
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 20,
                    justifyContent: 'space-between',
                  }}>
                  <View>
                    <Text style={{color: '#505050'}}>
                      {startDate ? startDay : 'Starts'}
                    </Text>
                    <Text style={{marginTop: 6, fontSize: 15}}>
                      {startDate ? formatDate(startDate) : 'Set Dates'}
                    </Text>
                  </View>

                  <AntDesign name="arrowright" size={20} color="black" />

                  <View>
                    <Text style={{color: '#505050'}}>
                      {endDay ? endDay : 'Starts'}
                    </Text>
                    <Text style={{marginTop: 6, fontSize: 15}}>
                      {endDate ? formatDate(endDate) : 'End Dates'}
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 20,
              }}>
              <View style={currentStyles.container}>
                <AntDesign name="earth" size={25} color="black" />
                <Text style={currentStyles.label}>TimeZone</Text>

                <DropDownPicker
                  open={open}
                  value={selectedTimeZone}
                  items={items}
                  setOpen={setOpen}
                  setValue={setSelectedTimeZone}
                  searchable={true}
                  placeholder="Select a timezone"
                  style={[
                    currentStyles.picker,
                    {backgroundColor: '#c1c9d6', borderRadius: 10},
                  ]}
                  dropDownContainerStyle={currentStyles.dropDownContainer}
                />
                <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                  <Text style={currentStyles.label}>Selected: </Text>
                  <Text
                    style={[currentStyles.selectedTimeZone, {flexShrink: 1}]}>
                    {selectedTimeZone}
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() =>
                  navigation.navigate('Choose', {
                    tripName: tripName,
                    startDate: startDate,
                    endDate: endDate,
                    startDay: startDay,
                    endDay: endDay,
                    image: background,
                    selectedTimeZone: selectedTimeZone,
                  })
                }
                style={{
                  flex: 1,
                  backgroundColor: '#c1c9d6',
                  borderRadius: 20,
                  padding: 15,
                  height: 200,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <FontAwesome name="photo" size={25} color="black" />
                <Text
                  style={{
                    marginTop: 10,
                    fontSize: 15,
                    fontWeight: '600',
                    color: '#505050',
                  }}>
                  Choose Image
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ImageBackground>
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
    </SafeAreaView>
  );
};

export default CreateTrip;
