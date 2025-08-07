import React from 'react';
import {ModalPortal} from 'react-native-modals';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {AuthProvider} from './AuthContext';
import StackNavigator from './navigation/StackNavigator';
import {ChatProvider} from './ChatContext';

function App() {
  return (
    <>
      <GestureHandlerRootView style={{flex: 1}}>
        <AuthProvider>
          <ChatProvider>
            <StackNavigator />
            <ModalPortal />
          </ChatProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </>
  );
}

export default App;
