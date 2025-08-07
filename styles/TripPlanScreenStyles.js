import {StyleSheet} from 'react-native';
const styles = isDarkMode =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 15,
      padding: 10,
    },
    modalContent: {
      width: '100%',
      padding: 20,
      backgroundColor: isDarkMode ? '#2e2e2e' : 'white',
      borderRadius: 10,
      alignItems: 'center',
    },
    modalTextContainer: {
      paddingVertical: 10,
    },
    modalMessage: {
      fontSize: 16,
      textAlign: 'center',
      padding: 10,
      color: isDarkMode ? 'white' : 'black',
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
    modalButtonText: {
      color: 'white',
      fontWeight: '600',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 10,
      color: isDarkMode ? 'white' : 'black',
    },
  });
export default styles;
