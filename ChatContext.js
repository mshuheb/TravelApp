import React, {createContext, useState} from 'react';

export const ChatContext = createContext();

export const ChatProvider = ({children}) => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'bot',
      text: 'Hi! I’m your travel assistant. Ask me anything about trip planning...',
    },
  ]);

  return (
    <ChatContext.Provider value={{messages, setMessages}}>
      {children}
    </ChatContext.Provider>
  );
};
