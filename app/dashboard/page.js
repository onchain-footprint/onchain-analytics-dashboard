"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  fetchWalletActivity,
  computeBaseOnchainScore,
  getTierFromScore,
} from "../../lib/scoreUtils";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const address = searchParams.get("address");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!address) return;
    async function loadData() {
      try {
        setLoading(true);
        const result = await fetchWalletActivity(address);
        setData(result);
      } catch (err) {
        console.error("Error fetching wallet data:", err);
        setError("Failed to fetch wallet activity.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [address]);

  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!address)
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0D0D20] to-[#050510] text-[#E5E7EB]">
        <p className="text-[#9CA3AF]">
          ⚠️ No wallet address provided. Go back and enter one.
        </p>
      </main>
    );

  if (loading)
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0D0D20] to-[#050510] text-[#E5E7EB]">
        <p className="text-[#9CA3AF] animate-pulse">
          ⏳ Fetching onchain data from Base...
        </p>
      </main>
    );

  if (error || !data)
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0D0D20] to-[#050510] text-red-400">
        {error || "Something went wrong."}
      </main>
    );

  const score = computeBaseOnchainScore(data);
  const tier = getTierFromScore(score);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0D0D20] to-[#050510] text-[#E5E7EB] py-10 px-6 md:px-12 space-y-10">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0052FF] to-[#60A5FA] bg-clip-text text-transparent drop-shadow-sm">
          Base Onchain Score
        </h1>

        <p className="text-sm text-[#9CA3AF] font-mono">
          Wallet:{" "}
          <a
            href={`https://base.blockscout.com/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#60A5FA] hover:underline cursor-pointer"
            title={address}
          >
            {formatAddress(address)}
          </a>
        </p>
      </header>

      {/* Summary Cards */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {[
          { label: "Transactions", value: data.txCount, color: "text-[#60A5FA]" },
          { label: "Active Days", value: data.activeDays, color: "text-[#818CF8]" },
          { label: "Contracts", value: data.uniqueContracts, color: "text-[#34D399]" },
          { label: "Swaps", value: data.swaps, color: "text-[#F472B6]" },
          { label: "Activity Period (Days)", value: data.periodDays, color: "text-[#FACC15]" },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-[#0E0E25] border border-[#1E1E30] rounded-2xl p-5 text-center shadow-md hover:shadow-lg transition-all hover:scale-105"
          >
            <h3 className="text-[#9CA3AF] text-xs md:text-sm">{item.label}</h3>
            <p className={`text-2xl md:text-3xl font-bold mt-2 ${item.color}`}>
              {item.value}
            </p>
          </div>
        ))}
      </section>

      {/* Tier + Score */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#0E0E25] border border-[#1E1E30] rounded-2xl p-8 text-center shadow-md">
          <h3 className="text-lg text-[#A1A1AA] font-semibold">
            Your Onchain Tier
          </h3>
          <p
            className={`text-5xl font-bold mt-4 ${
              tier === "Diamond"
                ? "text-[#60A5FA]"
                : tier === "Gold"
                ? "text-[#FACC15]"
                : tier === "Silver"
                ? "text-[#9CA3AF]"
                : "text-[#6B7280]"
            }`}
          >
            {tier}
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#0E1A45] to-[#0030A0] border border-[#1E40AF] rounded-2xl p-8 shadow-lg text-center">
          <h3 className="text-xl font-semibold text-[#BFDBFE]">Onchain Score</h3>
          <p className="text-7xl font-bold mt-4 text-white drop-shadow">
            {score}
            <span className="text-4xl text-[#93C5FD]"> /100</span>
          </p>
          <p className="text-sm text-[#93C5FD] mt-3">
            Based on 10 Base network signals (txns, bridges, swaps, contracts…)
          </p>
        </div>
      </section>

      {/* Activity Breakdown */}
      <section className="bg-[#0E0E25] border border-[#1E1E30] rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-[#E5E7EB]">Activity Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-[#9CA3AF] text-sm">Bridges</p>
            <p className="text-3xl font-bold text-[#818CF8]">{data.bridges}</p>
          </div>
          <div>
            <p className="text-[#9CA3AF] text-sm">Contracts Deployed</p>
            <p className="text-3xl font-bold text-[#F472B6]">{data.contractsDeployed}</p>
          </div>
          <div>
            <p className="text-[#9CA3AF] text-sm">Longest Streak</p>
            <p className="text-3xl font-bold text-[#F97316]">{data.longestStreak} days</p>
          </div>
          <div>
            <p className="text-[#9CA3AF] text-sm">Current Streak</p>
            <p className="text-3xl font-bold text-[#34D399]">{data.currentStreak} days</p>
          </div>
        </div>
      </section>

      {/* Recency */}
      <div className="bg-[#0E0E25] border border-[#1E1E30] rounded-2xl p-6 space-y-2">
        <h3 className="text-lg font-semibold text-[#E5E7EB]">Recency</h3>
        <p className="text-sm text-[#9CA3AF]">
          Last active:{" "}
          <span className="text-white">
            {data.lastActivityAt
              ? new Date(data.lastActivityAt).toDateString()
              : "—"}
          </span>
        </p>
        <p className="text-sm text-[#9CA3AF]">
          Inactive days:{" "}
          <span className="text-white">{data.inactiveDays}</span>
        </p>
      </div>

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
