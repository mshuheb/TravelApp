import {StyleSheet} from 'react-native';

const styles = isDarkMode =>
  StyleSheet.create({
    container: {
      padding: 20,
      paddingBottom: 240,
      paddingTop: 50,
      marginTop: 50,
      backgroundColor: isDarkMode ? '#1c1c1c' : '#F0F8FF',
    },
    header: {
      alignItems: 'center',
      marginBottom: 30,
    },
    profileImage: {
      width: 110,
      height: 110,
      borderRadius: 55,
      borderWidth: 3,
      borderColor: '#00BCC4',
      marginBottom: 10,
    },
    username: {
      fontSize: 22,
      fontWeight: '600',
      color: '#00BCC4',
    },
    email: {
      fontSize: 16,
      color: isDarkMode ? '#aaa' : 'gray',
    },
    button: {
      alignSelf: 'center',
      backgroundColor: '#00BCC4',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 30,
      marginBottom: 30,
    },
    buttonText: {
      color: 'white',
      fontWeight: '600',
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 10,
      color: isDarkMode ? '#fff' : '#000',
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
    },
    emoji: {
      fontSize: 20,
      marginRight: 12,
    },
    infoText: {
      fontSize: 16,
      fontWeight: '500',
      color: isDarkMode ? '#fff' : '#000',
    },
    profileImageWrapper: {
      position: 'relative',
      width: 110,
      height: 110,
      marginBottom: 10,
    },
    cameraIcon: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: '#00BCC4',
      borderRadius: 20,
      padding: 5,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: '80%',
      padding: 20,
      backgroundColor: isDarkMode ? '#2c2c2c' : 'white',
      borderRadius: 10,
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 10,
      color: isDarkMode ? '#fff' : '#000',
    },
    modalMessage: {
      fontSize: 16,
      textAlign: 'center',
      color: isDarkMode ? '#ddd' : '#000',
    },
    modalTextContainer: {
      paddingVertical: 10,
    },
    modalButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: '#00BCC4',
      borderRadius: 30,
      marginVertical: 5,
    },
    modalButtonText: {
      color: 'white',
      fontWeight: '600',
    },
    cancelButton: {
      backgroundColor: 'grey',
    },
    confirmButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
      marginTop: 15,
    },
    textInput: {
      width: '100%',
      borderWidth: 1,
      borderColor: isDarkMode ? '#555' : '#ccc',
      borderRadius: 8,
      padding: 10,
      marginBottom: 15,
      color: isDarkMode ? '#fff' : '#000',
      backgroundColor: isDarkMode ? '#333' : '#fff',
    },
    modalButtonRow: {
      flexDirection: 'row',
      marginTop: 10,
      gap: 15,
    },
  });
export default styles;
