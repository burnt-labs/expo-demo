import { View, StyleSheet, Button, Text } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { AbstraxionAuth } from "@/core/auth";
import { SignArbSecp256k1HdWallet } from "@/core/signArbWallet";
import {
  ReactNativeRedirectStrategy,
  ReactNativeStorageStrategy,
} from "@/core/strategies";

const auth = new AbstraxionAuth(
  new ReactNativeStorageStrategy(),
  new ReactNativeRedirectStrategy()
);

const rpcEndpoint = "https://testnet-rpc.xion-api.com:443";
const restUrl = "https://testnet-api.xion-api.com:443";
const treasuryAddress =
  "xion1nn55ch09p4a4z30am967n5n8r75m2ag3s3sujutxfmchhsxqtg3qghdg7h";
const redirectUri = "abstraxion-expo://auth"; //comes from app.json

export default function Index() {
  useEffect(() => {
    const boot = async () => {
      try {
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

  const [isConnecting, setIsConnecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [abstraxionAccount, setAbstraxionAccount] = useState<
    SignArbSecp256k1HdWallet | undefined
  >(undefined);
  const [granterAddress, setGranterAddress] = useState("");
  const [signArbResponse, setSignArbResponse] = useState("");
  const [txHash, setTxHash] = useState("");

  async function handleLogin() {
    try {
      setIsConnecting(true);
      await auth.login();
    } catch (error) {
      console.log(error);
    } finally {
      setIsConnecting(false);
    }
  }

  async function claimSeat(): Promise<void> {
    setLoading(true);
    const bech32Address = await auth.getKeypairAddress();
    const instantiateSampleTreasuryMsg = {
      type_urls: ["/cosmos.bank.v1beta1.MsgSend"],
      grant_configs: [
        {
          description: "Test",
          optional: false,
          authorization: {
            type_url: "/cosmos.authz.v1beta1.GenericAuthorization",
            value: "ChwvY29zbW9zLmJhbmsudjFiZXRhMS5Nc2dTZW5k",
          },
        },
      ],
      fee_config: {
        description: "Test",
        allowance: {
          type_url: "/cosmos.feegrant.v1beta1.BasicAllowance",
          value: "Cg0KBXV4aW9uEgQxMDAw",
        },
      },
      admin: bech32Address,
    };

    try {
      const client = await auth.getSigner();
      const claimRes = await client?.instantiate(
        bech32Address,
        2037,
        instantiateSampleTreasuryMsg,
        "Expo demo instantiate test",
        "auto"
      );

      console.log(claimRes);
      setTxHash(claimRes.transactionHash);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSign(): Promise<void> {
    const signerClient = await auth.getSigner();
    if (!signerClient) {
      throw new Error("No signer client");
    }
    if (!auth.abstractAccount) {
      throw new Error("No sign arb wallet");
    }
    const response = await auth.abstractAccount.signArb?.(
      signerClient.granteeAddress,
      "FOOBAR"
    );
    setSignArbResponse(response);
  }

  useEffect(() => {
    const unsubscribe = auth.subscribeToAuthStateChange(
      async (newState: boolean) => {
        if (newState !== isConnected) {
          setIsConnected(newState);
          if (newState) {
            const account = await auth.getLocalKeypair();
            const granterAddress = await auth.getGranter();
            setAbstraxionAccount(account);
            setGranterAddress(granterAddress);
          }
        }
      }
    );

    return () => {
      unsubscribe?.();
    };
  }, [isConnected, auth]);

  useEffect(() => {
    async function persist() {
      await auth.authenticate();
    }

    if (!isConnecting && !abstraxionAccount && !granterAddress) {
      persist();
    }
  }, [isConnecting, abstraxionAccount, auth, granterAddress]);

  const logout = useCallback(() => {
    setIsConnected(false);
    setAbstraxionAccount(undefined);
    setGranterAddress("");
    setSignArbResponse("");
    setTxHash("");
    auth.logout();
  }, [auth]);

  return (
    <View style={styles.container}>
      {isConnected ? (
        <>
          <Button
            title={loading ? "LOADING..." : "Instantiate sample treasury"}
            onPress={claimSeat}
          ></Button>
          <Button title="Sign Arb" onPress={handleSign}></Button>
        </>
      ) : null}
      {isConnected ? (
        <Button title="Logout" onPress={logout}></Button>
      ) : (
        <Button title="Login" onPress={handleLogin}></Button>
      )}
      {signArbResponse ? <Text>{signArbResponse}</Text> : null}
      {txHash ? <Text>{txHash}</Text> : null}
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
