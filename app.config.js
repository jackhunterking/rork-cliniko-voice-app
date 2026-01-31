module.exports = {
  expo: {
    name: "Cliniko Voice App",
    slug: "cliniko-voice-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "rork-app",
    userInterfaceStyle: "automatic",
    /**
     * New Architecture (Fabric + TurboModules)
     * 
     * Currently disabled due to potential compatibility issues with:
     * - react-native-live-audio-stream (audio streaming)
     * - react-native-fbsdk-next (Facebook SDK)
     * - expo-superwall (paywall)
     * - react-native-purchases (RevenueCat)
     * 
     * To enable: Set to true and rebuild the app (expo run:ios / expo run:android)
     * Test thoroughly on both platforms before deploying.
     * 
     * See: https://reactnative.dev/blog/2024/10/23/the-new-architecture-is-here
     */
    newArchEnabled: false,
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#007FA3"
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: "app.cliniko-voice",
      infoPlist: {
        NSMicrophoneUsageDescription: "Cliniko Voice needs access to your microphone to transcribe your clinical notes in real-time.",
        NSUserTrackingUsageDescription: "This allows us to measure the effectiveness of our advertising and provide you with a better experience.",
        UIBackgroundModes: ["audio"],
        SKAdNetworkItems: [
          { SKAdNetworkIdentifier: "v9wttpbfk9.skadnetwork" },
          { SKAdNetworkIdentifier: "n38lu8286q.skadnetwork" }
        ]
      },
      appleTeamId: "6G65A4B7Y5",
      usesAppleSignIn: false,
      config: {
        usesNonExemptEncryption: false
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#007FA3"
      },
      package: "app.cliniko_voice"
    },
    web: {
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      [
        "expo-router",
        {
          origin: "https://rork.com/"
        }
      ],
      "expo-font",
      "expo-web-browser",
      "expo-secure-store",
      [
        "expo-tracking-transparency",
        {
          userTrackingPermission: "This allows us to measure the effectiveness of our advertising and provide you with a better experience."
        }
      ],
      [
        "react-native-fbsdk-next",
        {
          appID: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID,
          clientToken: process.env.EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN,
          displayName: "Cliniko Voice App",
          advertiserIDCollectionEnabled: true,
          autoLogAppEventsEnabled: true,
          isAutoInitEnabled: true
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      eas: {
        /**
         * EAS Project ID - Required for EAS Build and EAS Update
         * 
         * To get your project ID:
         * 1. Run `npx eas init` in your project root
         * 2. Or visit https://expo.dev and find your project
         * 3. Copy the ID from the project URL or settings
         * 
         * Format: UUID like "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
         */
        projectId: "your-eas-project-id"
      },
      /**
       * App Store IDs - Required for force update feature
       * Update these after your app is published
       */
      appStoreId: "6758525420", // iOS App Store ID (from App Store Connect)
      playStoreId: "app.cliniko_voice", // Android package name (already set)
    }
  }
};
