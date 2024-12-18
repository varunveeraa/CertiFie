# Blockchain Certificate Manager - Prototype 2

## Overview
The Blockchain Certificate Manager is a decentralized application (dApp) designed to securely issue, revoke, and verify certificates on the blockchain. It leverages a **Contract Factory Architecture**, allowing issuers to have their own individual smart contracts while ensuring platform credibility through admin verification.

---

## Features
### Admin
- **Verify Issuers**: Approve issuers after reviewing their details.
- **View Verified Issuers**: List of all verified issuers and their contract addresses.

### Issuer
- **Sign-Up as Issuer**: Register with organization details.
- **Issue Certificates**: Upload certificates and store their hash securely on the blockchain.
- **Revoke Certificates**: Remove issued certificates from the ledger.
- **View Issued Certificates**: Display a list of all issued certificate hashes.

### General
- **Smart Contract Architecture**:
  - Contract Factory for creating individual issuer contracts.
  - Decentralized certificate issuance and verification.
- **Blockchain Security**: Immutable records ensure trust and transparency.
- **Wallet Integration**: Uses MetaMask for authentication and blockchain transactions.

---

## **Tech Stack**

- **Frontend**: React.js + TypeScript
- **Blockchain**: Solidity Smart Contract on Sepolia Testnet
- **Wallet Integration**: Metamask
- **Libraries**:
   - `web3.js`: Blockchain interaction
   - `pdf-lib`: Strips metadata from PDF files
   - `lucide-react`: Icons for UI feedback
   - SHA-256 hashing using the Web Crypto API
