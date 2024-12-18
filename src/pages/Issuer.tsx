import { useState } from 'react';
import { Shield, CheckCircle, Loader2, FileText } from 'lucide-react';
import { contract, web3, issuerContractABI } from '../components/web3'; // Main Factory contract
import { Button } from '../components/Button';
import { generatePDFHash } from '../components/generatePDFHash';
import FileUpload from '../components/FileUpload';
import { Contract } from 'web3-eth-contract';

// Define issuer type
type Issuer = {
  issuerAddress: string;
  organizationName: string;
  organizationData: string;
  isVerified: boolean;
  contractAddress: string;
};

export function Issuer() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [issuerContractAddress, setIssuerContractAddress] = useState<string | null>(null);
  const [issuerContract, setIssuerContract] = useState<Contract<typeof issuerContractABI> | null>(null);
  const [fileHash, setFileHash] = useState('');
  const [, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgData, setOrgData] = useState('');
  const [dataFetching, setDataFetching] = useState(true);
  const [issuedCertificates, setIssuedCertificates] = useState<string[]>([]);

  // Connect Wallet
  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWallet(accounts[0]);
      await fetchIssuerContract(accounts[0]);
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  // Fetch the issuer's contract address
  const fetchIssuerContract = async (account: string) => {
    setDataFetching(true);
    try {
      const issuerData = (await contract.methods.issuers(account).call()) as Issuer;

      if (issuerData.contractAddress !== '0x0000000000000000000000000000000000000000') {
        setIssuerContractAddress(issuerData.contractAddress);
        const newIssuerContract = new web3.eth.Contract(issuerContractABI, issuerData.contractAddress);
        setIssuerContract(newIssuerContract);
        await fetchIssuedCertificates(newIssuerContract); // Fetch certificates
      } else {
        setIssuerContractAddress(null);
      }
    } catch (error) {
      console.error('Error fetching issuer contract:', error);
    } finally {
      setDataFetching(false);
    }
  };

  // Fetch all issued certificates
  const fetchIssuedCertificates = async (contractInstance: Contract<typeof issuerContractABI>) => {
    try {
      const certHashes = (await contractInstance.methods.getAllCertificates().call()) as string[];
      const filteredHashes = await Promise.all(
        certHashes.map(async (hash) => {
          const isRevoked = await contractInstance.methods.revokedCertificates(hash).call();
          return isRevoked ? null : hash;
        })
      );
      setIssuedCertificates(filteredHashes.filter(Boolean) as string[]);
    } catch (error) {
      console.error('Error fetching issued certificates:', error);
      setIssuedCertificates([]);
    }
  };

  // Sign up as a new issuer
  const signUpIssuer = async () => {
    if (!wallet) return alert('Please connect your wallet first.');
    if (!orgName || !orgData) return alert('Please fill in all organization details.');

    try {
      setLoading(true);
      await contract.methods.signUpIssuer(orgName, orgData).send({ from: wallet });
      alert('Signed up successfully!');
      await fetchIssuerContract(wallet);
    } catch (error) {
      console.error('Error signing up:', error);
      alert('Sign-up failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload and hash generation
  const handleFileUpload = async (file: File) => {
    try {
      setLoading(true);
      setSelectedFile(file);
      const hash = await generatePDFHash(file);
      setFileHash(hash);
    } catch (error) {
      console.error('Error hashing file:', error);
      alert('Failed to process the file.');
    } finally {
      setLoading(false);
    }
  };

  // Issue a certificate
  const issueCertificate = async () => {
    if (!fileHash || !wallet || !issuerContract) return alert('Missing data to issue certificate.');

    try {
      setLoading(true);
      await issuerContract.methods.issueCertificate(`0x${fileHash}`).send({ from: wallet });
      alert('Certificate issued successfully!');
      setFileHash('');
      setSelectedFile(null);
      await fetchIssuedCertificates(issuerContract); // Refresh certificates
    } catch (error) {
      console.error('Error issuing certificate:', error);
    } finally {
      setLoading(false);
    }
  };

  // Revoke a certificate
  const revokeCertificate = async (hash: string) => {
    if (!wallet || !issuerContract) return alert('Missing wallet or contract to revoke certificate.');

    try {
      setLoading(true);
      await issuerContract.methods.revokeCertificate(hash).send({ from: wallet });
      alert('Certificate revoked successfully!');
      await fetchIssuedCertificates(issuerContract); // Refresh certificates
    } catch (error) {
      console.error('Error revoking certificate:', error);
      alert('Failed to revoke certificate.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Issuer Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage certificates and organization details</p>
      </header>

      {/* Wallet Connect */}
      {!wallet ? (
        <div className="flex justify-center">
          <Button icon={Shield} onClick={connectWallet}>
            Connect Wallet
          </Button>
        </div>
      ) : (
        <p className="text-center text-gray-700">
          Connected Wallet: <strong>{wallet}</strong>
        </p>
      )}

      {/* Loading State After Wallet Connect */}
      {wallet && dataFetching && (
        <div className="flex justify-center mt-4">
          <Loader2 className="w-6 h-6 animate-spin" /> <span>Loading...</span>
        </div>
      )}

      {/* Sign Up Section */}
      {wallet && !issuerContractAddress && !dataFetching && (
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Sign Up as an Issuer</h2>
          <input
            type="text"
            placeholder="Organization Name"
            className="w-full p-2 mb-2 border rounded"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Organization Data"
            className="w-full p-2 mb-4 border rounded"
            value={orgData}
            onChange={(e) => setOrgData(e.target.value)}
          />
          <Button onClick={signUpIssuer} disabled={loading}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </Button>
        </section>
      )}

      {/* Issue & Revoke Certificate */}
      {wallet && issuerContractAddress && !dataFetching && (
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Issue Certificate</h2>
          <FileUpload onFileSelect={handleFileUpload} />

          {fileHash && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg text-blue-700 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <p>
                <strong>File Hash:</strong> 0x{fileHash}
              </p>
            </div>
          )}

          <Button onClick={issueCertificate} disabled={loading} className="mt-4">
            {loading ? 'Issuing...' : 'Submit Certificate'}
          </Button>
        </section>
      )}

      {/* Display Issued Certificates */}
      {issuerContractAddress && issuedCertificates.length > 0 && (
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Issued Certificates</h2>
          <ul className="space-y-2">
            {issuedCertificates.map((hash, index) => (
              <li
                key={index}
                className="p-2 bg-gray-100 rounded flex items-center gap-4 justify-between"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span>{hash}</span>
                </div>
                <Button
                  onClick={() => revokeCertificate(hash)}
                  variant="destructive"
                  disabled={loading}
                >
                  {loading ? 'Revoking...' : 'Revoke'}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
