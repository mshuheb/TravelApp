// jest.setup.js
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
jest.mock('react-native-vector-icons/AntDesign', () => 'AntDesign');
jest.mock('axios');
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest.fn().mockResolvedValue({ idToken: 'mock-id-token' }),
    signOut: jest.fn(),
  },
}));
jest.mock('react-native-fbsdk-next', () => ({
  LoginManager: {
    logInWithPermissions: jest.fn().mockResolvedValue({ isCancelled: false }),
  },
  AccessToken: {
    getCurrentAccessToken: jest.fn().mockResolvedValue({ accessToken: 'mock-access-token' }),
  },
}));
