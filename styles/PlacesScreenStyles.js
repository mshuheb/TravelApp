import {StyleSheet, Dimensions} from 'react-native';

const {width} = Dimensions.get('window');

const styles = isDarkMode =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#121212' : '#fff',
      padding: 10,
      paddingLeft: 15,
      paddingRight: 15,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 5,
      color: isDarkMode ? '#fff' : '#000',
    },
    address: {
      fontSize: 16,
      color: isDarkMode ? '#B0B0B0' : '#666',
      marginBottom: 10,
    },
    carousel: {
      marginBottom: 15,
    },
    image: {
      width: width - 39,
      height: 200,
      borderRadius: 10,
      marginRight: 10,
    },
    map: {
      width: '100%',
      height: 250,
      flex: 1,
    },
    mapContainer: {
      borderRadius: 10,
      overflow: 'hidden',
      marginBottom: 15,
      marginTop: 15,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '700',
      marginVertical: 10,
      color: isDarkMode ? '#fff' : '#000',
    },
    subSectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginVertical: 5,
      color: isDarkMode ? '#fff' : '#000',
    },
    description: {
      fontSize: 16,
      color: isDarkMode ? '#D3D3D3' : '#444',
      lineHeight: 22,
    },
    card: {
      backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
      padding: 10,
      borderRadius: 12,
      marginRight: 10,
      width: 180,
    },
    cardImage: {
      width: '100%',
      height: 100,
      borderRadius: 10,
      marginBottom: 6,
    },
    noImage: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#555' : '#ccc',
    },
    cardTitle: {
      fontWeight: 'bold',
      fontSize: 14,
      color: isDarkMode ? '#fff' : '#000',
    },
    cardAddress: {
      fontSize: 12,
      color: isDarkMode ? '#B0B0B0' : '#555',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginVertical: 5,
    },
    detailText: {
      fontSize: 14,
      color: isDarkMode ? '#fff' : '#333',
    },
    website: {
      fontSize: 14,
      color: '#2a52be',
      textDecorationLine: 'underline',
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 10,
    },
    tag: {
      backgroundColor: isDarkMode ? '#555' : '#eee',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 15,
    },
    tagText: {
      fontSize: 12,
      color: isDarkMode ? '#fff' : '#444',
    },
    backText: {
      fontSize: 16,
      color: '#2a52be',
      marginLeft: 5,
      fontWeight: '500',
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      justifyContent: 'space-between',
    },
    backButton: {
      marginRight: 8,
    },
    heartIconContainer: {
      padding: 8,
    },
    backIconContainer: {
      backgroundColor: '#e0e0e0',
      borderRadius: 20,
      padding: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalCloseButton: {
      position: 'absolute',
      top: 15,
      right: 15,
      zIndex: 2,
    },
    modalCloseIconContainer: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: '#e0e0e0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalCarouselContainer: {
      position: 'relative',
      marginBottom: 15,
    },
    modalCarousel: {
      width: '100%',
      height: 200,
    },
    modalImage: {
      width: width,
      height: 200,
    },

    pagination: {
      position: 'absolute',
      bottom: 10,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 5,
    },
    paginationDot: {
      backgroundColor: isDarkMode ? '#D3D3D3' : '#888',
      opacity: 0.5,
    },
    carouselButton: {
      position: 'absolute',
      top: '50%',
      transform: [{translateY: -12}],
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 15,
      width: 30,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2,
    },
    carouselButtonLeft: {
      left: 10,
    },
    carouselButtonRight: {
      right: 10,
    },
    modalDetails: {
      paddingHorizontal: 15,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 5,
      color: isDarkMode ? '#fff' : '#000',
    },
    modalReview: {
      fontSize: 14,
      color: isDarkMode ? '#B0B0B0' : '#666',
      marginBottom: 10,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: isDarkMode ? '#121212' : '#fff',
    },
    closeButtonContainer: {
      alignSelf: 'flex-end',
      padding: 15,
    },
    closeButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: isDarkMode ? '#333' : '#e0e0e0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeIcon: {
      color: isDarkMode ? '#fff' : 'black',
    },
  });

export default styles;
