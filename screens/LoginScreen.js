import {
  Text,
  View,
  SafeAreaView,
  Image,
  Pressable,
  TextInput,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import React, {useContext, useState} from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AuthContext, DarkModeContext} from '../AuthContext';
import {LoginManager, AccessToken} from 'react-native-fbsdk-next';
import styles from '../styles/LoginScreenStyles';

GoogleSignin.configure({
  webClientId:
    '1019810450190-lbri2ne8utbkvvtdmhqd63a3l4qhh1hb.apps.googleusercontent.com',
  iosClientId:
    '847080271209-tugpe7mjovatdv0gp9dkdcdtdhinmpd3.apps.googleusercontent.com',
  scopes: ['profile', 'email'],
});

const LoginScreen = () => {
  const {token, setToken} = useContext(AuthContext);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [signInpassword, setSignInPassword] = useState('');
  const [signUppassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [onModalClose, setOnModalClose] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const {isDarkMode, toggleDarkMode} = useContext(DarkModeContext);

  const handleCloseModal = () => {
    setCustomModalVisible(false);
    setShowDeleteConfirm(false);
    if (typeof onModalClose === 'function') {
      const callback = onModalClose;
      setOnModalClose(null);
      callback();
    }
  };

  const showModal = (title, message, callback = null) => {
    setModalTitle(title);
    setModalMessage(message);
    setCustomModalVisible(true);
    setOnModalClose(() => callback);
  };

  const GoogleLogin = async () => {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    console.log('u', userInfo);
    return userInfo;
  };

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await GoogleSignin.signOut();
      const response = await GoogleLogin();
      const {idToken} = response;

      console.log('idToken:', idToken);
      const extractedIdToken = idToken || response.data.idToken;
      console.log('Extracted idToken from data:', extractedIdToken);

      if (extractedIdToken) {
        const backendResponse = await axios.post(
          'https://travelapp-32u1.onrender.com/google-login',
          {idToken: extractedIdToken},
        );

        const data = backendResponse.data;
        console.log('Backend Response:', backendResponse.data);

        await AsyncStorage.setItem('authToken', data.token);

        setToken(data.token);
      }
    } catch (error) {
      if (error.response?.status === 409) {
        showModal(error.response.data.message);
      } else {
        console.log('Facebook Login Error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const FacebookLogin = async () => {
    try {
      const result = await LoginManager.logInWithPermissions([
        'public_profile',
        'email',
      ]);
      if (result.isCancelled) {
        console.log('User cancelled login');
        return;
      }

      const data = await AccessToken.getCurrentAccessToken();
      if (!data) {
        console.log('Something went wrong obtaining access token');
        return;
      }

      const {accessToken} = data;
      console.log('Facebook Access Token:', accessToken);

      const backendResponse = await axios.post(
        'https://travelapp-32u1.onrender.com/facebook-login',
        {
          accessToken,
        },
      );

      const responseData = backendResponse.data;
      console.log('Backend Response:', responseData);

      await AsyncStorage.setItem('authToken', responseData.token);
      setToken(responseData.token);
    } catch (error) {
      if (error.response?.status === 409) {
        showModal(error.response.data.message);
      } else {
        console.log('Google Login Error:', error);
      }
    }
  };
  const handleSignIn = async () => {
    setLoading(true);
    setTimeout(() => {
      handleSignInLogic();
    }, 2500);
  };

  const handleSignInLogic = async () => {
    if (!email?.trim() || !signInpassword?.trim()) {
      showModal('Error', 'Email and password are required');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('https://travelapp-32u1.onrender.com/signin', {
        email,
        password: signInpassword,
      });

      const data = response.data;
      console.log('Sign In Response:', data);

      if (data.token) {
        await AsyncStorage.setItem('authToken', data.token);
        setToken(data.token);
        showModal('Success', 'Sign-in successful!');
      } else {
        showModal('Error', 'Invalid credentials or missing token');
      }
    } catch (error) {
      console.log('Sign In Error:', error);
      if (error.response) {
        if (error.response.status === 400) {
          showModal(
            'Error',
            'Invalid email or password. Please check your credentials.',
          );
        } else if (error.response.status === 401) {
          showModal(
            'Error',
            'Unauthorized access. Please check your login details.',
          );
        } else if (error.response.status === 500) {
          showModal(
            'Error',
            'This email is registered via Google/Facebook. Please sign in using Google/Facebook.',
          );
        } else {
          showModal(
            'Error',
            error.response.data?.message ||
              'Something went wrong. Please try again.',
          );
        }
      } else if (error.request) {
        showModal(
          'Network Error',
          'Unable to reach the server. Check your internet connection.',
        );
      } else {
        showModal('Error', 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setTimeout(() => {
      handleSignUpLogic();
    }, 2500);
  };

  const handleSignUpLogic = async () => {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!name?.trim() || !email?.trim() || !signUppassword?.trim()) {
      showModal('Error', 'All fields are required');
      return;
    }

    if (signUppassword !== confirmPassword) {
      showModal('Error', 'Passwords do not match');
      return;
    }

    if (!passwordRegex.test(signUppassword)) {
      showModal(
        'Error',
        'Password must contain at least one uppercase letter, one number, one special character, and be at least 8 characters long',
      );
      return;
    }

    try {
      const username = email.split('@')[0];
      const response = await axios.post('https://travelapp-32u1.onrender.com/signup', {
        name,
        email,
        username,
        password: signUppassword,
      });

      const data = response.data;
      console.log('Sign Up Response:', data);

      await AsyncStorage.setItem('authToken', data.token);
      setToken(data.token);

      showModal('Success', 'Sign up successful!', [{text: 'OK'}]);
    } catch (error) {
      showModal(
        'Error',
        error.response?.data?.message || 'Sign up failed. Please try again.',
      );
    }
  };

  return (
    <SafeAreaView
      style={{
        backgroundColor: isDarkMode ? 'black' : 'white',
        padding: 20,
        flex: 1,
      }}>
      <View style={{marginTop: 80, alignItems: 'center'}}>
        <Image
          style={{width: 340, height: 180}}
          source={{
            uri: 'https://res.cloudinary.com/dvqaaywos/image/upload/v1743418465/TripPlanner/sfsm5xr1lpeqxbiayx4u.png',
          }}
        />
      </View>

      <View style={{marginTop: 40}}>
        {!isLoginMode && !isSignupMode ? (
          <>
            <Pressable
              onPress={FacebookLogin}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 10,
                justifyContent: 'center',
                borderColor: '#E0E0E0',
                margin: 12,
                borderWidth: 3,
                gap: 30,
                borderRadius: 25,
                marginTop: 20,
                position: 'relative',
              }}>
              <AntDesign
                style={{position: 'absolute', left: 10}}
                name="facebook-square"
                size={24}
                color="blue"
              />
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 15,
                  fontWeight: '500',
                  color: isDarkMode ? 'white' : 'black',
                }}>
                Sign Up With Facebook
              </Text>
            </Pressable>

            <Pressable
              onPress={handleGoogleLogin}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 10,
                justifyContent: 'center',
                borderColor: '#E0E0E0',
                margin: 12,
                borderWidth: 3,
                gap: 30,
                borderRadius: 25,
                position: 'relative',
                marginTop: 20,
              }}>
              <AntDesign
                style={{position: 'absolute', left: 10}}
                name="google"
                size={24}
                color="red"
              />
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 15,
                  fontWeight: '500',
                  color: isDarkMode ? 'white' : 'black',
                }}>
                Sign Up With Google
              </Text>
            </Pressable>

            <Pressable onPress={() => setIsSignupMode(true)}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 10,
                  justifyContent: 'center',
                  borderColor: '#E0E0E0',
                  margin: 12,
                  borderWidth: 3,
                  gap: 30,
                  borderRadius: 25,
                  marginTop: 20,
                  position: 'relative',
                }}>
                <AntDesign
                  style={{position: 'absolute', left: 10}}
                  name="mail"
                  size={24}
                  color={isDarkMode ? 'lightgray' : 'black'}
                />
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 15,
                    fontWeight: '500',
                    color: isDarkMode ? 'white' : 'black',
                  }}>
                  Sign Up With Email
                </Text>
              </View>
            </Pressable>
            <Pressable
              style={{marginTop: 12}}
              onPress={() => setIsLoginMode(true)}>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 15,
                  color: isDarkMode ? 'white' : 'gray',
                }}>
                Already have an account? Sign In
              </Text>
            </Pressable>
          </>
        ) : isSignupMode ? (
          <>
            <TextInput
              placeholderTextColor={isDarkMode ? 'lightgray' : 'gray'}
              placeholder="Name"
              value={name}
              onChangeText={setName}
              style={{
                borderColor: '#E0E0E0',
                padding: 10,
                margin: 12,
                borderRadius: 8,
                borderWidth: 3,
                color: isDarkMode ? 'white' : 'black',
              }}
            />
            <TextInput
              placeholderTextColor={isDarkMode ? 'lightgray' : 'gray'}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={{
                borderColor: '#E0E0E0',
                padding: 10,
                margin: 12,
                borderRadius: 8,
                borderWidth: 3,
                color: isDarkMode ? 'white' : 'black',
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderColor: '#E0E0E0',
                padding: 10,
                margin: 12,
                borderRadius: 8,
                borderWidth: 3,
              }}>
              <TextInput
                placeholderTextColor={isDarkMode ? 'lightgray' : 'gray'}
                placeholder="Password"
                value={signUppassword}
                onChangeText={setSignUpPassword}
                secureTextEntry={!showPassword}
                style={{
                  flex: 1,
                  marginBottom: -15,
                  paddingTop: -10,
                  color: isDarkMode ? 'white' : 'black',
                }}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <AntDesign
                  name={showPassword ? 'eye' : 'eyeo'}
                  size={20}
                  color={isDarkMode ? 'lightgray' : 'gray'}
                />
              </Pressable>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderColor: '#E0E0E0',
                padding: 10,
                margin: 12,
                borderRadius: 8,
                borderWidth: 3,
              }}>
              <TextInput
                placeholderTextColor={isDarkMode ? 'lightgray' : 'gray'}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                style={{
                  flex: 1,
                  marginBottom: -15,
                  paddingTop: -10,
                  color: isDarkMode ? 'white' : 'black',
                }}
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <AntDesign
                  name={showConfirmPassword ? 'eye' : 'eyeo'}
                  size={20}
                  color={isDarkMode ? 'lightgray' : 'gray'}
                />
              </Pressable>
            </View>
            <Pressable
              onPress={handleSignUp}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 10,
                justifyContent: 'center',
                borderColor: '#E0E0E0',
                margin: 12,
                borderWidth: 1,
                borderRadius: 25,
                backgroundColor: '#4CAF50',
              }}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 15,
                    fontWeight: '500',
                    color: 'white',
                  }}>
                  Sign Up
                </Text>
              )}
            </Pressable>

            <Pressable onPress={() => setIsSignupMode(false)}>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 15,
                  color: isDarkMode ? 'lightgray' : 'gray',
                }}>
                Already have an account? Sign In
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <TextInput
              placeholder="Email"
              placeholderTextColor={isDarkMode ? 'lightgray' : 'gray'}
              value={email}
              onChangeText={setEmail}
              style={{
                borderWidth: 3,
                borderColor: '#E0E0E0',
                padding: 10,
                margin: 12,
                borderRadius: 8,
                color: isDarkMode ? 'white' : 'black',
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 3,
                borderColor: '#E0E0E0',
                padding: 10,
                margin: 12,
                borderRadius: 8,
              }}>
              <TextInput
                placeholderTextColor={isDarkMode ? 'lightgray' : 'gray'}
                placeholder="Password"
                value={signInpassword}
                onChangeText={setSignInPassword}
                secureTextEntry={!showPassword}
                style={{
                  flex: 1,
                  marginBottom: -15,
                  paddingTop: -10,
                  color: isDarkMode ? 'white' : 'black',
                }}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <AntDesign
                  name={showPassword ? 'eye' : 'eyeo'}
                  size={20}
                  color={isDarkMode ? 'lightgray' : 'gray'}
                />
              </Pressable>
            </View>

            <Pressable
              onPress={handleSignIn}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 10,
                justifyContent: 'center',
                borderColor: '#E0E0E0',
                margin: 12,
                borderWidth: 1,
                borderRadius: 25,
                backgroundColor: '#4CAF50',
              }}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 15,
                    fontWeight: '500',
                    color: 'white',
                  }}>
                  Sign In
                </Text>
              )}
            </Pressable>

            <Pressable
              style={{marginTop: 12}}
              onPress={() => setIsLoginMode(false)}>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 15,
                  color: isDarkMode ? 'lightgray' : 'gray',
                }}>
                Don't have an account? Sign Up
              </Text>
            </Pressable>
          </>
        )}
      </View>
      <Modal
        visible={customModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView contentContainerStyle={styles.modalTextContainer}>
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <Text style={styles.modalMessage}>{modalMessage}</Text>
            </ScrollView>

            {showDeleteConfirm ? (
              <View style={styles.confirmButtonContainer}>
                <TouchableOpacity
                  onPress={() => {
                    setCustomModalVisible(false);
                    setShowDeleteConfirm(false);
                    setOnModalClose(null);
                  }}
                  style={[styles.modalButton, styles.cancelButton]}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
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
                  style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default LoginScreen;
