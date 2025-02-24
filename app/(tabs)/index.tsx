import { View, StyleSheet, Button } from "react-native";
import { StargateClient } from "@cosmjs/stargate";
import { useEffect } from "react";
import { AbstraxionAuth } from "@/core/auth";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing/";

const auth = new AbstraxionAuth();

export default function Index() {
  useEffect(() => {
    const boot = async () => {
      try {
        const rpcEndpoint = "https://testnet-rpc.xion-api.com:443";

        const client = await StargateClient.connect(rpcEndpoint);
        const account = await DirectSecp256k1HdWallet.generate();

        const res = await client.getAllBalances(
          "xion1qav5azfesa5zu0z3795h06ja0npxcnqg3wu8g4z6l99ekcgacl7smsrvyf"
        );

        console.log("balances: ", res);
        console.log("directSecp256k1 Account: ", account);
      } catch (error) {
        console.error(error);
      }
    };

    boot();
  });

  useEffect(() => {
    const boot = async () => {
      try {
        const rpcEndpoint = "https://testnet-rpc.xion-api.com:443";
        const restUrl = "https://testnet-api.xion-api.com:443";
        const treasuryAddress =
          "xion1nn55ch09p4a4z30am967n5n8r75m2ag3s3sujutxfmchhsxqtg3qghdg7h";
        const redirectUri = "abstraxion-expo://auth"; //comes from app.json

        auth.configureAbstraxionInstance(
          rpcEndpoint,
          restUrl || "",
          [],
          false,
          [],
          redirectUri,
          treasuryAddress
        );
      } catch (error) {
        console.error(error);
      }
    };

    boot();
  }, []);

  async function handleLogin() {
    try {
      await auth.login();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <View style={styles.container}>
      <Button title="Login" onPress={handleLogin}></Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#000",
  },
});
