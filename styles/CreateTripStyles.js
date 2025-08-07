import {StyleSheet} from 'react-native';

const styles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#c1c9d6',
      borderRadius: 20,
      padding: 15,
      height: 200,
    },
    label: {
      marginTop: 10,
      fontSize: 15,
      fontWeight: '600',
    },
    picker: {
      marginTop: 10,
      backgroundColor: 'white',
      borderColor: 'gray',
      borderWidth: 1,
      borderRadius: 5,
    },
    dropDownContainer: {
      backgroundColor: 'white',
      borderColor: 'gray',
    },
    selectedTimeZone: {
      marginTop: 10,
      fontSize: 15,
      fontWeight: '600',
      color: '#505050',
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
      backgroundColor: 'white',
      borderRadius: 10,
      alignItems: 'center',
    },
    modalTextContainer: {
      paddingVertical: 10,
    },
    modalMessage: {
      fontSize: 16,
      textAlign: 'center',
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
      backgroundColor: 'grey',
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
