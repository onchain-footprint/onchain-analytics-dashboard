import axios from "axios";
import { ethers } from "ethers";

/* ---------- utils ---------- */
function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/* ---------- STREAK CALCULATION ---------- */
function calculateStreaks(dates) {
  if (!dates.length) return { longestStreak: 0, currentStreak: 0 };

  const uniqueDates = [...new Set(dates.map(d => new Date(d).toDateString()))]
    .map(d => startOfDay(d))
    .sort((a, b) => a - b);

  let longest = 1, run = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const diffDays = (uniqueDates[i] - uniqueDates[i - 1]) / 86400000;
    if (diffDays === 1) {
      run++;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }

  // current streak counting backwards from today
  let currentStreak = 0;
  const today = startOfDay(new Date());
  for (let i = uniqueDates.length - 1; i >= 0; i--) {
    const expected = new Date(today);
    expected.setDate(today.getDate() - currentStreak);
    if (uniqueDates[i].getTime() === expected.getTime()) currentStreak++;
    else break;
  }

  return { longestStreak: longest, currentStreak };
}

/* ---------- ENS NAME LOOKUP (reverse + forward verified) ---------- */
async function fetchENSName(address) {
  try {
    const provider = new ethers.JsonRpcProvider("https://eth.llamarpc.com"); // free mainnet RPC
    const name = await provider.lookupAddress(address);
    if (!name) return null;

    const resolved = await provider.resolveName(name);
    if (resolved && resolved.toLowerCase() === address.toLowerCase()) {
      return name;
    }
    return null;
  } catch (err) {
    console.warn("⚠️ ENS lookup failed:", err.message);
    return null;
  }
}

/* ---------- Blockscout (normal + internal) ---------- */
async function fetchBlockscoutChain(address, chain) {
  const baseUrl =
    chain === "base"
      ? "https://base.blockscout.com"
      : "https://eth.blockscout.com";

  const limit = 10000;

  async function fetchTxList(action) {
    let page = 1;
    let txs = [];
    while (true) {
      try {
        const url = `${baseUrl}/api?module=account&action=${action}&address=${address}&page=${page}&offset=${limit}&sort=asc`;
        const { data } = await axios.get(url, { timeout: 20000 });
        if (!data || !Array.isArray(data.result) || data.result.length === 0) break;

        const valid = data.result.filter(tx => tx.isError === "0");
        txs.push(...valid);

        if (valid.length < limit) break;
        page++;
        await new Promise(r => setTimeout(r, 300));
      } catch (e) {
        console.warn(`⚠️ ${chain} ${action} page ${page} failed: ${e.message}`);
        break;
      }
    }
    return txs;
  }

  try {
    const [normal, internal] = await Promise.allSettled([
      fetchTxList("txlist"),
      fetchTxList("txlistinternal"),
    ]);

    const txNormal = normal.status === "fulfilled" ? normal.value : [];
    const txInternal = internal.status === "fulfilled" ? internal.value : [];
    const all = [...txNormal, ...txInternal];

    console.log(
      `✅ ${chain.toUpperCase()} TXs: normal ${txNormal.length}, internal ${txInternal.length}, total ${all.length}`
    );
    return all;
  } catch (err) {
    console.error(`❌ ${chain} fetch failed:`, err.message);
    return [];
  }
}

/* ---------- MAIN ACTIVITY FETCH ---------- */
export async function fetchWalletActivity(address) {
  if (!address || !address.startsWith("0x")) return null;

  try {
    const [baseTxs, ethTxs] = await Promise.all([
      fetchBlockscoutChain(address, "base"),
      fetchBlockscoutChain(address, "eth"),
    ]);

    const allTxs = [...baseTxs, ...ethTxs];
    if (!allTxs.length) {
      return {
        address,
        ensName: null,
        txCount: 0,
        activeDays: 0,
        uniqueContracts: 0,
        swaps: 0,
        bridges: 0,
        contractsDeployed: 0,
        longestStreak: 0,
        currentStreak: 0,
        lendStake: 0,
        ensTx: 0,
        periodDays: 0,
        lastActivityAt: null,
        inactiveDays: 0,
      };
    }

    const txDates = allTxs.map(tx => new Date(Number(tx.timeStamp) * 1000));
    const firstTx = new Date(Math.min(...txDates));
    const lastTx = new Date(Math.max(...txDates));
    const periodDays = Math.max(0, Math.round((startOfDay(lastTx) - startOfDay(firstTx)) / 86400000));

    const { longestStreak, currentStreak } = calculateStreaks(
      txDates.map(d => d.toDateString())
    );

    const activeDays = new Set(txDates.map(d => startOfDay(d).toDateString())).size;
    const uniqueContracts = new Set(
      allTxs.map(tx => tx.to?.toLowerCase()).filter(Boolean)
    ).size;

    /* ---------- SWAPS (DEX) ---------- */
    const DEX_ADDRESSES = [
      "0x4200000000000000000000000000000000000006",
      "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45",
      "0x1a6f1e2b2385c4937b6cfe9f9376c2b0409b9db0",
      "0x2e3e6e9307b6ef5e90c611b5fba1db9d4d7b6a24",
      "0x1111111254fb6c44bac0bed2854e76f90643097d",
      "0x1b02da8cb0d097eb8d57a175b88c7d8b47997506",
    ];
    const swapKeywords = ["swap", "router", "pool", "aerodrome", "uniswap", "baseswap"];
    const swaps = allTxs.filter(tx => {
      const to = (tx.to || "").toLowerCase();
      const input = (tx.input || "").toLowerCase();
      return (
        DEX_ADDRESSES.includes(to) ||
        swapKeywords.some(k => to.includes(k)) ||
        swapKeywords.some(k => input.includes(k))
      );
    }).length;

    /* ---------- BRIDGES ---------- */
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
    ];
    const bridges = allTxs.filter(tx => {
      const to = (tx.to || "").toLowerCase();
      const input = (tx.input || "").toLowerCase();
      return (
        BRIDGE_ADDRESSES.includes(to) ||
        BRIDGE_KEYWORDS.some(k => to.includes(k)) ||
        BRIDGE_KEYWORDS.some(k => input.includes(k))
      );
    }).length;

    /* ---------- LENDING / STAKING ---------- */
    const LEND_KEYWORDS = ["aave","compound","morpho","moonwell","lido","stake","rocketpool","stader","venus","cream","yearn","benqi"];
    const genericFns = ["deposit","withdraw","stake","unstake","borrow","repay","mint","redeem"];
    const lendStake = allTxs.filter(tx => {
      const to = (tx.to || "").toLowerCase();
      const input = (tx.input || "").toLowerCase();
      return (
        LEND_KEYWORDS.some(k => to.includes(k)) ||
        LEND_KEYWORDS.some(k => input.includes(k)) ||
        genericFns.some(fn => input.includes(fn))
      );
    }).length;

    /* ---------- CONTRACTS DEPLOYED ---------- */
    const contractsDeployed = allTxs.filter(
      tx => tx.contractAddress && tx.contractAddress !== ""
    ).length;

    /* ---------- ENS INTERACTION DETECTION ---------- */
    const ENS_ADDRESSES = [
      "0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e",
      "0x253553366da2be7b2324facf0a0f20a6c9f52f1b",
      "0x4976fb03c32e5b8cfe9f6ccb31c09ba78ebaba41",
      "0x283f227c4bd38ece252c4ae7ece650b0e913f1f9",
      "0x084b1c3c81545d370f3634392de611caabff8148",
    ];
    const ENS_KEYWORDS = ["ens", "resolver", "reverse", "registrar", "setname", "setaddr"];
    const ensTx = allTxs.some(tx => {
      const to = (tx.to || "").toLowerCase();
      const input = (tx.input || "").toLowerCase();
      return (
        ENS_ADDRESSES.includes(to) ||
        ENS_KEYWORDS.some(k => to.includes(k)) ||
        ENS_KEYWORDS.some(k => input.includes(k))
      );
    }) ? 1 : 0;

    /* ---------- INACTIVITY ---------- */
    const lastActivityAt = startOfDay(lastTx).toISOString();
    const today = startOfDay(new Date());
    const inactiveDays = Math.max(0, Math.round((today - startOfDay(lastTx)) / 86400000));

    /* ---------- ENS NAME FETCH ---------- */
    const ensName = await fetchENSName(address);

    return {
      address,
      ensName: ensName || null,
      txCount: allTxs.length,
      activeDays,
      uniqueContracts,
      swaps,
      bridges,
      contractsDeployed,
      longestStreak,
      currentStreak,
      lendStake,
      ensTx,
      periodDays,
      lastActivityAt,
      inactiveDays,
    };
  } catch (err) {
    console.error("🔥 fetchWalletActivity failed:", err.message);
    return {
      address,
      ensName: null,
      txCount: 0,
      activeDays: 0,
      uniqueContracts: 0,
      swaps: 0,
      bridges: 0,
      contractsDeployed: 0,
      longestStreak: 0,
      currentStreak: 0,
      lendStake: 0,
      ensTx: 0,
      periodDays: 0,
      lastActivityAt: null,
      inactiveDays: 0,
    };
  }
}

/* ---------- RELAXED ONCHAIN SCORE (90+ FOR ACTIVE USERS) ---------- */
export function computeBaseOnchainScore({
  txCount = 0,
  activeDays = 0,
  uniqueContracts = 0,
  swaps = 0,
  bridges = 0,
  contractsDeployed = 0,
  longestStreak = 0,
  currentStreak = 0,
  lendStake = 0,
  ensTx = 0,
  periodDays = 0,
  inactiveDays = 0,
}) {
  // 🧩 Light buff (~10% higher than last version)
  const txPts         = Math.min(10, Math.log10(txCount + 1) * 7.5);      // +4%
  const activeDaysPts = Math.min(10, Math.sqrt(activeDays) / 2.25);       // +5%
  const contractsPts  = Math.min(10, Math.sqrt(uniqueContracts) / 2.25);  // +5%
  const swapsPts      = Math.min(10, Math.sqrt(swaps * 4.8));             // +6%
  const bridgesPts    = Math.min(10, Math.sqrt(bridges * 5.5));           // +6%
  const lendStakePts  = Math.min(5, lendStake >= 5 ? 4.5 : lendStake * 0.8);
  const ensPts        = ensTx > 0 ? 3.0 : 0;
  const deployPts     = Math.min(10, contractsDeployed >= 5 ? 9.3 : contractsDeployed * 2.1);
  const streakPts     = Math.min(10, (longestStreak / 1.85) + (currentStreak * 1.45));
  const periodPts     = Math.min(10, Math.sqrt(periodDays / 26));         // +3%

  // ⚖️ Slightly boosted weights (back near original)
  const baseTotal =
    txPts * 1.2 +
    activeDaysPts * 1.25 +
    contractsPts * 1.15 +
    swapsPts * 1.25 +
    bridgesPts * 1.25 +
    lendStakePts * 0.35 +
    ensPts * 0.35 +
    deployPts * 0.95 +
    streakPts * 1.05 +
    periodPts * 1.15;

  // Normalize a bit stronger (was /8.0 → /7.9)
  let score = Math.min(100, Math.round((baseTotal / 7.9) * 10));

  // 💥 Bonuses and decay
  const streakBonus = Math.min(10, Math.floor(currentStreak / 2));
  const decayPenalty = Math.min(3, Math.floor(inactiveDays / 25));

  score = Math.max(0, Math.min(100, score + streakBonus - decayPenalty));

  return score;
}


/* ---------- TIER ---------- */
export function getTierFromScore(score) {
  if (score >= 90) return "Diamond";
  if (score >= 70) return "Gold";
  if (score >= 40) return "Silver";
  return "Bronze";
}
