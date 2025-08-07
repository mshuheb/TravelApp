import {StyleSheet} from 'react-native';

const styles = isDarkMode =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#121212' : '#f9f9f9',
      paddingTop: 40,
    },
    backButtonText: {
      fontSize: 16,
      color: '#333',
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDarkMode
        ? 'rgba(0, 0, 0, 0.9)'
        : 'rgba(255, 255, 255, 0.6)',
    },
    emptyText: {
      fontSize: 16,
      color: isDarkMode ? '#B0B0B0' : '#888',
    },
    list: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    card: {
      backgroundColor: isDarkMode ? '#333' : '#fff',
      borderRadius: 12,
      marginBottom: 16,
      overflow: 'hidden',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.2,
      shadowRadius: 3,
    },
    image: {
      width: '100%',
      height: 180,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      paddingHorizontal: 12,
      paddingTop: 10,
      color: isDarkMode ? '#fff' : '#222',
    },
    subtitle: {
      fontSize: 14,
      color: isDarkMode ? '#B0B0B0' : '#555',
      paddingHorizontal: 12,
      paddingBottom: 12,
      paddingTop: 4,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: isDarkMode ? '#1E1E1E' : '#fff',
    },

    backButton: {
      marginRight: 8,
    },

    backIconContainer: {
      backgroundColor: '#e0e0e0',
      borderRadius: 20,
      padding: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },

    heading: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDarkMode ? '#fff' : '#000',
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: isDarkMode
        ? 'rgba(0, 0, 0, 0.6)'
        : 'rgba(255, 255, 255, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999,
    },
  });

export default styles;
