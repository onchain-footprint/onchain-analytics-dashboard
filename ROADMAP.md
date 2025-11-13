# 🗺️ Onchain Footprint — Project Roadmap

> **Community-built dashboard measuring real onchain activity.**  
> Base-first, multi-chain ready. Focused on identifying **real users** — not airdrop farmers.  
> Built by independent builders for the Base ecosystem 💙

---

## 🚀 Phase 1 — Smarter Dashboard (Next 2–3 Weeks)

**Goal:** Make the dashboard data-rich and behavior-aware.

- [ ] 🧠 **User Segmentation (Behavior Clusters)**  
  Automatically classify wallets as:  
  🧍‍♂️ New Onchain User (0–10 txns)  
  ⚡ Active User (10–100 txns)  
  🧱 Builder / Dev (Deployed Contracts)  
  🌉 Bridge User (used cross-chain bridges)  
  💧 DeFi Native (used DEX or lending protocols)

- [ ] 🎯 **Badge System in UI**  
  Display wallet type badges like:  
  🏗️ Builder | 🔄 Swapper | 🌉 Bridger in sidebar / profile header.

- [ ] 🪙 **Score Breakdown Visualization**  
  Replace static score with radar / donut chart showing categories:  
  - Transactions  
  - Swaps  
  - Bridges  
  - Active Days  
  - Smart Contracts  

- [ ] 📈 **Compare Wallets**  
  Allow users to compare 2 wallets side by side (score, tx count, DeFi activity).  
  → Encourages friendly competition in the Base community.

---

## 🌉 Phase 2 — Ecosystem Impact (Next 1–2 Months)

**Goal:** Strengthen Base ecosystem insights and transparency.

- [ ] 🤝 **Base Ecosystem Integration**  
  Detect and display which Base-native projects a wallet interacted with (Aerodrome, Friend.tech, etc.)

- [ ] 🧩 **Project Logos / Recognition Layer**  
  Add /lib/projectsList.js with verified project metadata + logo URLs.  
  Show “Top Protocols Used” section with small icons.

- [ ] 🛡️ **Sybil Check Integration (New)**  
  - Aggregate public Sybil lists from Arbitrum, Optimism, zkSync, Linea, Scroll, EigenLayer, etc.  
  - Show if a wallet address appears in any known Sybil list (with link to source).  
  - Status labels:  
    - 🟢 Verified Human — no flags  
    - 🟠 At Risk — appears in 1 list  
    - 🔴 Flagged — multiple Sybil reports  

  > _“This wallet appears in public Sybil reports: Arbitrum, zkSync”_  
  with direct source links for transparency.

- [ ] 📊 **"Real User Index" (RUI Score)**  
  Combine:  
  - Onchain Score  
  - Sybil Clean Record  
  - Builder / DeFi usage  
  → Final “Proof of Real Activity” score out of 100.

---

## 💡 Phase 3 — Community Growth & Gamification (2–3 Months)

**Goal:** Reward, engage, and grow the Base + multi-chain community.

- [ ] 🪶 **NFT / Badge System (SBTs)**  
  Mintable non-transferable badges like:  
  - 🧱 *Base Builder* — deployed contracts  
  - 🌉 *Bridge Explorer* — bridged across 3+ chains  
  - 💧 *DeFi Native* — 10+ swaps  
  - 💎 *Onchain OG* — score 90+  

- [ ] 🏆 **Global Leaderboard**  
  Track top 100 “Real Users” by score.  
  Show rank, score, and active chain badges.

- [ ] 📢 **Shareable Profile / Tweet Button**  
  Allow users to share their score and badges on X (Twitter) directly.  
  → Example: _“I’m a 🧱 Base Builder with 92 Onchain Score — check yours at @onchainfoot!”_

- [ ] 🌍 **Developer API**  
  Open endpoint:  Returns score breakdown JSON.  
Enables other dapps / analytics tools to integrate “Onchain Footprint” trust score.

- [ ] 💬 **Education Tab — “Improve Your Footprint”**  
Actionable guide showing how users can improve their score:  
✅ Swap on Aerodrome  
✅ Bridge via Superbridge  
✅ Deploy a smart contract  
✅ Maintain activity streak  

---

## 💎 Phase 4 — Vision: Proof of Real Onchain Activity (PROA)

**Long-term goal:**  
Create an open, verifiable metric for *Proof of Real Onchain Activity (PROA)*  
— a trust layer that helps Base & other ecosystems reward real participants.

- [ ] Collaborate with Base ecosystem teams for data grants / indexing access  
- [ ] Build cross-chain trust index combining activity + Sybil proof  
- [ ] Enable SBT-based “Human Onchain ID”  

---

### 🧭 Notes
- Built for the **Base ecosystem**, but scalable to other L2s and EVMs.  
- 100% open-source, transparent methodology.  
- Not affiliated with Base or Coinbase — community-driven initiative.  

---

**Maintained by:** [@onchainfoot](https://x.com/onchainfoot)  
**GitHub:** [onchain-footprint](https://github.com/onchain-footprint/onchain-analytics-dashboard)  
**Live:** [onchain-footprint.vercel.app](https://onchain-footprint.vercel.app)
  