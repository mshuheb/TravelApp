import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';
import {createContext, useEffect, useState} from 'react';
import {useColorScheme} from 'react-native';

const AuthContext = createContext();
const DarkModeContext = createContext();

const AuthProvider = ({children}) => {
  const systemColorScheme = useColorScheme();

  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const isLoggedIn = async () => {
    try {
      const userToken = await AsyncStorage.getItem('authToken');
      const storedDarkMode = await AsyncStorage.getItem('darkMode');

      if (storedDarkMode !== null) {
        setIsDarkMode(JSON.parse(storedDarkMode));
      } else {
        setIsDarkMode(systemColorScheme === 'dark');
      }

      setToken(userToken);
    } catch (error) {
      console.log('error', error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          const userId = decodedToken.userId;
          setUserId(userId);
        } catch (e) {
          console.error('Error decoding token', e);
          await AsyncStorage.removeItem('authToken');
          setToken('');
          setUserId('');
        }
      }
    };

    fetchUser();
  }, []);

  const clearAuthToken = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      setToken('');
      setUserId('');
    } catch (error) {
      console.log('Error', error);
    }
  };

  const toggleDarkMode = async () => {
    try {
      const newDarkMode = !isDarkMode;
      setIsDarkMode(newDarkMode);
      await AsyncStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    } catch (error) {
      console.error('Failed to toggle dark mode:', error);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, [systemColorScheme]);

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        userId,
        setUserId,
        userInfo,
        setUserInfo,
        clearAuthToken,
      }}>
      <DarkModeContext.Provider value={{isDarkMode, toggleDarkMode}}>
        {children}
      </DarkModeContext.Provider>
    </AuthContext.Provider>
  );
};

export {AuthContext, AuthProvider, DarkModeContext};
