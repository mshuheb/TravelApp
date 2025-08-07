import React, {useState, useEffect, useRef, useContext} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  Keyboard,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {ChatContext} from '../ChatContext';
import {DarkModeContext} from '../AuthContext';
import styles from '../styles/AiAssistantStyles';

const AiAssistant = ({navigation}) => {
  const {messages, setMessages} = useContext(ChatContext);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef();
  const {isDarkMode, toggleDarkMode} = useContext(DarkModeContext);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      e => {
        setKeyboardOffset(e.endCoordinates.height);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardOffset(0);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const isRelevant = text => {
    const keywords = [
      'travel',
      'trip',
      'planning',
      'itinerary',
      'destination',
      'place',
      'vacation',
      'stay',
      'hotel',
      'accommodation',
      'transportation',
      'flight',
      'bus',
      'train',
      'ride',
      'food',
      'restaurant',
      'dining',
      'cuisine',
      'attraction',
      'things to do',
      'sightseeing',
      'activity',
      'weather',
      'safety',
      'forecast',
      'culture',
      'language',
      'local phrases',
      'shopping',
      'souvenir',
      'market',
      'money',
      'currency',
      'atm',
      'sim card',
      'connectivity',
      'cities',
      'city',
      'country',
      'region',
      'local',
      'advice',
      'tips',
    ];
    return keywords.some(kw => text.toLowerCase().includes(kw));
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    if (!isRelevant(inputText)) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString() + '-bot',
          sender: 'bot',
          text: 'I can help with trip planning, accommodations, transportation, food, attractions, weather, local culture, shopping, and connectivity. Please ask something related.',
        },
      ]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://192.168.31.49:8001/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({message: inputText}),
      });

      const data = await response.json();
      const botReply = {
        id: Date.now().toString() + '-bot',
        sender: 'bot',
        text: data.reply || 'Sorry, I didn’t get a relevant response.',
      };

      setMessages(prev => [...prev, botReply]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString() + '-bot',
          sender: 'bot',
          text: 'Error connecting to AI for travel info.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({item}) => (
    <View
      style={[
        currentStyles.messageBubble,
        item.sender === 'user'
          ? currentStyles.userBubble
          : currentStyles.botBubble,
      ]}>
      {item.sender === 'bot' && loading && item.text === 'loading' ? (
        <ActivityIndicator size="small" color="#0000ff" />
      ) : (
        <Text style={currentStyles.messageText}>{item.text}</Text>
      )}
    </View>
  );

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({animated: true});
    }
  }, [messages]);

  const currentStyles = styles(isDarkMode);

  return (
    <View style={[currentStyles.container, {paddingBottom: keyboardOffset}]}>
      <View style={currentStyles.headerRow}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={currentStyles.backButton}>
          <View style={currentStyles.backIconContainer}>
            <Ionicons name="arrow-back" size={20} color="black" />
          </View>
        </Pressable>

        <Text style={currentStyles.heading}>Travel Assistant</Text>
      </View>

      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={currentStyles.messageList}
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={<View style={{height: 20}} />}
      />

      <View style={currentStyles.inputContainer}>
        <TextInput
          style={currentStyles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Trip plans, food, stays..."
          onSubmitEditing={sendMessage}
          returnKeyType="send"
          placeholderTextColor={isDarkMode ? 'lightgray' : 'black'}
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={currentStyles.sendButton}>
          <Text style={currentStyles.sendText}>{loading ? '...' : 'Send'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AiAssistant;
