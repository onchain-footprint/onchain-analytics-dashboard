"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchAllChainsActivity } from "../../lib/multichainActivity";
import { CHAINS } from "../../lib/chainList";

export default function MultiChainDashboard() {
  const searchParams = useSearchParams();
  const address = searchParams.get("address");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(address));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!address) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetchAllChainsActivity(address);
        setData(res);
      } catch (e) {
        setError(e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [address]);

  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!address)
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0A192F] to-[#0B243A] text-[#E5E7EB]">
        <p className="text-[#9CA3AF]">
          ⚠️ Provide <span className="font-mono">?address=0x...</span> in URL.
        </p>
      </main>
    );

  if (loading)
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0A192F] to-[#0B243A] text-[#E5E7EB]">
        <p className="text-[#9CA3AF] animate-pulse">
          ⏳ Fetching multi-chain activity…
        </p>
      </main>
    );

  if (error || !data)
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0A192F] to-[#0B243A] text-red-400">
        {error || "Something went wrong."}
      </main>
    );

  const chainEntries = Object.entries(data);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0A192F] via-[#102B4A] to-[#0B243A] text-[#E5E7EB] py-10 px-6 md:px-12 space-y-10">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#60A5FA] to-[#93C5FD] bg-clip-text text-transparent">
          Multi-Chain Onchain Footprint
        </h1>

        <p className="text-sm text-[#D1D5DB] font-mono">
          Wallet:{" "}
          <a
            href={`https://base.blockscout.com/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            title={address}
            className="text-[#93C5FD] hover:underline"
          >
            {formatAddress(address)}
          </a>
        </p>
      </header>

      {/* Chain cards */}
      <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {chainEntries.map(([key, c]) => (
          <div
            key={key}
            className="bg-[#0E172A]/60 border border-[#1E3A8A]/40 backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all hover:scale-105 hover:border-[#60A5FA]/60"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#F3F4F6]">{c.label}</h3>
              <a
                href={`${c.explorer}/address/${address}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#93C5FD] hover:underline"
              >
                View ↗
              </a>
            </div>

            {c.error ? (
              <p className="text-red-400 text-sm">Failed: {c.error}</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Metric label="Transactions" value={c.txCount} color="text-[#93C5FD]" />
                  <Metric label="Active Days" value={c.activeDays} color="text-[#818CF8]" />
                  <Metric label="Contracts" value={c.uniqueContracts} color="text-[#34D399]" />
                  <Metric label="Swaps" value={c.swaps} color="text-[#F472B6]" />
                  <Metric label="Bridges" value={c.bridges} color="text-[#FACC15]" />
                  <Metric label="Contracts Deployed" value={c.contractsDeployed} color="text-[#C084FC]" />
                  <Metric label="Longest Streak" value={`${c.longestStreak}d`} color="text-[#F59E0B]" />
                  <Metric label="Current Streak" value={`${c.currentStreak}d`} color="text-[#22D3EE]" />
                  <Metric label="Activity Period" value={`${c.periodDays}d`} color="text-[#E5E7EB]" />
                </div>

                {CHAINS[key]?.airdropSnapshot && (
                  <div className="rounded-xl border border-[#1E3A8A]/50 bg-[#102A43]/60 backdrop-blur-sm p-4 hover:border-[#60A5FA]/60 transition">
                    <h4 className="text-sm text-[#A1A1AA] mb-2">
                      Airdrop Activity (snapshot {CHAINS[key].airdropSnapshot})
                    </h4>
                    <div className="flex justify-between text-sm">
                      <div className="text-[#93C5FD]">
                        Before: <span className="font-semibold text-[#BFDBFE]">{c.airdrop?.before || 0}</span>
                      </div>
                      <div className="text-[#34D399]">
                        After: <span className="font-semibold text-[#A7F3D0]">{c.airdrop?.after || 0}</span>
                      </div>
                    </div>
                    <div className="h-2 mt-2 bg-[#1E3A8A]/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#60A5FA] to-[#34D399] transition-all duration-700"
                        style={{
                          width: `${Math.min(100, ((c.airdrop?.after || 0) / ((c.airdrop?.before || 1) + (c.airdrop?.after || 0))) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                <p className="text-xs text-[#A1A1AA] mt-3">
                  Last activity:{" "}
                  {c.lastActivityAt ? new Date(c.lastActivityAt).toDateString() : "—"}
                </p>
              </>
            )}
          </div>
        ))}
      </section>

      {/* 🔹 Improved Airdrop Pre/Post Table */}
      <section className="bg-[#0E172A]/70 border border-[#1E3A8A]/40 backdrop-blur-md rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-semibold mb-6 text-[#F3F4F6]">
          Airdrop Pre/Post Activity
        </h3>
        <div className="overflow-x-auto rounded-xl">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-[#1E3A8A]/30 text-[#A1A1AA]">
                <th className="text-left p-3">Chain</th>
                <th className="text-left p-3">Snapshot</th>
                <th className="text-right p-3">Before</th>
                <th className="text-right p-3">After</th>
                <th className="text-right p-3">Change</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(CHAINS)
                .filter(([_, cfg]) => cfg.airdropSnapshot)
                .map(([key, cfg], i) => {
                  const row = data[key];
                  const before = row?.airdrop?.before || 0;
                  const after = row?.airdrop?.after || 0;
                  const change =
                    before === 0 ? 0 : ((after - before) / before) * 100;

                  return (
                    <tr
                      key={key}
                      className={`border-t border-[#1E3A8A]/30 hover:bg-[#1E3A8A]/20 transition ${
                        i % 2 === 0 ? "bg-[#0F213C]/40" : "bg-transparent"
                      }`}
                    >
                      <td className="p-3 font-medium text-[#E5E7EB]">{cfg.label}</td>
                      <td className="p-3 text-[#9CA3AF]">{cfg.airdropSnapshot}</td>
                      <td className="p-3 text-right text-[#93C5FD]">{before}</td>
                      <td className="p-3 text-right text-[#34D399]">{after}</td>
                      <td
                        className={`p-3 text-right font-semibold ${
                          change >= 0 ? "text-[#22D3EE]" : "text-[#F87171]"
                        }`}
                      >
                        {before === 0 ? "—" : `${change.toFixed(1)}%`}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-[#9CA3AF] mt-4 text-center">
          📘 Snapshot times are estimated — edit in{" "}
          <span className="font-mono text-[#93C5FD]">lib/chainList.js</span>.
        </p>
      </section>

      <footer className="text-[#9CA3AF] text-sm text-center pt-8 border-t border-[#1E3A8A]/40">
        Built with ❤️ — Multi-chain via Blockscout APIs (normal + internal)
      </footer>
    </main>
  );
}

function Metric({ label, value, color = "text-white" }) {
  return (
    <div className="rounded-xl bg-[#122C4A]/60 border border-[#1E3A8A]/40 backdrop-blur-sm p-4 text-center">
      <p className="text-[#A1A1AA] text-xs">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}
