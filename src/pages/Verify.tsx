import { useState } from 'react';
import { Shield, XCircle, BadgeCheck, Loader2, Search, Globe } from 'lucide-react';
import { contract, web3, issuerContractABI } from '../components/web3'; // Main Factory contract
import { generatePDFHash } from '../components/generatePDFHash';
import FileUpload from '../components/FileUpload';
import { Button } from '../components/Button';

export function Verify() {
  const [searchHash, setSearchHash] = useState('');
  const [searchResult, setSearchResult] = useState<{
    status: 'Idle' | 'Valid' | 'Invalid' | 'Revoked';
    cid?: string;
    issuerName?: string;
    issuerVerified?: boolean;
  }>({ status: 'Idle' });

  const [, setSelectedFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    status: 'Idle' | 'Valid' | 'Invalid' | 'Revoked';
    cid?: string;
    issuerName?: string;
    issuerVerified?: boolean;
  }>({ status: 'Idle' });

  const [loading, setLoading] = useState(false);

  // Search Certificate by Hash
  const searchCertificate = async () => {
    if (!searchHash) return alert('Please enter a hash to search.');
  
    try {
      setLoading(true);
      setSearchResult({ status: 'Idle' });
  
      // Fetch all issuers from the factory contract
      const issuers = (await contract.methods.getAllIssuers().call()) as {
        issuerAddress: string;
        organizationName: string;
        organizationData: string;
        isVerified: boolean;
        contractAddress: string;
      }[];
  
      let certificateStatus: 'Valid' | 'Invalid' | 'Revoked' = 'Invalid';
      let cid = '';
      let issuerName = '';
      let issuerVerified = false;
  
      for (const issuer of issuers) {
        const issuerContract = new web3.eth.Contract(issuerContractABI, issuer.contractAddress);
        const result = (await issuerContract.methods.verifyCertificate(searchHash).call()) as [string, string];
  
        if (result[0] === 'Valid' || result[0] === 'Revoked') {
          certificateStatus = result[0] as 'Valid' | 'Revoked';
          cid = result[1];
          issuerName = issuer.organizationName;
          issuerVerified = issuer.isVerified;
          break;
        }
      }
  
      setSearchResult({
        status: certificateStatus,
        cid,
        issuerName,
        issuerVerified,
      });
    } catch (error) {
      console.error('Error searching certificate:', error);
      setSearchResult({ status: 'Invalid' });
    } finally {
      setLoading(false);
    }
  };
  

  // Verify Certificate by File Upload
  const handleFileUpload = async (file: File) => {
    try {
      setLoading(true);
      setSelectedFile(file);

      const hash = await generatePDFHash(file);
      setFileHash(hash);
      setVerificationResult({ status: 'Idle' });

      // Fetch all issuers from the factory contract
      const issuers = (await contract.methods.getAllIssuers().call()) as {
        issuerAddress: string;
        organizationName: string;
        organizationData: string;
        isVerified: boolean;
        contractAddress: string;
      }[];

      let certificateStatus: 'Valid' | 'Invalid' | 'Revoked' = 'Invalid';
      let cid = '';
      let issuerName = '';
      let issuerVerified = false;

      for (const issuer of issuers) {
        const issuerContract = new web3.eth.Contract(issuerContractABI, issuer.contractAddress);
        const result = (await issuerContract.methods.verifyCertificate(`0x${hash}`).call()) as [string, string];

        if (result[0] === 'Valid' || result[0] === 'Revoked') {
          certificateStatus = result[0] as 'Valid' | 'Revoked';
          cid = result[1];
          issuerName = issuer.organizationName;
          issuerVerified = issuer.isVerified;
          break;
        }
      }

      setVerificationResult({
        status: certificateStatus,
        cid,
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
        <p className="text-xl text-gray-600 mt-2">Search or verify a certificate's authenticity</p>
      </header>

      {/* Search Bar */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Search Certificate</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Enter certificate hash"
            value={searchHash}
            onChange={(e) => setSearchHash(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <Button onClick={searchCertificate} disabled={loading} className="px-4">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </Button>
        </div>
        {searchResult.status !== 'Idle' && (
          <div className="mt-4 p-4 rounded-lg">
            {searchResult.status === 'Valid' && (
              <div className="bg-green-50 text-green-800 p-4 rounded-lg flex flex-col items-center gap-4">
                <BadgeCheck className="w-12 h-12 text-green-600" />
                <h2 className="text-lg font-bold">Certificate is Valid</h2>
                <p className="text-md">
                  <strong>Issuer:</strong> {searchResult.issuerName}
                </p>
                <p className={`text-md ${searchResult.issuerVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                  {searchResult.issuerVerified ? 'Issuer Verified' : 'Issuer Unverified'}
                </p>
                <p className="text-md text-gray-600">Document not tampered</p>
                <p className="text-md text-gray-600 flex items-center gap-1">
                  <Globe className="w-4 h-4" /> Issued on the Ethereum network
                </p>
                <Button
                  onClick={() =>
                    window.open(`https://gateway.pinata.cloud/ipfs/${searchResult.cid}`, '_blank', 'noopener,noreferrer')
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  View Certificate
                </Button>
              </div>
            )}
            {searchResult.status === 'Revoked' && (
              <div className="bg-orange-50 text-orange-800 p-4 rounded-lg flex flex-col items-center gap-4">
                <XCircle className="w-12 h-12 text-orange-600" />
                <h2 className="text-lg font-bold">Certificate is Revoked</h2>
                <p className="text-md">Issued by: {searchResult.issuerName}</p>
              </div>
            )}
            {searchResult.status === 'Invalid' && (
              <div className="bg-red-50 text-red-800 p-4 rounded-lg flex flex-col items-center gap-4">
                <XCircle className="w-12 h-12 text-red-600" />
                <h2 className="text-lg font-bold">Certificate is Invalid</h2>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Verify Section */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Verify Certificate</h2>
        <FileUpload onFileSelect={handleFileUpload} />
        {fileHash && (
          <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-lg flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <p>
              <strong>File Hash:</strong> 0x{fileHash}
            </p>
          </div>
        )}
        {verificationResult.status !== 'Idle' && (
          <div className="mt-4 p-4 rounded-lg">
            {verificationResult.status === 'Valid' && (
              <div className="bg-green-50 text-green-800 p-4 rounded-lg flex flex-col items-center gap-4">
                <BadgeCheck className="w-12 h-12 text-green-600" />
                <h2 className="text-lg font-bold">Certificate is Valid</h2>
                <p className="text-md">
                  <strong>Issuer:</strong> {verificationResult.issuerName}
                </p>
                <p className={`text-md ${verificationResult.issuerVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                  {verificationResult.issuerVerified ? 'Issuer Verified' : 'Issuer Unverified'}
                </p>
                <p className="text-md text-gray-600">Document not tampered</p>
                <p className="text-md text-gray-600 flex items-center gap-1">
                  <Globe className="w-4 h-4" /> Issued on the Ethereum network
                </p>
                <Button
                  onClick={() =>
                    window.open(
                      `https://gateway.pinata.cloud/ipfs/${verificationResult.cid}`,
                      '_blank',
                      'noopener,noreferrer'
                    )
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  View Certificate
                </Button>
              </div>
            )}
            {verificationResult.status === 'Revoked' && (
              <div className="bg-orange-50 text-orange-800 p-4 rounded-lg flex flex-col items-center gap-4">
                <XCircle className="w-12 h-12 text-orange-600" />
                <h2 className="text-lg font-bold">Certificate is Revoked</h2>
              </div>
            )}
            {verificationResult.status === 'Invalid' && (
              <div className="bg-red-50 text-red-800 p-4 rounded-lg flex flex-col items-center gap-4">
                <XCircle className="w-12 h-12 text-red-600" />
                <h2 className="text-lg font-bold">Certificate is Invalid</h2>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
