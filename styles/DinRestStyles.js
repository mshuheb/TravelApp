import {StyleSheet} from 'react-native';

const styles = isDarkMode =>
  StyleSheet.create({
    container: {
      backgroundColor: isDarkMode ? '#121212' : '#fff',
      borderRadius: 10,
      marginBottom: 15,
      padding: 10,
      shadowColor: isDarkMode ? '#000' : '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    indexCircle: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: '#0066b2',
      justifyContent: 'center',
      alignItems: 'center',
    },
    indexText: {
      color: 'white',
      fontWeight: '500',
    },
    restaurantName: {
      fontSize: 16,
      fontWeight: '500',
      flexShrink: 1,
      width: '82%',
      color: isDarkMode ? '#fff' : '#000',
    },
    image: {
      width: 100,
      height: 100,
      borderRadius: 10,
    },
    noImage: {
      width: 100,
      height: 100,
      borderRadius: 10,
      backgroundColor: isDarkMode ? '#333' : '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    noImageText: {
      color: isDarkMode ? '#aaa' : '#888',
      fontSize: 12,
      textAlign: 'center',
    },
    row: {
      marginHorizontal: 8,
      marginBottom: 6,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    detailText: {
      fontSize: 14,
      fontWeight: '500',
      color: '#4B61D1',
    },
    website: {
      fontSize: 15,
      fontWeight: '400',
      color: '#4B61D1',
      textDecorationLine: 'underline',
    },
    tagsContainer: {
      marginHorizontal: 8,
      marginBottom: 6,
      marginTop: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap',
    },
    tag: {
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 23,
      backgroundColor: '#4B61D1',
    },
    tagText: {
      textAlign: 'center',
      color: 'white',
      fontSize: 13,
      fontWeight: '500',
    },
    reviewText: {
      color: isDarkMode ? '#aaa' : 'gray',
      marginTop: 7,
      width: '80%',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDarkMode ? '#fff' : '#333',
      marginBottom: 10,
    },
    emptySubText: {
      fontSize: 14,
      color: isDarkMode ? '#aaa' : 'gray',
      textAlign: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingIndicator: {
      color: '#007bff',
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: isDarkMode ? '#fff' : '#333',
    },
  });

export default styles;
