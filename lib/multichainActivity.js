// lib/multichainActivity.js
import axios from "axios";
import { CHAINS } from "./chainList";

/* ----------------- utils ----------------- */
function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function calculateStreaks(dates) {
  if (!dates.length) return { longestStreak: 0, currentStreak: 0 };
  const unique = [...new Set(dates.map(d => new Date(d).toDateString()))]
    .map(d => startOfDay(d))
    .sort((a, b) => a - b);

  let longest = 1, run = 1;
  for (let i = 1; i < unique.length; i++) {
    const diff = (unique[i] - unique[i - 1]) / 86400000;
    if (diff === 1) {
      run++;
      if (run > longest) longest = run;
    } else run = 1;
  }

  let currentStreak = 0;
  const today = startOfDay(new Date());
  for (let i = unique.length - 1; i >= 0; i--) {
    const expected = new Date(today);
    expected.setDate(today.getDate() - currentStreak);
    if (unique[i].getTime() === expected.getTime()) currentStreak++;
    else break;
  }

  return { longestStreak: longest, currentStreak };
}

/* ----------------- per-chain fetch (normal + internal) ----------------- */
async function fetchBlockscout(address, explorerBase) {
  const limit = 10000;

  async function pull(action) {
    let page = 1;
    let out = [];
    while (true) {
      try {
        const proxyUrl = `/api/fetch-chain?address=${address}&explorer=${encodeURIComponent(explorerBase)}`;
        const { data } = await axios.get(proxyUrl);

        if (!data || data.message === "NOTOK" || typeof data.result === "string") {
          console.warn(`⚠️ ${explorerBase} ${action} page ${page}: message=${data?.message}`);
          if (page > 1) break;
          else {
            page++;
            continue;
          }
        }

        const result = Array.isArray(data?.result) ? data.result : [];
        if (result.length === 0) break;

        const valid = result.filter(tx => !tx.isError || tx.isError === "0");
        out.push(...valid);

        if (result.length < limit) break;
        page++;
        await new Promise(r => setTimeout(r, 250));
      } catch (e) {
        console.warn(`⚠️ ${explorerBase} ${action} page ${page} failed: ${e.message}`);
        break;
      }
    }
    return out;
  }

  try {
    const [normal, internal] = await Promise.allSettled([
      pull("txlist"),
      pull("txlistinternal"),
    ]);

    const n = normal.status === "fulfilled" ? normal.value : [];
    const i = internal.status === "fulfilled" ? internal.value : [];

    // ✅ Deduplicate txs by hash
    const map = new Map();
    [...n, ...i].forEach(tx => {
      if (!map.has(tx.hash)) map.set(tx.hash, tx);
    });
    const all = Array.from(map.values());

    console.log(`✅ ${explorerBase} — normal ${n.length}, internal ${i.length}, total ${all.length}`);
    return all;
  } catch (err) {
    console.error(`❌ fetchBlockscout failed: ${explorerBase}`, err.message);
    return [];
  }
}

/* ----------------- detectors (shared across chains) ----------------- */
const DEX_ADDRESSES_COMMON = [
  // Common routers seen across EVM chains
  "0x4200000000000000000000000000000000000006", // Uniswap Universal Router
  "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45", // Uniswap V3
  "0x1111111254fb6c44bac0bed2854e76f90643097d", // 1inch
  "0x1b02da8cb0d097eb8d57a175b88c7d8b47997506", // Sushi

  // Base
  "0x1a6f1e2b2385c4937b6cfe9f9376c2b0409b9db0", // Aerodrome
  "0x2e3e6e9307b6ef5e90c611b5fba1db9d4d7b6a24", // BaseSwap

  // zkSync
  "0x8015c6d8f7a3e7e3d02f0a6c3df8d91e3cb9c8e8", // SyncSwap Router
  "0x0f3ad4e0d9d6b8a69a7b77d1b69c6bfa3fa2c3c7", // Mute.io Router
  "0x3b627b21ce77c38e4a9302ccb9d90b25d74ccd0c", // iZiSwap Router

  // Scroll
  "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad", // PancakeSwap
  "0xb90fcf7f2b6ac7a93e10c764b8e9f7f57c6b3f21", // SyncSwap Scroll

  // ETH
  "0x7a250d5630b4cf539739df2c5dacab9c659f2488", // UniswapV2
  "0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f", // Sushi ETH
].map(x => x.toLowerCase());

const SWAP_KEYWORDS = [
  "swap", "router", "pool", "exchange", "dex",
  "uniswap", "sushi", "1inch", "aerodrome",
  "syncswap", "mute", "izumi", "pancake", "baseswap"
];

// ✅ Add method signatures for DEX swap detection
const SWAP_METHOD_SIGS = [
  "0x38ed1739", // swapExactTokensForTokens
  "0x8803dbee", // swapTokensForExactTokens
  "0x7ff36ab5", // swapExactETHForTokens
  "0x18cbafe5", // swapExactTokensForETH
  "0x4bb278f3", // swapTokensForExactETH
  "0xfb3bdb41", // swapExactETHForTokensSupportingFeeOnTransferTokens
  "0x5c11d795", // swapExactTokensForETHSupportingFeeOnTransferTokens
  "0xb6f9de95", // swapExactTokensForTokensSupportingFeeOnTransferTokens
  "0x472b43f3", // SyncSwap exact input
  "0xd06ca61f", // Mute.io swap
  "0x83e17f7a"  // iZiSwap
];

const BRIDGE_KEYWORDS = [
  "bridge","l1standardbridge","l2standardbridge","optimismportal",
  "hop","stargate","across","superbridge","orbiter","layerzero",
  "relay","depositeth","finalizewithdrawal","withdrawtokento","sendmessage",
  "routereth","ultralightnode","merkly","gasrefuel","refuel"
];

const BRIDGE_ADDRESSES = [
  "0x4200000000000000000000000000000000000010",
  "0x4200000000000000000000000000000000000011",
  "0x4200000000000000000000000000000000000013",
  "0x4200000000000000000000000000000000000007",
  "0x99c9fc46f92e8a1c0dec1b1747d010903e884be1",
  "0x50b6ebc2103bfec165949cc946d739d5650d7ae4",
  "0xb6319cc64b2e105b9c3310f9c2d4b3b7b5c4720d",
  "0x1a44076050125825900e736c501f859c50fe728c",
  "0x3c2269811836af69497e5f486a85d7316753cf62",
  "0xb8901acb165ed027e32754e0ffe830802919727f",
  "0xa4cee444f1e5d6a8e3e5dcf57f8a2cf3b2f0aebe",
  "0x5c7bcd6e7de5423a257d81b442095a1a6ced35c5",
  "0x6bf98654205b1ac38645880ae20fc00b0bb9ffca",
].map(x => x.toLowerCase());

const BRIDGE_METHOD_SIGS = [
  "0x44df8e70","0xf632b3e8","0x41c0e1b5","0xd8ce1f44","0x8c1f44d2","0x47e7ef24","0x15f7c33e"
];

/* ----------------- analyze tx list -> metrics ----------------- */
function analyzeTxs(txs, snapshotDateISO = null) {
  if (!txs?.length) {
    return {
      txCount: 0,
      activeDays: 0,
      uniqueContracts: 0,
      swaps: 0,
      bridges: 0,
      contractsDeployed: 0,
      longestStreak: 0,
      currentStreak: 0,
      periodDays: 0,
      lastActivityAt: null,
      airdrop: { before: 0, after: 0 },
    };
  }

  const txDates = txs.map(tx => new Date(Number(tx.timeStamp) * 1000));
  const first = new Date(Math.min(...txDates));
  const last = new Date(Math.max(...txDates));
  const periodDays = Math.max(0, Math.round((startOfDay(last) - startOfDay(first)) / 86400000));
  const { longestStreak, currentStreak } = calculateStreaks(txDates.map(d => d.toDateString()));
  const activeDays = new Set(txDates.map(d => startOfDay(d).toDateString())).size;
  const uniqueContracts = new Set(txs.map(tx => tx.to?.toLowerCase()).filter(Boolean)).size;

  const swaps = txs.filter(tx => {
    const to = (tx.to || "").toLowerCase();
    const input = (tx.input || "").toLowerCase();
    return (
      DEX_ADDRESSES_COMMON.includes(to) ||
      SWAP_KEYWORDS.some(k => to.includes(k)) ||
      SWAP_KEYWORDS.some(k => input.includes(k)) ||
      SWAP_METHOD_SIGS.some(sig => input.startsWith(sig))
    );
  }).length;

  const bridges = txs.filter(tx => {
    const to = (tx.to || "").toLowerCase();
    const input = (tx.input || "").toLowerCase();
    return (
      BRIDGE_ADDRESSES.includes(to) ||
      BRIDGE_KEYWORDS.some(k => to.includes(k)) ||
      BRIDGE_KEYWORDS.some(k => input.includes(k)) ||
      BRIDGE_METHOD_SIGS.some(sig => input.startsWith(sig)) ||
      (parseInt(tx.value || "0") > 0 && (to.includes("portal") || to.includes("router") || to.includes("layerzero")))
    );
  }).length;

  const contractsDeployed = txs.filter(tx => tx.contractAddress && tx.contractAddress !== "").length;

  let airdrop = { before: 0, after: 0 };
  if (snapshotDateISO) {
    const ts = Date.parse(snapshotDateISO);
    const before = txs.filter(tx => Number(tx.timeStamp) * 1000 < ts).length;
    const after = txs.filter(tx => Number(tx.timeStamp) * 1000 >= ts).length;
    airdrop = { before, after };
  }

  return {
    txCount: txs.length,
    activeDays,
    uniqueContracts,
    swaps,
    bridges,
    contractsDeployed,
    longestStreak,
    currentStreak,
    periodDays,
    lastActivityAt: startOfDay(last).toISOString(),
    airdrop,
  };
}

/* ----------------- public: fetch all chains ----------------- */
export async function fetchAllChainsActivity(address) {
  if (!address || !address.startsWith("0x")) throw new Error("Invalid address");

  const entries = Object.entries(CHAINS);
  const out = {};

  for (const [key, cfg] of entries) {
    try {
      const list = await fetchBlockscout(address, cfg.explorer);
      out[key] = {
        chain: key,
        label: cfg.label,
        explorer: cfg.explorer,
        ...analyzeTxs(list, cfg.airdropSnapshot),
      };
    } catch (e) {
      out[key] = {
        chain: key,
        label: cfg.label,
        explorer: cfg.explorer,
        error: e?.message || "Failed to fetch",
        txCount: 0,
        activeDays: 0,
        uniqueContracts: 0,
        swaps: 0,
        bridges: 0,
        contractsDeployed: 0,
        longestStreak: 0,
        currentStreak: 0,
        periodDays: 0,
        lastActivityAt: null,
        airdrop: { before: 0, after: 0 },
      };
    }
  }

  return out;
}
