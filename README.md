# 🌐 Onchain Footprint Dashboard

A community-built analytics dashboard measuring **real onchain activity** —  
**Base-first**, and expanding to multi-chain networks.  
Built with 💙 using Next.js, TailwindCSS, and Blockscout APIs.

![Onchain Footprint Banner](public/banner.png)

---

## ✨ Features

- 🧮 Calculates **Onchain Engagement Score** (experimental metric)
- 📊 Shows **transactions, swaps, bridges, contracts, streaks**
- 🌉 Supports **Base, Optimism, Arbitrum, zkSync**, and more
- 🪪 Optional wallet connection via **RainbowKit + Wagmi**
- 💾 Backend-less: All data fetched from public **Blockscout APIs**
- 🔒 No private keys, no tracking — fully open-source

---

## 🧰 Tech Stack

- **Framework:** Next.js (App Router)
- **UI:** TailwindCSS + Recharts
- **Wallet:** RainbowKit + Wagmi
- **Data Source:** Blockscout APIs
- **Hosting:** Vercel
- **Repo:** [GitHub → onchain-footprint](https://github.com/onchain-footprint/onchain-analytics-dashboard)

---

## 🧑‍💻 Local Setup (for devs)

```bash
# 1️⃣ Clone repo
git clone https://github.com/onchain-footprint/onchain-analytics-dashboard.git
cd onchain-analytics-dashboard

# 2️⃣ Install dependencies
npm install --legacy-peer-deps

# 3️⃣ Add environment variables
cp .env.example .env.local
# Fill in your keys:
# NEXT_PUBLIC_COVALENT_API_KEY=your_key_here
# NEXT_PUBLIC_NFT_STORAGE_TOKEN=your_token_here

# 4️⃣ Run locally
npm run dev
# Visit: http://localhost:3000
