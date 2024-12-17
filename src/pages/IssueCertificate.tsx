import { useState } from 'react';
import FileUpload from '../components/FileUpload';
import { CheckCircle, XCircle } from 'lucide-react';
import { generatePDFHash } from '../components/generatePDFHash';
import { contract } from '../web3';

export default function IssueCertificate() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hash, setHash] = useState("");

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setStatus('idle');
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert("Please upload a certificate file.");
      return;
    }

    setStatus('loading'); // Set loading status
    try {
      // Generate the hash of the certificate (metadata-free)
      const hash = await generatePDFHash(selectedFile);
      console.log('Generated Hash:', hash);
      setHash(hash);

      // Request Metamask connection
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const sender = accounts[0]; // Current user's wallet address

      // Call the smart contract's issueCertificate function
      const tx = await contract.methods.issueCertificate(`0x${hash}`).send({
        from: sender,
      });

      console.log("Transaction successful:", tx);
      setStatus('success');
    } catch (error) {
      console.error("Error issuing certificate:", error);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Issue a Certificate
      </h1>
      <p className="text-gray-600 mb-8">
        Upload a certificate to store its hash securely on the blockchain.
      </p>

      <FileUpload onFileSelect={handleFileSelect} />

      {selectedFile && (
        <div className="mt-6">
          <p className="text-sm text-gray-600 mb-4">
            Selected file: {selectedFile.name}
          </p>
          <button
            onClick={handleSubmit}
            disabled={status === 'loading'}
            className={`w-full py-3 px-4 text-white rounded-lg transition-colors ${
              status === 'loading' ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {status === 'loading' ? (
              <div className="flex items-center justify-center">
                <svg
                  className="w-5 h-5 mr-2 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                Processing...
              </div>
            ) : (
              'Issue Certificate'
            )}
          </button>
          <p className="text-sm text-gray-500 mt-2">
            The uploaded file will be hashed (excluding metadata) and stored on the blockchain.
          </p>
        </div>
      )}

      {status === 'success' && (
        <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg flex flex-col items-start">
          <CheckCircle className="mr-2" />
          <div>
            <p>Certificate successfully issued!</p>
            <p className="text-sm mt-2"><strong>Hash:</strong> {hash}</p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
          <XCircle className="mr-2" />
          An error occurred while issuing the certificate.
        </div>
      )}
    </div>
  );
}
