/**
 * React Native Config
 * Exclude packages that shouldn't be auto-linked on native platforms
 */
module.exports = {
  dependencies: {
    // react-native-maps is a peer dependency of @teovilla/react-native-web-maps
    // but we only use it on web. Disable auto-linking on native platforms.
    'react-native-maps': {
      platforms: {
        ios: null,
        android: null,
      },
    },
    // @teovilla/react-native-web-maps is also web-only
    '@teovilla/react-native-web-maps': {
      platforms: {
        ios: null,
        android: null,
      },
    },
  },
};
