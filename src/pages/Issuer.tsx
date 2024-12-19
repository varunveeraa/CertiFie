import { useState } from 'react';
import { Shield, FileText } from 'lucide-react';
import axios from 'axios';
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
  const [fileHash, setFileHash] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataFetching, setDataFetching] = useState(true);
  const [issuedCertificates, setIssuedCertificates] = useState<
    { hash: string; cid: string; revoked: boolean }[]
  >([]);
  const [revokedCertificates, setRevokedCertificates] = useState<
    { hash: string; cid: string }[]
  >([]);
  const [orgName, setOrgName] = useState<string>('');
  const [orgData, setOrgData] = useState<string>('');
  const [isSigningUp, setIsSigningUp] = useState(false);

  const PINATA_API_KEY = '5155247b965c28b58cd5';
  const PINATA_API_SECRET = '5dcc98a25848e7222092c99d46a993b684ee11e53d3b6ec9c109aaa0d44b2b89';

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

  interface IssuerData {
    contractAddress: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any; // To allow other unknown properties if needed
  }

  // Fetch the issuer's contract address
  const fetchIssuerContract = async (account: string) => {
    setDataFetching(true);
    try {
      const issuerData = (await contract.methods.issuers(account).call()) as IssuerData;

      if (issuerData.contractAddress !== '0x0000000000000000000000000000000000000000') {
        setIssuerContractAddress(issuerData.contractAddress);
        const newIssuerContract = new web3.eth.Contract(issuerContractABI, issuerData.contractAddress);
        setIssuerContract(newIssuerContract);
        await fetchCertificates(newIssuerContract);
      } else {
        setIssuerContractAddress(null);
      }
    } catch (error) {
      console.error('Error fetching issuer contract:', error);
    } finally {
      setDataFetching(false);
    }
  };

  // Fetch all certificates and categorize them
  const fetchCertificates = async (contractInstance: Contract<typeof issuerContractABI>) => {
    try {
      const certHashes = (await contractInstance.methods.getAllCertificates().call()) as string[];
  
      if (certHashes.length === 0) {
        setIssuedCertificates([]);
        setRevokedCertificates([]);
        return;
      }
  
      const certificateData = await Promise.all(
        certHashes.map(async (hash: string) => {
          const certificateInfo = (await contractInstance.methods.certificates(hash).call()) as {
            cid: string;
            isRevoked: boolean;
          };
          return { hash, cid: certificateInfo.cid, revoked: certificateInfo.isRevoked };
        })
      );
  
      // Separate active and revoked certificates
      const activeCertificates = certificateData.filter(({ revoked }) => !revoked);
      const revokedCertificates = certificateData.filter(({ revoked }) => revoked);
  
      // Update state
      setIssuedCertificates(activeCertificates);
      setRevokedCertificates(revokedCertificates);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      setIssuedCertificates([]);
      setRevokedCertificates([]);
    }
  };
  

  // Upload certificate to IPFS using Pinata
  const uploadToIPFS = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        issuedBy: wallet,
        type: 'Certificate',
      },
    });

    formData.append('pinataMetadata', metadata);

    try {
      const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_API_SECRET,
        },
      });
      return response.data.IpfsHash;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw new Error('Failed to upload file to IPFS.');
    }
  };

  // Handle file upload and hash generation
  const handleFileUpload = async (uploadedFile: File) => {
    try {
      setFile(uploadedFile);

      const hash = await generatePDFHash(uploadedFile);
      setFileHash(hash);
    } catch (error) {
      console.error('Error hashing file:', error);
      alert('Failed to process the file.');
    }
  };

  // Issue a certificate
  const issueCertificate = async () => {
    if (!file || !fileHash || !wallet || !issuerContract) return alert('Missing data to issue certificate.');

    try {
      setLoading(true);

      const cid = await uploadToIPFS(file);

      await issuerContract.methods.issueCertificate(`0x${fileHash}`, cid).send({ from: wallet });
      alert('Certificate issued successfully!');
      setFileHash(null);
      setFile(null);
      await fetchCertificates(issuerContract);
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
  
      // Immediately refresh issued and revoked certificates
      await fetchCertificates(issuerContract);
    } catch (error) {
      console.error('Error revoking certificate:', error);
      alert('Failed to revoke certificate.');
    } finally {
      setLoading(false);
    }
  };
  
  
  // Sign up as a new issuer
  const signUpIssuer = async () => {
    if (!wallet) return alert('Please connect your wallet first.');
    if (!orgName || !orgData) return alert('Please fill in all organization details.');

    try {
      setIsSigningUp(true);
      await contract.methods.signUpIssuer(orgName, orgData).send({ from: wallet });
      alert('Signed up successfully!');
      await fetchIssuerContract(wallet);
    } catch (error) {
      console.error('Error signing up:', error);
      alert('Sign-up failed.');
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Issuer Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage certificates and organization details</p>
      </header>

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
          <Button onClick={signUpIssuer} disabled={isSigningUp}>
            {isSigningUp ? 'Signing Up...' : 'Sign Up'}
          </Button>
        </section>
      )}

      {wallet && issuerContractAddress && !dataFetching && (
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Issue Certificate</h2>
          <FileUpload onFileSelect={handleFileUpload} />

          {fileHash && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg text-blue-700 flex flex-col gap-2">
              <p>
                <strong>File Hash:</strong> 0x{fileHash}
              </p>
            </div>
          )}

          <Button onClick={issueCertificate} disabled={!file || !fileHash || loading} className="mt-4">
            {loading ? 'Issuing...' : 'Submit Certificate'}
          </Button>
        </section>
      )}

      {issuerContractAddress && issuedCertificates.length > 0 && (
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Issued Certificates</h2>
          <ul className="space-y-4">
            {issuedCertificates.map(({ hash, cid }, index) => (
              <li
                key={index}
                className="p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-100 border-gray-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <FileText className="w-6 h-6 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-800 truncate">
                      <strong>Hash:</strong> {hash}
                    </p>
                    <p className="text-sm text-green-600 font-semibold">Status: Active</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() =>
                      window.open(`https://gateway.pinata.cloud/ipfs/${cid}`, '_blank', 'noopener,noreferrer')
                    }
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    View Certificate
                  </Button>
                  <Button
                    onClick={() => revokeCertificate(hash)}
                    variant="destructive"
                    disabled={loading}
                    className="px-4 py-2 text-sm"
                  >
                    {loading ? 'Processing...' : 'Revoke'}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}


      {issuerContractAddress && revokedCertificates.length > 0 && (
        <section className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Revoked Certificates</h2>
          <ul className="space-y-4">
            {revokedCertificates.map(({ hash, cid }, index) => (
              <li
                key={index}
                className="p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-red-50 border-red-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <FileText className="w-6 h-6 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-800 truncate">
                      <strong>Hash:</strong> {hash}
                    </p>
                    <p className="text-sm text-red-600 font-semibold">Status: Revoked</p>
                  </div>
                </div>
                <Button
                  onClick={() =>
                    window.open(`https://gateway.pinata.cloud/ipfs/${cid}`, '_blank', 'noopener,noreferrer')
                  }
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  View Certificate
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}


    </div>
  );
}
