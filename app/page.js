"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const { address: connectedAddress, isConnected } = useAccount();

  useEffect(() => {
    if (isConnected && connectedAddress) {
      setAddress(connectedAddress);
    }
  }, [isConnected, connectedAddress]);

  const handleBaseView = () => {
    if (!validateAddress()) return;
    router.push(`/dashboard?address=${address}`);
  };

  const handleMultichainView = () => {
    if (!validateAddress()) return;
    router.push(`/multichain?address=${address}`);
  };

  const validateAddress = () => {
    if (!address) {
      setError("⚠️ Please enter a wallet address or connect your wallet.");
      return false;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setError("❌ Invalid Ethereum/Base wallet address format.");
      return false;
    }
    setError("");
    return true;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0A192F] via-[#0E1E3C] to-[#0B1A2D] text-white relative overflow-hidden">
      {/* Base-style background glows */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[40%] w-[700px] h-[700px] bg-[#0052FF] opacity-25 blur-[180px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[30%] w-[500px] h-[500px] bg-[#93C5FD] opacity-10 blur-[140px] rounded-full"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] to-[#0052FF]">
          Base Onchain Scoreboard
        </h1>
        <div className="scale-95 hover:scale-100 transition-transform">
          <ConnectButton
            label="Connect Wallet"
            showBalance={false}
            chainStatus="icon"
            accountStatus="address"
          />
        </div>
      </header>

      {/* Main content */}
      <section className="relative z-10 mx-auto max-w-2xl mt-16 bg-[#0E1016]/70 backdrop-blur-md border border-[#1C2435] rounded-2xl p-8 shadow-[0_0_40px_-10px_rgba(0,82,255,0.3)]">
        <p className="text-neutral-300 leading-relaxed mb-6 text-center">
          Explore how active your wallet has been <br />
          across <span className="text-[#93C5FD] font-semibold">Base</span> and other chains.
          <br /> 
          Check your <span className="text-[#60A5FA] font-semibold">Onchain Score</span>, 
          activity patterns, pre/post airdrop moves, and deployed contracts.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value.trim())}
            placeholder="🔗 0x... wallet address"
            className="flex-1 rounded-xl bg-[#121620] border border-[#1F2A3D] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0052FF] text-sm sm:text-base placeholder:text-neutral-500 text-white transition-all"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm mt-3 text-center">{error}</p>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <button
            onClick={handleBaseView}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#0052FF] to-[#60A5FA] hover:opacity-90 text-white px-6 py-3 rounded-xl font-semibold shadow-[0_0_20px_-5px_rgba(0,82,255,0.5)] transition-all"
          >
            ⚡ View Base Stats
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleMultichainView}
            className="flex items-center justify-center gap-2 bg-[#0E1016] border border-[#1F2A3D] hover:bg-[#121A2A] text-[#93C5FD] px-6 py-3 rounded-xl font-semibold transition-all"
          >
            🌐 View Multichain
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Educational Section */}
      <section className="relative z-10 max-w-4xl mx-auto mt-16 px-6 md:px-0 text-center space-y-8">
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#60A5FA] to-[#93C5FD] bg-clip-text text-transparent">
          Why Onchain Activity Matters 💡
        </h2>
        <p className="text-neutral-300 leading-relaxed text-sm md:text-base max-w-2xl mx-auto">
          Onchain activity helps identify{" "}
          <span className="text-[#93C5FD] font-medium">real users</span> who
          interact meaningfully with the Base ecosystem — not just wallets
          created for airdrops.
          <br />
          By comparing <span className="text-[#34D399]">Pre-Airdrop</span> and{" "}
          <span className="text-[#FBBF24]">Post-Airdrop</span> engagement, we can
          visualize how genuine adoption evolves over time.
        </p>

        <div className="grid sm:grid-cols-3 gap-6 text-sm text-neutral-300 mt-8">
          <div className="bg-[#0E1016]/60 border border-[#1C2435] rounded-xl p-5">
            <p className="text-[#93C5FD] font-semibold mb-2">Pre-Airdrop</p>
            <p>
              Captures early activity — showing users who were already engaging
              before any reward speculation.
            </p>
          </div>
          <div className="bg-[#0E1016]/60 border border-[#1C2435] rounded-xl p-5">
            <p className="text-[#34D399] font-semibold mb-2">Post-Airdrop</p>
            <p>
              Measures whether users kept interacting after rewards — a true
              test of sustainable onchain behavior.
            </p>
          </div>
          <div className="bg-[#0E1016]/60 border border-[#1C2435] rounded-xl p-5">
            <p className="text-[#FBBF24] font-semibold mb-2">Real Users</p>
            <p>
              Long-term consistent activity across Base and other chains is the
              clearest sign of genuine Web3 participation.
            </p>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="relative z-10 text-center text-neutral-400 text-xs max-w-3xl mx-auto mt-14 px-6 leading-relaxed">
        ⚠️ <span className="text-[#93C5FD] font-medium">Note:</span> This
        project is an independent analytics experiment built by the community.
        It is <span className="text-[#F87171] font-semibold">not affiliated</span> 
        with or endorsed by the official{" "}
        <span className="text-[#60A5FA] font-medium">Base</span> team.
        The Onchain Score is an{" "}
        <span className="text-[#FBBF24] font-semibold">experimental metric</span>{" "}
        to visualize blockchain engagement — it does not represent any official
        ranking or eligibility.
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-neutral-500 text-sm text-center mt-20 pb-6 border-t border-[#1C2435] pt-6">
        Built with 💙 for the{" "}
        <span className="text-[#60A5FA] font-medium">Base</span> community by{" "}
        <span className="font-semibold">Vishal</span> | Powered by{" "}
        <span className="text-[#93C5FD]">Next.js + Wagmi + Blockscout</span>
      </footer>
    </main>
  );
}
