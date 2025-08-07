module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  setupFiles: ['./jest.setup.js'],
  // transformIgnorePatterns: [
  //   'node_modules/(?!(react-native|@react-native|react-navigation|@react-navigation|@react-native-google-signin)/)',
  // ],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native' +
      '|@react-native' +
      '|react-navigation' +
      '|@react-navigation' +
      '|react-native-vector-icons' +
      '|@react-native-google-signin' +
      '|react-native-daterange-picker' +
      '|react-native-dropdown-picker' +
      '|react-native-maps' +
      '|react-native-gesture-handler' +
      '|react-native-google-places-autocomplete' +
      '|react-native-image-picker' +
      '|react-native-modal-datetime-picker' +
      '|@react-native-community/datetimepicker' +
      ')/)',
  ],
};
