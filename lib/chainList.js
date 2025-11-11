// lib/chainList.js

export const CHAINS = {
  ethereum: {
    label: "Ethereum",
    explorer: "https://eth.blockscout.com",
    airdropSnapshot: null, // No airdrop
  },

  base: {
    label: "Base",
    explorer: "https://base.blockscout.com",
    airdropSnapshot: null, // ❌ No airdrop yet
  },

  arbitrum: {
    label: "Arbitrum",
    // using Arbiscan-compatible Blockscout mirror
    explorer: "https://arbitrum.blockscout.com",
    // Official ARB snapshot
    airdropSnapshot: "2023-03-06",
  },

  optimism: {
    label: "Optimism",
    explorer: "https://optimism.blockscout.com",
    // OP airdrop rounds started ~May 2022 (main airdrop)
    airdropSnapshot: "2022-05-31",
  },

  scroll: {
    label: "Scroll",
    explorer: "https://scroll.blockscout.com",
    // Scroll airdrop snapshot — April 2024 (community reward)
    airdropSnapshot: "2024-04-01",
  },

//   linea: {
//     label: "Linea",
//     explorer: "https://linea.blockscout.com",
//     // Linea Voyage reward snapshot (Aug 2023)
//     airdropSnapshot: "2023-08-31",
//   },

  zksync: {
    label: "zkSync Era",
    // Blockscout endpoint for zkSync mainnet
    explorer: "https://zksync.blockscout.com",
    // zkSync airdrop snapshot (official token distribution) — March 2024
    airdropSnapshot: "2024-03-24",
  },

//   polygonZkEvm: {
//     label: "Polygon zkEVM",
//     explorer: "https://polygonzkevm.blockscout.com",
//     airdropSnapshot: null, // no airdrop
//   },

//   zora: {
//     label: "Zora",
//     explorer: "https://zora.blockscout.com",
//     airdropSnapshot: null,
//   },
};
