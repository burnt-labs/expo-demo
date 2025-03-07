import { View, StyleSheet, Button, Text } from "react-native";
import { useCallback, useEffect, useState } from "react";
import {
  abstraxionAuth,
  useAbstraxionAccount,
  useAbstraxionSigningClient,
} from "@burnt-labs/abstraxion-react-native";

const rpcEndpoint = "https://testnet-rpc.xion-api.com:443";
const restUrl = "https://testnet-api.xion-api.com:443";
const treasuryAddress =
  "xion1nn55ch09p4a4z30am967n5n8r75m2ag3s3sujutxfmchhsxqtg3qghdg7h";
const redirectUri = "abstraxion-expo://"; //comes from app.json
const seatContractAddress =
  "xion1z70cvc08qv5764zeg3dykcyymj5z6nu4sqr7x8vl4zjef2gyp69s9mmdka";

function getTimestampInSeconds(date: Date | null): number {
  if (!date) return 0;
  const d = new Date(date);
  return Math.floor(d.getTime() / 1000);
}

export default function Index() {
  // Abstraxion hooks
  const { data: account } = useAbstraxionAccount();
  const { client, signArb, logout } = useAbstraxionSigningClient();

  const [isConnecting, setIsConnecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [abstraxionAccount, setAbstraxionAccount] = useState(undefined);
  const [granterAddress, setGranterAddress] = useState("");
  const [signArbResponse, setSignArbResponse] = useState("");
  const [txHash, setTxHash] = useState("");

  async function handleLogin() {
    try {
      setIsConnecting(true);
      await abstraxionAuth.login();
    } catch (error) {
      console.log(error);
    } finally {
      setIsConnecting(false);
    }
  }

  async function claimSeat(): Promise<void> {
    setLoading(true);
    const msg = {
      sales: {
        claim_item: {
          token_id: String(getTimestampInSeconds(new Date())),
          owner: account.bech32Address,
          token_uri: "",
          extension: {},
        },
      },
    };

    try {
      // Use "auto" fee for most transactions
      const claimRes = await client?.execute(
        account.bech32Address,
        seatContractAddress,
        msg,
        "auto"
      );
      // Default cosmsjs gas multiplier for simulation is 1.4
      // If you're finding that transactions are undersimulating, you can bump up the gas multiplier by setting fee to a number, ex. 1.5
      // Fee amounts shouldn't stray too far away from the defaults
      // Example:
      // const claimRes = await client?.execute(
      //   account.bech32Address,
      //   seatContractAddress,
      //   msg,
      //   1.5,
      // );
      setTxHash(claimRes?.transactionHash || "");
    } catch (error) {
      // eslint-disable-next-line no-console -- No UI exists yet to display errors
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSign(): Promise<void> {
    if (client?.granteeAddress) {
      const response = await signArb?.(client.granteeAddress, "FOOBAR");
      if (response) setSignArbResponse(response);
    }
  }

  useEffect(() => {
    const unsubscribe = abstraxionAuth.subscribeToAuthStateChange(
      async (newState: boolean) => {
        if (newState !== isConnected) {
          setIsConnected(newState);
          if (newState) {
            const account = await abstraxionAuth.getLocalKeypair();
            const granterAddress = await abstraxionAuth.getGranter();
            // setAbstraxionAccount(account);
            setGranterAddress(granterAddress);
          }
        }
      }
    );

    return () => {
      unsubscribe?.();
    };
  }, [isConnected, abstraxionAuth]);

  useEffect(() => {
    async function persist() {
      await abstraxionAuth.authenticate();
    }

    if (!isConnecting && !abstraxionAccount && !granterAddress) {
      persist();
    }
  }, [isConnecting, abstraxionAccount, abstraxionAuth, granterAddress]);

  const handleLogout = useCallback(() => {
    setIsConnected(false);
    setAbstraxionAccount(undefined);
    setGranterAddress("");
    setSignArbResponse("");
    setTxHash("");
    logout?.();
  }, [abstraxionAuth]);

  return (
    <View style={styles.container}>
      {isConnected ? (
        <>
          <Button
            title={loading ? "LOADING..." : "Claim seat"}
            onPress={claimSeat}
          ></Button>
          <Button title="Sign Arb" onPress={handleSign}></Button>
        </>
      ) : null}
      {isConnected ? (
        <Button title="Logout" onPress={handleLogout}></Button>
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
