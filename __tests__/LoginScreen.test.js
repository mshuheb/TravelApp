import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import LoginScreen from '../screens/LoginScreen';
import {AuthContext, DarkModeContext} from '../AuthContext';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest.fn().mockResolvedValue({idToken: 'mock-id-token'}),
    signOut: jest.fn(),
  },
}));

describe('LoginScreen', () => {
  const mockAuthContext = {
    token: null,
    setToken: jest.fn(),
  };

  const mockDarkModeContext = {
    isDarkMode: false,
    toggleDarkMode: jest.fn(),
  };

  it('renders the LoginScreen correctly', () => {
    const {getByText} = render(
      <AuthContext.Provider value={mockAuthContext}>
        <DarkModeContext.Provider value={mockDarkModeContext}>
          <LoginScreen />
        </DarkModeContext.Provider>
      </AuthContext.Provider>,
    );

    expect(getByText('Sign Up With Google')).toBeTruthy();
    expect(getByText('Sign Up With Facebook')).toBeTruthy();
    expect(getByText('Sign Up With Email')).toBeTruthy();
  });

  it('handles Google login button press', async () => {
    const {getByText} = render(
      <AuthContext.Provider value={mockAuthContext}>
        <DarkModeContext.Provider value={mockDarkModeContext}>
          <LoginScreen />
        </DarkModeContext.Provider>
      </AuthContext.Provider>,
    );

    const googleButton = getByText('Sign Up With Google');
    fireEvent.press(googleButton);

    await waitFor(() => {
      expect(GoogleSignin.signIn).toHaveBeenCalled();
    });
  });

  it('toggles between login and signup modes', () => {
    const {getByText, queryByPlaceholderText} = render(
      <AuthContext.Provider value={mockAuthContext}>
        <DarkModeContext.Provider value={mockDarkModeContext}>
          <LoginScreen />
        </DarkModeContext.Provider>
      </AuthContext.Provider>,
    );

    const signUpWithEmailButton = getByText('Sign Up With Email');
    fireEvent.press(signUpWithEmailButton);

    expect(queryByPlaceholderText('Name')).toBeTruthy();
    expect(queryByPlaceholderText('Email')).toBeTruthy();
    expect(queryByPlaceholderText('Password')).toBeTruthy();
    expect(queryByPlaceholderText('Confirm Password')).toBeTruthy();
  });
});
