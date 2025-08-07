import {StyleSheet, Platform} from 'react-native';

const styles = isDarkMode =>
  StyleSheet.create({
    container: {
      backgroundColor: isDarkMode ? '#121212' : '#F9F9F9',
      padding: 20,
      paddingBottom: 60,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: isDarkMode ? '#fff' : '#111',
      textAlign: 'center',
      marginTop: 10,
    },
    categoryInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderRadius: 32,
      borderWidth: 1,
      borderColor: isDarkMode ? '#fff' : '#000',
      backgroundColor: isDarkMode ? '#333' : '#fff',
    },

    categoryImage: {
      width: 48,
      height: 65,
      borderRadius: 14,
      marginRight: 6,
    },
    amount: {
      fontSize: 30,
      fontWeight: '700',
      color: isDarkMode ? '#fff' : '#000',
      textAlign: 'center',
      marginVertical: 10,
    },
    subText: {
      color: isDarkMode ? '#ccc' : '#444',
      fontSize: 13,
      textAlign: 'center',
      marginBottom: 24,
    },
    sectionWrapper: {
      borderRadius: 16,
      backgroundColor: isDarkMode ? '#212121' : '#E8F1F8',
      marginTop: 24,
      shadowColor: '#000',
      shadowOpacity: isDarkMode ? 0.3 : 0.06,
      shadowRadius: 6,
      shadowOffset: {width: 0, height: 4},
      elevation: 8,
      overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
    },

    section: {
      padding: 18,
      borderRadius: 16,
      backgroundColor: isDarkMode ? '#212121' : '#E8F1F8',
    },

    paidByContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      marginRight: 10,
    },
    highlight: {
      color: isDarkMode ? '#80CBC4' : '#0E2B3D',
      fontWeight: '700',
      fontSize: 16,
    },
    splitSection: {
      borderTopColor: isDarkMode ? '#555' : '#ccc',
      borderTopWidth: 1,
      paddingTop: 14,
    },
    oweRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    smallAvatar: {
      width: 26,
      height: 26,
      borderRadius: 13,
      marginRight: 10,
    },
    oweText: {
      color: isDarkMode ? '#eee' : '#333',
      fontSize: 14,
    },
    shadowWrapper: {
      marginTop: 30,
      borderRadius: 20,
      backgroundColor: isDarkMode ? '#333' : '#fff',
      shadowColor: '#000',
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 8,
      shadowOffset: {width: 0, height: 4},
      elevation: 8,
      overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
    },

    commentsContainer: {
      borderRadius: 20,
      overflow: 'hidden',
      padding: 16,
    },
    commentsTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: isDarkMode ? '#fff' : '#111',
      marginBottom: 14,
    },
    commentRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 14,
    },
    commentAvatar: {
      width: 30,
      height: 30,
      borderRadius: 15,
      marginRight: 10,
    },
    commentName: {
      color: isDarkMode ? '#fff' : '#111',
      fontWeight: '700',
      fontSize: 14,
    },
    commentText: {
      color: isDarkMode ? '#ddd' : '#333',
      fontSize: 13,
      marginTop: 2,
    },
    noComments: {
      color: isDarkMode ? '#888' : '#888',
      fontStyle: 'italic',
      fontSize: 13,
    },
    commentTime: {
      fontSize: 11,
      color: isDarkMode ? 'lightgray' : '#777',
      marginLeft: 10,
      marginTop: 2,
    },
    inputRow: {
      flexDirection: 'row',
      marginTop: 16,
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#444' : '#F1F1F1',
      borderRadius: 10,
      padding: 6,
    },
    input: {
      flex: 1,
      backgroundColor: 'transparent',
      color: isDarkMode ? '#fff' : '#111',
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
    },
    sendBtn: {
      backgroundColor: isDarkMode ? '#4A7799' : '#205781',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
    },
    sendText: {
      color: '#fff',
      fontWeight: '600',
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 14,
    },

    leftHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 1,
    },

    iconRow: {
      flexDirection: 'row',
      gap: 16,
      marginLeft: 'auto',
    },
    icon: {
      fontSize: 20,
      color: isDarkMode ? '#80CBC4' : '#205781',
    },
    scrollContent: {
      flexGrow: 1,
      backgroundColor: isDarkMode ? '#121212' : '#F9F9F9',
      padding: 20,
      paddingBottom: 60,
    },
    divider: {
      height: 1,
      backgroundColor: isDarkMode ? '#555' : '#e0e0e0',
      marginVertical: 20,
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
      backgroundColor: isDarkMode ? '#333' : 'white',
      borderRadius: 10,
      alignItems: 'center',
    },
    modalTextContainer: {
      paddingVertical: 10,
    },
    modalMessage: {
      fontSize: 16,
      textAlign: 'center',
      color: isDarkMode ? '#fff' : '#000',
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
  });

export default styles;
