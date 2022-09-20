import { useAccount, useConnect, useEnsName } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

export default function Profile() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });

  if (isConnected) return <div>Connected to {address}</div>;
  return <button onClick={() => connect()}>Connect Wallet</button>;
}
