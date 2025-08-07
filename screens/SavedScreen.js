import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import React, {useEffect, useState, useContext} from 'react';
import axios from 'axios';
import {AuthContext, DarkModeContext} from '../AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useFocusEffect} from '@react-navigation/native';

const GOOGLE_API_KEY = 'AIzaSyAcrTZPToPzWZJhtGgehxe3MYxhkUN_W0U';

const fetchPlaceDetails = async placeId => {
  try {
    const res = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json`,
      {
        params: {
          place_id: placeId,
          fields:
            'name,photos,formatted_address,formatted_phone_number,website,opening_hours,reviews,geometry,types,editorial_summary',
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

const fetchDescriptionFromKGAPI = async placeName => {
  try {
    const kgResponse = await fetch(
      `https://kgsearch.googleapis.com/v1/entities:search?query=${encodeURIComponent(
        placeName,
      )}&key=${GOOGLE_API_KEY}&limit=1&indent=true`,
    );
    const kgData = await kgResponse.json();
    const kgResult = kgData.itemListElement?.[0]?.result;
    return (
      kgResult?.detailedDescription?.articleBody ||
      'No description available for this place.'
    );
  } catch (error) {
    console.error('Knowledge Graph API error:', error);
    return 'No description available for this place.';
  }
};

const SavedScreen = ({navigation}) => {
  const {userId} = useContext(AuthContext);
  const [wishlistPlaces, setWishlistPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const {isDarkMode, toggleDarkMode} = useContext(DarkModeContext);

  useFocusEffect(
    React.useCallback(() => {
      setIsNavigating(false);
    }, []),
  );

  useEffect(() => {
    if (!userId) return;

    const fetchWishlist = async () => {
      try {
        const res = await axios.get(`http://192.168.31.48:8000/user/${userId}`);
        const placeIds = res.data.wishlist || [];

        const placePromises = placeIds.map(async id => {
          const details = await fetchPlaceDetails(id);
          if (details) {
            const description =
              details.editorial_summary?.overview ||
              (await fetchDescriptionFromKGAPI(details.name));
            return {...details, place_id: id, description};
          }
          return null;
        });

        const places = await Promise.all(placePromises);
        const validPlaces = places.filter(place => place !== null);

        setWishlistPlaces(validPlaces);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [userId]);

  const currentStyles = styles(isDarkMode);

  const handlePlacePress = async place => {
    setIsNavigating(true);
    let description = place.editorial_summary?.overview;

    if (!description) {
      description = await fetchDescriptionFromKGAPI(place.name);
    }

    navigation.navigate('PlacesScreen', {
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address,
      location: place.geometry?.location,
      photos: place.photos,
      details: place,
      description: description,
    });
  };

  if (loading) {
    return (
      <View style={currentStyles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (wishlistPlaces.length === 0) {
    return (
      <View style={currentStyles.center}>
        <Text style={currentStyles.emptyText}>No saved places.</Text>
      </View>
    );
  }
  {
    isNavigating && (
      <View style={currentStyles.loadingOverlay}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={currentStyles.container}>
      <View style={currentStyles.headerRow}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={currentStyles.backButton}>
          <View style={currentStyles.backIconContainer}>
            <Ionicons name="arrow-back" size={20} color="black" />
          </View>
        </Pressable>

        <Text style={currentStyles.heading}>Your Saved Places</Text>
      </View>

      <FlatList
        data={wishlistPlaces}
        keyExtractor={item => item.place_id}
        contentContainerStyle={currentStyles.list}
        renderItem={({item}) => {
          const photoUrl =
            item.photos && item.photos.length > 0
              ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${item.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
              : null;

          return (
            <TouchableOpacity
              onPress={() => handlePlacePress(item)}
              style={currentStyles.card}>
              {photoUrl && (
                <Image source={{uri: photoUrl}} style={currentStyles.image} />
              )}
              <Text style={currentStyles.title}>{item.name}</Text>
              <Text style={currentStyles.subtitle}>
                {item.formatted_address}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
      {isNavigating && (
        <View style={currentStyles.loadingOverlay}>
          <ActivityIndicator
            size="large"
            color={isDarkMode ? '#fff' : '#000'}
          />
        </View>
      )}
    </View>
  );
};

export default SavedScreen;
