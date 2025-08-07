import {StyleSheet} from 'react-native';

const styles = isDarkMode =>
  StyleSheet.create({
    card: {
      backgroundColor: '#fff',
      borderRadius: 10,
      marginBottom: 15,
      padding: 10,
      flexDirection: 'column',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
      display: 'flex',
    },
    rightAction: {
      width: 80,
      height: 80,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'red',
      borderRadius: 8,
      marginVertical: 10,
      alignSelf: 'center',
      transform: [{translateY: 6}],
    },
    deleteButton: {
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
      backgroundColor: isDarkMode ? '#1E1E1E' : 'white',
      borderRadius: 10,
      alignItems: 'center',
    },
    modalTextContainer: {
      paddingVertical: 10,
    },
    modalMessage: {
      fontSize: 16,
      textAlign: 'center',
      color: isDarkMode ? 'white' : 'black',
    },
    modalButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: isDarkMode ? '#008080' : '#00BCC4',
      borderRadius: 30,
      marginVertical: 5,
      minWidth: 100,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: isDarkMode ? '#555' : 'grey',
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
