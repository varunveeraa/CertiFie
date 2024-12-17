import Web3 from 'web3';

declare global {
  interface Window {
    ethereum: any; // Add typing for TypeScript support
  }
}

let web3: Web3;

if (window.ethereum) {
  web3 = new Web3(window.ethereum);
} else {
  console.error("Metamask not found. Please install it to use this app.");
  throw new Error("Metamask not found");
}

const contractAddress = '0x92fCFC8f437BFAC75450124b76d9B328650B2B5c';
const contractABI = [
    {
      anonymous: false,
      inputs: [
        { indexed: true, internalType: "bytes32", name: "certHash", type: "bytes32" },
        { indexed: true, internalType: "address", name: "issuer", type: "address" },
      ],
      name: "CertificateIssued",
      type: "event",
    },
    {
      inputs: [{ internalType: "bytes32", name: "certHash", type: "bytes32" }],
      name: "issueCertificate",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
      name: "certificates",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "bytes32", name: "certHash", type: "bytes32" }],
      name: "verifyCertificate",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
    },
];

const contract = new web3.eth.Contract(contractABI, contractAddress);

export { web3, contract };
