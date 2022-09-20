import "../../styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "jotai";

import { SessionProvider } from "next-auth/react";

import {
  WagmiConfig,
  createClient,
  configureChains,
  defaultChains,
  chain,
  Chain,
} from "wagmi";
import { publicProvider } from "wagmi/providers/public";

const gnosisChain: Chain = {
  id: 100,
  name: "Gnosis Chain",
  network: "gnosis",
  nativeCurrency: {
    decimals: 18,
    name: "XDAI",
    symbol: "XDAI",
  },
  rpcUrls: {
    default: "https://rpc.gnosischain.com",
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://blockscout.com/" },
  },
  testnet: false,
};

const { chains, provider, webSocketProvider } = configureChains(
  [chain.mainnet, chain.polygon, gnosisChain],
  [publicProvider()]
);

const client = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider>
      <WagmiConfig client={client}>
        <SessionProvider
          session={(pageProps as any).session}
          refetchInterval={0}
        >
          <Component {...pageProps} />
        </SessionProvider>
      </WagmiConfig>
    </Provider>
  );
}
