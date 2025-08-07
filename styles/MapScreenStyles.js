import {StyleSheet} from 'react-native';

const styles = isDarkMode =>
  StyleSheet.create({
    map: {
      width: '100%',
      height: '100%',
      marginTop: 20,
      borderRadius: 5,
    },
    infoWrapper: {
      position: 'absolute',
      bottom: 30,
      left: 13,
      right: 13,
      borderRadius: 10,
      elevation: 5,
      overflow: 'hidden',
    },
    fixedHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
    },
    indexContainer: {
      width: 50,
      height: 30,
      borderRadius: 15,
      backgroundColor: '#0066b2',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    placeName: {
      fontSize: 16,
      fontWeight: '500',
      flex: 1,
    },
    scrollContainer: {
      flex: 1,
    },
    infoContainer: {
      padding: 10,
    },
    description: {
      marginBottom: 10,
    },
    image: {
      width: '100%',
      height: 750,
      borderRadius: 10,
      marginBottom: 10,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    fullScreenImage: {
      width: '100%',
      height: '100%',
    },
    closeButton: {
      position: 'absolute',
      top: 40,
      right: 20,
      zIndex: 1,
      backgroundColor: isDarkMode
        ? 'rgba(255, 255, 255, 0.2)'
        : 'rgba(0, 0, 0, 0.6)',
      borderRadius: 20,
      padding: 10,
    },
    backButton: {
      position: 'absolute',
      top: 50,
      left: 10,
      zIndex: 2,
    },
    backIconContainer: {
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default styles;
