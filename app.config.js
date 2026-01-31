module.exports = {
  expo: {
    name: "Cliniko Voice App",
    slug: "cliniko-voice-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "rork-app",
    userInterfaceStyle: "automatic",
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
        projectId: "your-eas-project-id"
      }
    }
  }
};
