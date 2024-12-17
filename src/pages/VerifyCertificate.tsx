import { useState } from 'react';
import FileUpload from '../components/FileUpload';
import { CheckCircle, XCircle } from 'lucide-react';
import { contract } from '../web3'; // Import the contract instance
import { generatePDFHash } from '../components/generatePDFHash'; // Hash utility

export default function VerifyCertificate() {
  const [status, setStatus] = useState<'idle' | 'valid' | 'invalid' | 'error'>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setStatus('idle');
  };

  const handleVerify = async () => {
    if (!selectedFile) {
      alert("Please upload a certificate file.");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Generate hash of the uploaded PDF (excluding metadata)
      const hash = await generatePDFHash(selectedFile);
      console.log("Generated Hash:", hash);

      // Step 2: Query the blockchain to verify the hash
      const isValid = await contract.methods.verifyCertificate(`0x${hash}`).call();

      // Step 3: Update status based on the blockchain response
      setStatus(isValid ? 'valid' : 'invalid');
    } catch (error) {
      console.error("Error verifying certificate:", error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Verify a Certificate
      </h1>
      <p className="text-gray-600 mb-8">
        Upload a certificate to check if it's authentic.
      </p>

      <FileUpload onFileSelect={handleFileSelect} />

      {selectedFile && (
        <div className="mt-6">
          <p className="text-sm text-gray-600 mb-4">
            Selected file: {selectedFile.name}
          </p>
          <button
            onClick={handleVerify}
            className={`w-full py-3 px-4 ${
              loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            } text-white rounded-lg transition-colors`}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify Certificate'}
          </button>
          <p className="text-sm text-gray-500 mt-2">
            The uploaded file will be hashed (excluding metadata) and compared against blockchain records.
          </p>
        </div>
      )}

      {status === 'valid' && (
        <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg flex items-center">
          <CheckCircle className="mr-2" />
          Certificate is Valid
        </div>
      )}

      {status === 'invalid' && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
          <XCircle className="mr-2" />
          Certificate is Invalid
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4 p-4 bg-yellow-50 text-yellow-700 rounded-lg flex items-center">
          <XCircle className="mr-2" />
          An error occurred while verifying the certificate.
        </div>
      )}
    </div>
  );
}
