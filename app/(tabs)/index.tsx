import { View, StyleSheet, Button } from "react-native";
import { redirectToDashboard } from "@/core/utils";

export default function Index() {
  // useEffect(() => {
  //   const boot = async () => {
  //     try {
  //       const rpcEndpoint = "https://testnet-rpc.xion-api.com:443";
  //       const client = await StargateClient.connect(rpcEndpoint);

  //       const res = await client.getAllBalances(
  //         "xion1qav5azfesa5zu0z3795h06ja0npxcnqg3wu8g4z6l99ekcgacl7smsrvyf"
  //       );

  //       console.log(res);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  //   boot();
  // });

  return (
    <View style={styles.container}>
      <Button title="Login" onPress={redirectToDashboard}></Button>
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
