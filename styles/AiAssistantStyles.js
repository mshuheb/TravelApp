import {StyleSheet} from 'react-native';

const styles = isDarkMode =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#000' : '#fff',
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: isDarkMode ? '#121212' : '#fff',
      marginTop: 30,
    },
    backButton: {
      marginRight: 8,
    },
    backIconContainer: {
      backgroundColor: isDarkMode ? 'white' : '#e0e0e0',
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
    messageList: {
      padding: 12,
      paddingBottom: 80,
    },
    messageBubble: {
      maxWidth: '80%',
      padding: 10,
      marginVertical: 6,
      borderRadius: 12,
    },
    userBubble: {
      backgroundColor: isDarkMode ? 'green' : '#DCF8C6',
      alignSelf: 'flex-end',
    },
    botBubble: {
      backgroundColor: isDarkMode ? '#444' : '#E6E6E6',
      alignSelf: 'flex-start',
    },
    messageText: {
      fontSize: 16,
      color: isDarkMode ? '#fff' : '#000',
    },
    inputContainer: {
      flexDirection: 'row',
      padding: 10,
      borderTopWidth: 0,
      borderColor: '#ccc',
      backgroundColor: 'transaprent',
      width: '100%',
      marginBottom: 45,
    },
    input: {
      flex: 1,
      fontSize: 16,
      backgroundColor: isDarkMode ? '#333' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
      paddingHorizontal: 12,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isDarkMode ? '#555' : '#ddd',
    },
    sendButton: {
      marginLeft: 10,
      alignSelf: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: isDarkMode ? '#008080' : '#00BCC4',
      borderRadius: 20,
    },
    sendText: {
      color: '#fff',
      fontSize: 16,
    },
  });

export default styles;
