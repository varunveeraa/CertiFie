import { useEffect, useState } from 'react';
import { UserCheck, Shield, FileText } from 'lucide-react';
import { contract, web3, issuerContractABI } from '../components/web3';
import { Button } from '../components/Button';

// Define types
type Issuer = {
  issuerAddress: string;
  organizationName: string;
  organizationData: string;
  isVerified: boolean;
  contractAddress: string;
};

type Certificate = {
  hash: string;
  cid: string;
  revoked: boolean;
};

export function Admin() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [adminAddress, setAdminAddress] = useState<string | null>(null);
  const [pendingIssuers, setPendingIssuers] = useState<Issuer[]>([]);
  const [verifiedIssuers, setVerifiedIssuers] = useState<Issuer[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIssuerCertificates, setSelectedIssuerCertificates] = useState<{
    issuerName: string;
    certificates: Certificate[];
  } | null>(null);

  // Connect Wallet
  const connectWallet = async () => {
    try {
      const accounts: string[] = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      setWallet(accounts[0]);
      fetchAdminAddress();
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  // Fetch Admin Address
  const fetchAdminAddress = async () => {
    try {
      const admin: string = await contract.methods.admin().call();
      setAdminAddress(admin.toLowerCase());
    } catch (error) {
      console.error('Error fetching admin address:', error);
    }
  };

  // Fetch all issuers (only if admin wallet)
  const fetchIssuers = async () => {
    if (!wallet || wallet !== adminAddress) return;
    try {
      const result: Issuer[] = await contract.methods.getAllIssuers().call();
      const pending = result.filter((issuer) => !issuer.isVerified);
      const verified = result.filter((issuer) => issuer.isVerified);

      setPendingIssuers(pending);
      setVerifiedIssuers(verified);
    } catch (error) {
      console.error('Error fetching issuers:', error);
    }
  };

  // Fetch certificates for a specific issuer
  const fetchCertificatesForIssuer = async (issuer: Issuer) => {
    try {
      setLoading(true);
      const issuerContract = new web3.eth.Contract(issuerContractABI, issuer.contractAddress);
      const certHashes = await issuerContract.methods.getAllCertificates().call();
  
      // Ensure certHashes is an array before using .map
      if (!Array.isArray(certHashes)) {
        throw new Error('Unexpected data format: certHashes is not an array.');
      }
  
      const certificates = await Promise.all(
        certHashes.map(async (hash: string) => {
          const certificateInfo = (await issuerContract.methods.certificates(hash).call()) as {
            cid: string;
            isRevoked: boolean;
          };
          return { hash, cid: certificateInfo.cid, revoked: certificateInfo.isRevoked };
        })
      );
  
      setSelectedIssuerCertificates({
        issuerName: issuer.organizationName,
        certificates,
      });
    } catch (error) {
      console.error('Error fetching certificates:', error);
      alert('Failed to fetch certificates.');
    } finally {
      setLoading(false);
    }
  };
  
  // Verify an issuer
  const verifyIssuer = async (issuerAddress: string) => {
    if (!wallet || wallet !== adminAddress) {
      alert('Access denied. Only the admin can verify issuers.');
      return;
    }
    try {
      setLoading(true);
      await contract.methods.verifyIssuer(issuerAddress).send({ from: wallet });
      alert('Issuer verified successfully!');
      fetchIssuers(); // Refresh the list
    } catch (error) {
      console.error('Error verifying issuer:', error);
      alert('Failed to verify issuer.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch admin and issuers when wallet is connected
  useEffect(() => {
    if (wallet) {
      fetchAdminAddress();
    }
  }, [wallet]);

  useEffect(() => {
    if (wallet && adminAddress && wallet === adminAddress) {
      fetchIssuers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet, adminAddress]);

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage and verify issuers</p>
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

      {/* Access Denied */}
      {wallet && adminAddress && wallet !== adminAddress && (
        <p className="text-center text-red-600">
          Access Denied: You are not the admin.
        </p>
      )}

      {/* Pending Issuers */}
      {wallet && wallet === adminAddress && (
        <>
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-blue-600" />
              Pending Issuers
            </h2>
            {pendingIssuers.length > 0 ? (
              <ul className="mt-4 space-y-4">
                {pendingIssuers.map((issuer, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <div>
                      <p>
                        <strong>Organization:</strong> {issuer.organizationName}
                      </p>
                      <p>
                        <strong>Address:</strong> {issuer.issuerAddress}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => verifyIssuer(issuer.issuerAddress)}
                      disabled={loading}
                    >
                      {loading ? 'Verifying...' : 'Verify'}
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 mt-4">No pending issuers to verify.</p>
            )}
          </section>

          {/* Verified Issuers */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              Verified Issuers
            </h2>
            {verifiedIssuers.length > 0 ? (
              <ul className="mt-4 space-y-4">
                {verifiedIssuers.map((issuer, index) => (
                  <li key={index} className="border p-4 rounded-lg">
                    <p>
                      <strong>Organization:</strong> {issuer.organizationName}
                    </p>
                    <p>
                      <strong>Address:</strong> {issuer.issuerAddress}
                    </p>
                    <p>
                      <strong>Contract:</strong>{' '}
                      <a
                        href={`https://sepolia.etherscan.io/address/${issuer.contractAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        View on Etherscan
                      </a>
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => fetchCertificatesForIssuer(issuer)}
                      disabled={loading}
                      className="mt-2"
                    >
                      {loading ? 'Loading...' : 'View Certificates'}
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 mt-4">No verified issuers yet.</p>
            )}
          </section>
        </>
      )}

      {/* Certificates Modal */}
      {selectedIssuerCertificates && (
        <section className="bg-gray-50 rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold">
            Certificates Issued by {selectedIssuerCertificates.issuerName}
          </h2>
          <ul className="mt-4 space-y-4">
            {selectedIssuerCertificates.certificates.map(({ hash, cid, revoked }, index) => (
              <li
                key={index}
                className={`p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                  revoked ? 'bg-red-50 border-red-300' : 'bg-gray-100 border-gray-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <FileText className={`w-6 h-6 ${revoked ? 'text-red-600' : 'text-gray-600'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-800 truncate">
                      <strong>Hash:</strong> {hash}
                    </p>
                    <p
                      className={`text-sm ${
                        revoked ? 'text-red-600' : 'text-green-600'
                      } font-semibold`}
                    >
                      Status: {revoked ? 'Revoked' : 'Active'}
                    </p>
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
          <Button
            variant="outline"
            onClick={() => setSelectedIssuerCertificates(null)}
            className="mt-4"
          >
            Close
          </Button>
        </section>
      )}
    </div>
  );
}
