import { useState } from 'react';
import { Shield, XCircle, BadgeCheck, AlertCircle, Loader2 } from 'lucide-react';
import { contract, web3, issuerContractABI } from '../components/web3'; // Main Factory contract
import { generatePDFHash } from '../components/generatePDFHash';
import FileUpload from '../components/FileUpload';
import { Button } from '../components/Button';

export function Verify() {
  const [, setSelectedFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    status: 'Idle' | 'Valid' | 'Invalid' | 'Revoked';
    issuerName?: string;
    issuerVerified?: boolean;
  }>({ status: 'Idle' });
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (file: File) => {
    try {
      setLoading(true);
      setSelectedFile(file);

      const hash = await generatePDFHash(file);
      setFileHash(hash);
      setVerificationResult({ status: 'Idle' }); // Reset status for new file
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
      setVerificationResult({ status: 'Idle' });

      // Fetch all issuers from the factory contract
      const issuers = (await contract.methods.getAllIssuers().call()) as Issuer[];

      let certificateStatus: 'Valid' | 'Invalid' | 'Revoked' = 'Invalid';
      let issuerName = '';
      let issuerVerified = false;

      for (const issuer of issuers) {
        const issuerContract = new web3.eth.Contract(issuerContractABI, issuer.contractAddress);
        const result: string = await issuerContract.methods.verifyCertificate(`0x${fileHash}`).call();

        if (result === 'Valid' || result === 'Revoked') {
          certificateStatus = result as 'Valid' | 'Revoked';
          issuerName = issuer.organizationName;
          issuerVerified = issuer.isVerified;
          break;
        }
      }

      setVerificationResult({
        status: certificateStatus,
        issuerName,
        issuerVerified,
      });
    } catch (error) {
      console.error('Error verifying certificate:', error);
      setVerificationResult({ status: 'Invalid' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Verify Certificate</h1>
        <p className="text-xl text-gray-600 mt-2">Check the authenticity of a certificate</p>
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
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Verify Certificate'
          )}
        </Button>

        {verificationResult.status === 'Valid' && verificationResult.issuerVerified && (
          <div className="mt-6 p-6 bg-green-50 text-green-900 rounded-lg shadow-md flex flex-col items-center gap-4">
            <BadgeCheck className="w-12 h-12 text-green-600" />
            <h2 className="text-2xl font-bold">Certificate is Valid</h2>
            <p className="text-lg font-semibold">
              Issued by: <span className="text-green-800">{verificationResult.issuerName}</span>
            </p>
            <p className="text-lg font-semibold text-green-600">Issuer is Verified</p>
          </div>
        )}

        {verificationResult.status === 'Valid' && !verificationResult.issuerVerified && (
          <div className="mt-6 p-6 bg-yellow-50 text-yellow-900 rounded-lg shadow-md flex flex-col items-center gap-4">
            <AlertCircle className="w-12 h-12 text-yellow-600" />
            <h2 className="text-2xl font-bold">Certificate is Valid</h2>
            <p className="text-lg font-semibold">
              Issued by: <span className="text-yellow-800">{verificationResult.issuerName}</span>
            </p>
            <p className="text-lg font-semibold text-yellow-600">Issuer is Unverified</p>
          </div>
        )}

        {verificationResult.status === 'Revoked' && (
          <div className="mt-6 p-6 bg-orange-50 text-orange-900 rounded-lg shadow-md flex flex-col items-center gap-4">
            <XCircle className="w-12 h-12 text-orange-600" />
            <h2 className="text-2xl font-bold">Certificate is Revoked</h2>
            <p className="text-lg font-semibold">
              Issued by: <span className="text-orange-800">{verificationResult.issuerName}</span>
            </p>
            <p className="text-md text-orange-600">This certificate has been revoked by the issuer.</p>
          </div>
        )}

        {verificationResult.status === 'Invalid' && (
          <div className="mt-6 p-6 bg-red-50 text-red-900 rounded-lg shadow-md flex flex-col items-center gap-4">
            <XCircle className="w-12 h-12 text-red-600" />
            <h2 className="text-2xl font-bold">Certificate is Invalid</h2>
            <p className="text-lg">This certificate could not be verified. Please check with the issuer.</p>
          </div>
        )}
      </section>
    </div>
  );
}
