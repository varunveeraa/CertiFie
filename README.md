# CertiFie - Blockchain Certificate Management

CertiFie is a decentralized web application designed to issue, verify, and manage certificates using blockchain technology. Built with Solidity, React, and IPFS, CertiFie ensures transparency, security, and immutability for certificate management.

---

## 🌟 **Features**

### For Admins:
- **Issuer Management**: Admins can verify new issuers, ensuring a secure and trusted ecosystem.
- **Certificate Insights**: View all certificates issued by verified issuers.
- **Revocation Oversight**: Monitor revoked certificates and maintain platform integrity.

### For Issuers:
- **Decentralized Issuance**: Issue certificates stored securely on IPFS and validated on the Ethereum blockchain.
- **Revocation**: Revoke certificates with ease and maintain a transparent revocation history.
- **Certificate Management**: View all issued and revoked certificates.

### For Verifiers:
- **Instant Verification**: Verify certificate authenticity by hash or file upload.
- **Certificate Access**: Download, print, or share verified certificates.
- **Transparency**: Know the issuer's verification status and certificate issuance details.

---

## 💡 **Technical Architecture**

### Issuance Workflow:
1. **Document Upload**: The certificate is uploaded and stored on a decentralized storage network (IPFS).
2. **Hash Generation**: A unique hash of the document is created for integrity verification.
3. **Blockchain Storage**: The document hash and IPFS pointer are stored on the Ethereum blockchain.
4. **Duplicate Prevention**: The hash ensures that duplicate certificates cannot be issued.

### Verification Workflow:
1. **Hash Verification**: The uploaded certificate or provided hash is checked against the blockchain.
2. **Status Check**: The blockchain confirms whether the certificate is valid, revoked, or invalid.
3. **Certificate Retrieval**: The document is retrieved from IPFS for review, download, or sharing.

---

## 🛠 **Technologies Used**

- **Blockchain**: Solidity, Ethereum (Sepolia Testnet)
- **Frontend**: React, Tailwind CSS
- **Storage**: IPFS (via Pinata)
- **Smart Contract Interaction**: Web3.js
- **Hosting**: Fleek (IPFS-based decentralized hosting)

---

## 🔮 **Future Expansion**

- **Batch Issuance**: Introduce Merkle Tree-based batch certificate issuance to enhance scalability.
- **API Endpoints**: Provide APIs for enterprise and institutional integration.
- **Advanced Verification**: QR-based verification for seamless access to certificate details.
