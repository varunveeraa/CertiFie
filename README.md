# Blockchain-Based Certificate Manager - Prototype 1

This project is a **Blockchain-powered Certificate Management System** where:
1. **Issuers** can issue certificates by uploading a PDF file. The application hashes the file (excluding metadata) and stores the hash securely on the blockchain.
2. **Verifiers** can verify certificates by uploading the same PDF file to check if the hash exists on the blockchain.

This implementation uses **React.js** for the frontend, **Web3.js** for blockchain interactions, and a smart contract deployed on the **Sepolia Ethereum Testnet**.

---

## **Features**

- **Certificate Issuance**:
   - Issuers upload a PDF file.
   - The file is hashed (metadata stripped) using SHA-256.
   - The hash is stored on the blockchain using a smart contract.

- **Certificate Verification**:
   - Verifiers upload a PDF file.
   - The file is hashed and compared against hashes stored on the blockchain.
   - The result shows whether the certificate is **valid** or **invalid**.

- **User Experience**:
   - Loading indicators when interacting with the blockchain.
   - Success and error messages for feedback.

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
