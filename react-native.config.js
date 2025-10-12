module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/fonts/'],
  dependencies: {
    'react-native-config': {
      platforms: {
        android: null, // Android native autolink 비활성화
      },
    },
  },
};