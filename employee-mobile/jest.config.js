module.exports = {
  preset: '@react-native/jest-preset',
  moduleNameMapper: {
    '\\.(css)$': '<rootDir>/test-mocks/styleMock.js',
    '^@react-native-async-storage/async-storage$': '<rootDir>/test-mocks/asyncStorageMock.js',
    '^lucide-react-native$': '<rootDir>/test-mocks/iconsMock.js',
    '^@react-native-community/netinfo$': '<rootDir>/test-mocks/netInfoMock.js',
    '^react-native-keychain$': '<rootDir>/test-mocks/keychainMock.js',
  },
  transformIgnorePatterns: ['node_modules/(?!((@)?react-native|@react-native|@react-navigation|react-native-.*|lucide-react-native)/)'],
};
