"use client";

import "../lib/polyfills";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "@rainbow-me/rainbowkit/styles.css";
import {
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mainnet, base, optimism, arbitrum, scroll, zksync } from "wagmi/chains";

// ✅ ensure only one global instance
let wagmiConfig = null;

function getWagmiConfig() {
  if (!wagmiConfig) {
    wagmiConfig = getDefaultConfig({
      appName: "Onchain Score Dashboard",
      projectId: "your_walletconnect_project_id_here",
      chains: [mainnet, base, optimism, arbitrum, scroll, zksync],
      ssr: false,
    });
  }
  return wagmiConfig;
}

function ProvidersInternal({ children }) {
  const [queryClient] = useState(() => new QueryClient());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <WagmiProvider config={getWagmiConfig()}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#0052FF",
            accentColorForeground: "#fff",
            borderRadius: "large",
            overlayBlur: "small",
          })}
          modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default dynamic(() => Promise.resolve(ProvidersInternal), { ssr: false });
