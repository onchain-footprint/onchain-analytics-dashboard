"use client";
import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export default function WalletConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Avoid hydration mismatch
    return <div className="h-8 w-32 bg-neutral-900 rounded-lg" />;
  }

  if (isConnected) {
    return (
      <button className="btn" onClick={() => disconnect()}>
        {address.slice(0, 6)}...{address.slice(-4)} (Disconnect)
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <button
          key={connector.id}
          className="btn"
          onClick={() => connect({ connector })}
          disabled={isPending}
        >
          Connect {connector.name}
        </button>
      ))}
    </div>
  );
}
