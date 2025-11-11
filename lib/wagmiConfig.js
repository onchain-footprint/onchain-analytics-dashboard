import { createConfig, http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { injected, coinbaseWallet } from "wagmi/connectors";

export const config = createConfig({
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  connectors: [
    injected({ shimDisconnect: true }),
    coinbaseWallet({ appName: "Onchain Score Dashboard" }),
  ],
});
