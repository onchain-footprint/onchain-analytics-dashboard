# Onchain Score Dashboard — Frontend MVP

Next.js (App Router) + Tailwind + Recharts + placeholder Wagmi/Zora/IPFS utils.

## 1) Install
```bash
npm install
```

If `zora-sdk` fails to install, remove or replace with the correct SDK package you intend to use (e.g. `@zoralabs/protocol-sdk`).

## 2) Env
Create `.env.local`:
```
NEXT_PUBLIC_COVALENT_API_KEY=
NEXT_PUBLIC_NFT_STORAGE_TOKEN=
```

## 3) Run
```bash
npm run dev
```

Visit http://localhost:3000

## 4) Replace placeholders
- `components/WalletConnectButton.js`: swap with real Wagmi connectors
- `lib/scoreUtils.js`: replace mock fetch with BaseScan/Covalent calls
- `lib/ipfsUtils.js`: implement NFT.Storage upload
- `lib/zoraMint.js`: implement Zora mint transaction on Base
