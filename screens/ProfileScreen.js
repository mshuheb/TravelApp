import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  Image,
  Switch,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {AuthContext, DarkModeContext} from '../AuthContext';
import {launchImageLibrary} from 'react-native-image-picker';
import axios from 'axios';
import AntDesign from 'react-native-vector-icons/AntDesign';
import styles from '../styles/ProfileScreenStyles';

const ProfileScreen = ({route}) => {
  const navigation = useNavigation();
  const {clearAuthToken} = useContext(AuthContext);
  const [user, setUser] = useState(route.params?.user || {});
  const {isDarkMode, toggleDarkMode} = useContext(DarkModeContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [editNameModalVisible, setEditNameModalVisible] = useState(false);
  const [newName, setNewName] = useState(user.name);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [reEnterPassword, setReEnterPassword] = useState('');
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [onModalClose, setOnModalClose] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [modalTitle, setModalTitle] = useState('');

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

  const updateName = async () => {
    try {
      const res = await axios.put(
        `http://192.168.31.48:8000/user/${user._id}/name`,
        {
          name: newName,
        },
      );
      setUser(prevUser => ({...prevUser, name: newName}));
      showModal('Success', 'Name updated Successfully!');
      setEditNameModalVisible(false);
    } catch (error) {
      console.error(
        'Update name failed:',
        error?.response?.data || error.message,
      );
      showModal('Error', 'Failed to update name');
    }
  };

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get(`http://192.168.31.48:8000/user/${user._id}`);
      if (res.data && res.data.user) {
        setUser(res.data.user);
        console.log('User profile fetched:', res.data.user);
      }
    } catch (error) {
      console.error(
        'Failed to fetch user profile:',
        error?.response?.data || error.message,
      );
      showModal('Failed to fetch user profile');
    }
  };

  const handleChoosePhoto = () => {
    setModalVisible(true);
  };

  const choosePhoto = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
      });

      if (result?.assets?.length > 0) {
        const photo = result.assets[0];

        const formData = new FormData();
        formData.append('photo', {
          uri: photo.uri,
          name: photo.fileName || `profile_${Date.now()}.jpg`,
          type: photo.type || 'image/jpeg',
        });

        const res = await axios.put(
          `http://192.168.31.48:8000/user/${user._id}/photo`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );
        console.log('Image selected:', photo);

        setUser(res.data.user);
        await fetchUserProfile();
        showModal('Success', 'Profile picture updated!');
      } else {
        showModal('Error', 'No image selected');
      }
    } catch (error) {
      console.error('Upload failed:', error?.response?.data || error.message);
      showModal('Error', 'Failed to upload image');
    }
    setModalVisible(false);
  };

  const removePhoto = async () => {
    try {
      const res = await axios.delete(
        `http://192.168.31.48:8000/user/${user._id}/photo`,
      );
      setUser(res.data.user);
      await fetchUserProfile();
      showModal('Success', 'Profile picture removed!');
    } catch (error) {
      console.error('Remove failed:', error?.response?.data || error.message);
      showModal('Error', 'Failed to remove image');
    }
    setModalVisible(false);
  };

  const handlePasswordChange = () => {
    if (user.googleId) {
      setModalMessage(
        'Your account is linked with Google. To change your password, please visit your Google account settings.',
      );
      setCustomModalVisible(true);
    } else if (user.facebookId) {
      setModalMessage(
        'Your account is linked with Facebook. To change your password, please visit your Facebook account settings.',
      );
      setCustomModalVisible(true);
    } else {
      setPasswordModalVisible(true);
    }
  };
  const updatePassword = async () => {
    if (!currentPassword || !newPassword || !reEnterPassword) {
      showModal('Error', 'All fields are required.');
      return;
    }

    if (newPassword !== reEnterPassword) {
      showModal('Error', 'New password and re-entered password do not match.');
      return;
    }

    try {
      const res = await axios.put(
        `http://192.168.31.48:8000/user/${user._id}/password`,
        {
          currentPassword,
          newPassword,
        },
      );
      showModal('Success', 'Password updated successfully!');
      setPasswordModalVisible(false);
    } catch (error) {
      const errorMsg = error?.response?.data?.message;

      if (errorMsg === 'Current password is incorrect') {
        showModal('Error', 'Current password is incorrect.');
      } else if (errorMsg) {
        showModal('Error', errorMsg);
      } else {
        showModal('Error', 'Failed to update password.');
      }

      console.error('Password update failed:', errorMsg || error.message);
    }
  };
  const handleLogout = () => {
    setModalTitle('Logout');
    setModalMessage('Are you sure you want to logout?');
    setShowDeleteConfirm(true);
    setCustomModalVisible(true);
    setOnModalClose(null);
  };

  const confirmLogout = async () => {
    await clearAuthToken();
    handleCloseModal();
  };

  const currentStyles = styles(isDarkMode);

  return (
    <ScrollView contentContainerStyle={currentStyles.container}>
      <View style={currentStyles.header}>
        <View style={currentStyles.profileImageWrapper}>
          <Image
            source={{uri: user.photo}}
            style={currentStyles.profileImage}
          />

          <AntDesign
            name="camerao"
            size={20}
            color="#fff"
            style={currentStyles.cameraIcon}
            onPress={handleChoosePhoto}
          />
        </View>

        <Text style={currentStyles.username}>@{user.name}</Text>
        <Text style={currentStyles.email}>{user.email}</Text>
      </View>

      <TouchableOpacity
        style={currentStyles.button}
        onPress={() => navigation.goBack()}>
        <Text style={currentStyles.buttonText}>⬅️ Back to Home</Text>
      </TouchableOpacity>

      <View style={currentStyles.section}>
        <Text style={currentStyles.sectionTitle}>Account Info</Text>

        <View style={currentStyles.infoRow}>
          <Text style={currentStyles.emoji}>👤</Text>
          <TouchableOpacity
            onPress={() => {
              setNewName(user.name);
              setEditNameModalVisible(true);
            }}>
            <Text style={currentStyles.infoText}>{user.name}</Text>
          </TouchableOpacity>
        </View>

        <View style={currentStyles.infoRow}>
          <Text style={currentStyles.emoji}>📧</Text>
          <Text style={currentStyles.infoText}>{user.email}</Text>
        </View>
      </View>

      <View style={currentStyles.section}>
        <TouchableOpacity
          style={currentStyles.infoRow}
          onPress={() => navigation.navigate('Saved')}>
          <Text style={currentStyles.emoji}>📍</Text>
          <Text style={currentStyles.infoText}>Saved Places</Text>
        </TouchableOpacity>

        <TouchableOpacity style={currentStyles.infoRow}>
          <Text style={currentStyles.emoji}>🔑</Text>
          <Text style={currentStyles.infoText} onPress={handlePasswordChange}>
            Change Password
          </Text>
        </TouchableOpacity>

        <View style={currentStyles.infoRow}>
          <Text style={currentStyles.emoji}>🌙</Text>
          <Text style={currentStyles.infoText}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            style={{marginLeft: 'auto'}}
          />
        </View>

        <TouchableOpacity
          style={[currentStyles.infoRow, {marginTop: 20}]}
          onPress={handleLogout}>
          <Text style={[currentStyles.emoji, {color: 'red'}]}>🚪</Text>
          <Text style={[currentStyles.infoText, {color: 'red'}]}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for selecting upload or remove photo */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={currentStyles.modalOverlay}>
          <View style={currentStyles.modalContent}>
            <Text style={currentStyles.modalTitle}>Choose an Option</Text>
            <TouchableOpacity
              onPress={choosePhoto}
              style={currentStyles.modalButton}>
              <Text style={currentStyles.modalButtonText}>
                Upload Profile Picture
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={removePhoto}
              style={currentStyles.modalButton}>
              <Text style={currentStyles.modalButtonText}>
                Remove Profile Picture
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={currentStyles.modalButton}>
              <Text style={currentStyles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={editNameModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditNameModalVisible(false)}>
        <View style={currentStyles.modalOverlay}>
          <View style={currentStyles.modalContent}>
            <Text style={currentStyles.modalTitle}>Enter your name</Text>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter new name"
              style={currentStyles.textInput}
            />
            <View style={currentStyles.modalButtonRow}>
              <TouchableOpacity
                onPress={updateName}
                style={currentStyles.modalButton}>
                <Text style={currentStyles.modalButtonText}>Update</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setEditNameModalVisible(false)}
                style={currentStyles.modalButton}>
                <Text style={currentStyles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={passwordModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPasswordModalVisible(false)}>
        <View style={currentStyles.modalOverlay}>
          <View style={currentStyles.modalContent}>
            <Text style={currentStyles.modalTitle}>Change Your Password</Text>
            <TextInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Current Password"
              style={currentStyles.textInput}
              secureTextEntry={!showPassword}
            />
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New Password"
              style={currentStyles.textInput}
              secureTextEntry={!showPassword}
            />
            <TextInput
              value={reEnterPassword}
              onChangeText={setReEnterPassword}
              placeholder="Re-enter New Password"
              style={currentStyles.textInput}
              secureTextEntry={!showPassword}
            />
            <View
              style={{
                alignSelf: 'flex-start',
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 10,
              }}>
              <Switch
                value={showPassword}
                onValueChange={setShowPassword}
                trackColor={{false: '#ccc', true: '#00BCC4'}}
                thumbColor={showPassword ? '#00BCC4' : '#f4f3f4'}
              />
              <Text style={{marginLeft: 10}}>
                {showPassword ? 'Hide Password' : 'Show Password'}
              </Text>
            </View>

            <View style={currentStyles.modalButtonRow}>
              <TouchableOpacity
                onPress={updatePassword}
                style={currentStyles.modalButton}>
                <Text style={currentStyles.modalButtonText}>Update</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPasswordModalVisible(false)}
                style={currentStyles.modalButton}>
                <Text style={currentStyles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={customModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}>
        <View style={currentStyles.modalOverlay}>
          <View style={currentStyles.modalContent}>
            <ScrollView
              contentContainerStyle={currentStyles.modalTextContainer}>
              <Text style={currentStyles.modalTitle}>{modalTitle}</Text>
              <Text style={currentStyles.modalMessage}>{modalMessage}</Text>
            </ScrollView>
            {showDeleteConfirm ? (
              <View style={currentStyles.modalButtonRow}>
                <TouchableOpacity
                  onPress={handleCloseModal}
                  style={[
                    currentStyles.modalButton,
                    currentStyles.cancelButton,
                  ]}>
                  <Text style={currentStyles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={confirmLogout}
                  style={[currentStyles.modalButton, {backgroundColor: 'red'}]}>
                  <Text style={currentStyles.modalButtonText}>Logout</Text>
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

export default ProfileScreen;
