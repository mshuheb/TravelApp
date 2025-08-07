import {
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import React, {useEffect} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {BackHandler} from 'react-native';

const ChooseImage = () => {
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
  const navigation = useNavigation();
  const route = useRoute();

  const handleSelectImage = image => {
    navigation.navigate('Create', {
      image: image,
      tripName: route.params?.tripName,
      startDate: route.params?.startDate,
      endDate: route.params?.endDate,
      startDay: route.params?.startDay,
      endDay: route.params?.endDay,
      selectedTimeZone: route.params?.selectedTimeZone,
    });
  };

  useEffect(() => {
    const backAction = image => {
      navigation.navigate('Create', {
        image: image,
        tripName: route.params?.tripName,
        startDate: route.params?.startDate,
        endDate: route.params?.endDate,
        startDay: route.params?.startDay,
        endDay: route.params?.endDay,
        selectedTimeZone: route.params?.selectedTimeZone,
      });
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#484848'}}>
      <View style={{marginTop: 30}}>
        <Text
          style={{
            textAlign: 'center',
            marginTop: 15,
            color: 'white',
            fontSize: 16,
            fontWeight: '500',
          }}>
          Choose Image
        </Text>
      </View>
      <ScrollView>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
          {images?.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => handleSelectImage(item?.image)}
              style={{margin: 10}}>
              <Image
                style={{
                  width: 118,
                  height: 160,
                  resizeMode: 'cover',
                  borderRadius: 15,
                }}
                source={{uri: item?.image}}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChooseImage;
