import {StyleSheet} from 'react-native';

const styles = isDarkMode =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 15,
      padding: 10,
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
      backgroundColor: isDarkMode ? '#1e1e1e' : 'white',
      borderRadius: 10,
      alignItems: 'center',
    },
    modalTextContainer: {
      paddingVertical: 10,
    },
    modalMessage: {
      fontSize: 16,
      textAlign: 'center',
      color: isDarkMode ? 'white' : '#1e1e1e',
    },
    modalButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: '#00BCC4',
      borderRadius: 30,
      marginVertical: 5,
      minWidth: 100,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: isDarkMode ? '#666' : 'grey',
    },
    modalButtonText: {
      color: 'white',
      fontWeight: '600',
    },
    confirmButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
      marginTop: 15,
    },
  });
export default styles;
