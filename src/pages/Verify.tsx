import { useState } from 'react';
import { Shield, CheckCircle, XCircle } from 'lucide-react';
import { contract, web3, issuerContractABI } from '../components/web3'; // Main Factory contract
import { generatePDFHash } from '../components/generatePDFHash';
import FileUpload from '../components/FileUpload';
import { Button } from '../components/Button';

export function Verify() {
  const [, setSelectedFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState('');
  const [status, setStatus] = useState<'Idle' | 'Valid' | 'Invalid'>('Idle');
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (file: File) => {
    try {
      setLoading(true);
      setSelectedFile(file);

      const hash = await generatePDFHash(file);
      setFileHash(hash);
      setStatus('Idle'); // Reset status for new file
    } catch (error) {
      console.error('Error hashing file:', error);
      alert('Failed to process the file.');
    } finally {
      setLoading(false);
    }
  };

  interface Issuer {
    issuerAddress: string;
    organizationName: string;
    organizationData: string;
    isVerified: boolean;
    contractAddress: string;
  }
  
  const verifyCertificate = async () => {
    if (!fileHash) return;
  
    try {
      setLoading(true);
      setStatus('Idle');
  
      // Fetch all issuers from the factory contract
      const issuers = (await contract.methods.getAllIssuers().call()) as Issuer[]; // Type assertion
  
      let isValid = false;
  
      for (const issuer of issuers) {
        const issuerContract = new web3.eth.Contract(issuerContractABI, issuer.contractAddress);
        const result: string = await issuerContract.methods.verifyCertificate(`0x${fileHash}`).call();
        
        if (result === 'Valid') { // Ensure lowercase 'valid' matches Solidity output
          isValid = true;
          break;
        }
      }
  
      setStatus(isValid ? 'Valid' : 'Invalid');
    } catch (error) {
      console.error('Error verifying certificate:', error);
      setStatus('Invalid');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Verify Certificate</h1>
        <p className="text-gray-600 mt-2">Check the authenticity of a certificate</p>
      </header>

      <section className="bg-white rounded-lg shadow-md p-8">
        <FileUpload onFileSelect={handleFileUpload} />

        {fileHash && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg text-blue-700 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <p>
              <strong>File Hash:</strong> 0x{fileHash}
            </p>
          </div>
        )}

        <Button onClick={verifyCertificate} disabled={!fileHash || loading} className="mt-4">
          {loading ? 'Verifying...' : 'Verify Certificate'}
        </Button>

        {status === 'Valid' && (
          <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Certificate is Valid
          </div>
        )}

        {status === 'Invalid' && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            Certificate is Invalid
          </div>
        )}
      </section>
    </div>
  );
}
