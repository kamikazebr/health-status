import { getCsrfToken, signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { SiweMessage } from "siwe";
import { useAccount, useConnect, useNetwork, useSignMessage } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { LayoutContainer } from "../components/Layout";

function Siwe() {
  //   const [{ data: connectData }, connect] = useConnect();

  const { data: session, status: sessionsStatus } = useSession();

  const [message, setMessage] = useState<SiweMessage | undefined>(undefined);
  const {
    connect,
    data: connectData,
    isSuccess,
  } = useConnect({
    connector: new InjectedConnector(),
  });
  const { signMessage, status, data: signature } = useSignMessage();
  const { chain } = useNetwork();
  const { address } = useAccount();
  const callbackUrl = "/api/pro/protected";

  useEffect(() => {
    if (message && signature) {
      signIn("credentials", {
        message: JSON.stringify(message),
        redirect: false,
        signature,
        callbackUrl,
      });
    }
  }, [status, signature]);

  const handleLogin = async () => {
    try {
      console.log("isSuccess", isSuccess);
      connect();

      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in with Ethereum to the app.",
        uri: window.location.origin,
        version: "1",
        chainId: chain?.id,
        nonce: await getCsrfToken(),
      });

      setMessage(message);
      signMessage({
        message: message.prepareMessage(),
      });
    } catch (error) {
      window.alert(error);
    }
  };

  return (
    <LayoutContainer>
      <button
        onClick={() => {
          handleLogin();
        }}
      >
        Sign-In with Ethereum
      </button>
      {!session && (
        <>
          <span>You are not signed in</span>
        </>
      )}
      {JSON.stringify(session, null, 4)}
    </LayoutContainer>
  );
}

// Siwe.Layout = LayoutContainer;

export default Siwe;
