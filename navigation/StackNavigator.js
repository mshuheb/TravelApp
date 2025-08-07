import {View, ActivityIndicator} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import CreateTrip from '../screens/CreateTrip';
import ChooseImage from '../screens/ChooseImage';
import TripPlanScreen from '../screens/TripPlanScreen';
import MapScreen from '../screens/MapScreen';
import AiAssistant from '../screens/AiAssistant';
import LoginScreen from '../screens/LoginScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AuthContext} from '../AuthContext';
import ExpenseDetails from '../screens/ExpenseDetails';
import PlacesScreen from '../screens/PlacesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SavedScreen from '../screens/SavedScreen';

const StackNavigator = () => {
  const Stack = createNativeStackNavigator();
  const [checkingAuth, setCheckingAuth] = useState(true);

  const {token} = useContext(AuthContext);
  console.log('heye', token);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        if (!token && storedToken) {
        }
      } catch (e) {
        console.error('Auth check error:', e);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, [token]);

  const AuthStack = () => {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    );
  };

  const MainStack = () => {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Plan"
          component={TripPlanScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Create"
          component={CreateTrip}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Choose"
          component={ChooseImage}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Map"
          component={MapScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Ai"
          component={AiAssistant}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ExpenseDetails"
          component={ExpenseDetails}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="PlacesScreen"
          component={PlacesScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Saved"
          component={SavedScreen}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    );
  };

  if (checkingAuth) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {token ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default StackNavigator;
