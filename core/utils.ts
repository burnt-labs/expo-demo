import * as WebBrowser from "expo-web-browser";

import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const storage = {
  getItem: async (key: string) => {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    } else {
      return await AsyncStorage.getItem(key);
    }
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string) => {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  },
};

export const redirectToDashboard = async () => {
  const treasuryAddress =
    "xion1nn55ch09p4a4z30am967n5n8r75m2ag3s3sujutxfmchhsxqtg3qghdg7h";
  const granteeAddress = "xion1ch67mqf5enje223p7dnuwdkh4xc3acdqhulwhp";

  const redirectUri = "abstraxion-expo://auth"; //comes from app.json

  const dashboardUrl = `https://settings.testnet.burnt.com/?treasury=${treasuryAddress}&grantee=${granteeAddress}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}`;

  // await Linking.openURL(dashboardUrl); // this is a hard app redirect
  const result = await WebBrowser.openAuthSessionAsync(
    dashboardUrl,
    redirectUri
  ); // this is an in-app safari tab

  if (result.type === "success" && result.url) {
    console.log("Returned URL:", result.url);
    const url = new URL(result.url);
    const granterAddress = url.searchParams.get("granter");

    if (granterAddress) {
      console.log("Granter:", granterAddress);
      // perform grant poll/check
    }
  }
};
