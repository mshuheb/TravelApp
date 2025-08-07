import {
  Text,
  View,
  ScrollView,
  Pressable,
  Image,
  Linking,
  ActivityIndicator,
} from 'react-native';
import React, {useState, useEffect, useCallback, useContext} from 'react';
import axios from 'axios';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {DarkModeContext} from '../AuthContext';
import styles from '../styles/DinRestStyles';

const DinRest = ({fetchDetails, places}) => {
  const [recommendedRestaurants, setRecommendedRestaurants] = useState([]);
  const [restaurantDetails, setRestaurantDetails] = useState([]);
  const {isDarkMode, toggleDarkMode} = useContext(DarkModeContext);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!places?.length) return;

    const {latitude, longitude} = {
      latitude: places[0].geometry.location.lat,
      longitude: places[0].geometry.location.lng,
    };

    const fetchRecommendedRestaurants = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
          {
            params: {
              location: `${latitude},${longitude}`,
              radius: 10000,
              type: 'restaurant',
              key: 'AIzaSyAcrTZPToPzWZJhtGgehxe3MYxhkUN_W0U',
            },
          },
        );

        setRecommendedRestaurants(response.data.results.slice(0, 10));
      } catch (error) {
        console.error('Error fetching recommended restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedRestaurants();
  }, [places]);

  const fetchAllRestaurantDetails = useCallback(async () => {
    if (recommendedRestaurants.length > 0) {
      setLoading(true);
      const detailsPromises = recommendedRestaurants.map(place =>
        fetchDetails(place.place_id),
      );
      const fetchedDetails = await Promise.all(detailsPromises);
      setRestaurantDetails(fetchedDetails.filter(details => details !== null));
      setLoading(false);
    }
  }, [recommendedRestaurants, fetchDetails]);

  useEffect(() => {
    if (recommendedRestaurants.length > 0) {
      fetchAllRestaurantDetails();
    }
  }, [recommendedRestaurants, fetchAllRestaurantDetails]);

  const [expandedItem, setExpandedItem] = useState(null);

  const toggleExpand = index => {
    setExpandedItem(expandedItem === index ? null : index);
  };

  const currentStyles = styles(isDarkMode);
  if (loading) {
    return (
      <View
        style={[
          currentStyles.loadingContainer,
          {marginHorizontal: 10, marginVertical: 15},
        ]}>
        <ActivityIndicator
          size="large"
          color={currentStyles.loadingIndicator.color}
        />
        <Text style={currentStyles.loadingText}>Loading Restaurants...</Text>
      </View>
    );
  }

  if (!loading && (!restaurantDetails || restaurantDetails.length === 0)) {
    return (
      <View
        style={[
          currentStyles.emptyContainer,
          {marginHorizontal: 10, marginVertical: 15},
        ]}>
        <Text style={currentStyles.emptyText}>No restaurants found.</Text>
        <Text style={currentStyles.emptySubText}>
          Add places to see them here.
        </Text>
      </View>
    );
  }

  return (
    <View style={{marginHorizontal: 10, marginVertical: 15}}>
      {restaurantDetails && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 50}}>
          {restaurantDetails.map((item, index) => {
            const firstPhoto = item?.photos?.[0];
            const imageUrl = firstPhoto
              ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${firstPhoto.photo_reference}&key=AIzaSyAcrTZPToPzWZJhtGgehxe3MYxhkUN_W0U`
              : null;

            return (
              <Pressable
                key={index}
                style={currentStyles.container}
                onPress={() => toggleExpand(index)}>
                <View style={currentStyles.header}>
                  {/* Left Section: Index and Name */}
                  <View style={{flex: 1}}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 7,
                      }}>
                      <View style={currentStyles.indexCircle}>
                        <Text style={currentStyles.indexText}>{index + 1}</Text>
                      </View>
                      <Text
                        numberOfLines={2}
                        style={currentStyles.restaurantName}>
                        {item?.name}
                      </Text>
                    </View>
                    <Text numberOfLines={3} style={currentStyles.reviewText}>
                      {item?.reviews?.length > 0
                        ? item.reviews[0].text
                        : 'No reviews available'}
                    </Text>
                  </View>

                  {/* Right Section: Image */}
                  <View>
                    {imageUrl ? (
                      <Image
                        source={{uri: imageUrl}}
                        style={currentStyles.image}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={currentStyles.noImage}>
                        <Text style={currentStyles.noImageText}>No Image</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Expanded Section */}
                {expandedItem === index && (
                  <View>
                    {item?.formatted_phone_number && (
                      <View style={currentStyles.row}>
                        <AntDesign name="phone" size={23} color="#2a52be" />
                        <Text style={currentStyles.detailText}>
                          {item?.formatted_phone_number}
                        </Text>
                      </View>
                    )}
                    <View style={currentStyles.row}>
                      <Ionicons name="time-outline" size={23} color="#2a52be" />
                      <Text style={currentStyles.detailText}>
                        <Text style={{color: 'green'}}>Open </Text>
                        <Text style={{fontWeight: 'bold'}}>
                          {item?.opening_hours?.weekday_text?.[0] ||
                            'Hours Not Provided'}
                        </Text>
                      </Text>
                    </View>
                    <View style={currentStyles.row}>
                      <Ionicons name="earth" size={23} color="#2a52be" />
                      {item?.website ? (
                        <Text
                          style={currentStyles.website}
                          onPress={() => Linking.openURL(item.website)}>
                          {item.website}
                        </Text>
                      ) : (
                        <Text style={currentStyles.detailText}>
                          No website available
                        </Text>
                      )}
                    </View>
                    {item?.formatted_address && (
                      <View style={currentStyles.row}>
                        <Entypo name="location" size={23} color="#2a52be" />
                        <Text style={currentStyles.detailText}>
                          {item?.formatted_address}
                        </Text>
                      </View>
                    )}
                    {item?.types && (
                      <View style={currentStyles.tagsContainer}>
                        {item?.types?.map((tag, idx) => (
                          <View key={idx} style={currentStyles.tag}>
                            <Text style={currentStyles.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

export default DinRest;
