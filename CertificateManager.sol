// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract CertificateFactory {
    address public admin;

    struct Issuer {
        address issuerAddress;
        string organizationName;
        string organizationData;
        bool isVerified;
        address contractAddress;
    }

    mapping(address => Issuer) public issuers;
    address[] public allIssuers;

    event IssuerSignedUp(address indexed issuer, string organizationName, address contractAddress);
    event IssuerVerified(address indexed issuer, bool isVerified);

    constructor() {
        admin = msg.sender;
    }

    // Modifier to check if caller is admin
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    // Function for issuers to sign up
    function signUpIssuer(string memory _organizationName, string memory _organizationData) external {
        require(issuers[msg.sender].issuerAddress == address(0), "Issuer already signed up");

        // Deploy a new IssuerContract for the signer
        IssuerContract newContract = new IssuerContract(msg.sender);

        // Register the issuer
        issuers[msg.sender] = Issuer({
            issuerAddress: msg.sender,
            organizationName: _organizationName,
            organizationData: _organizationData,
            isVerified: false,
            contractAddress: address(newContract)
        });

        allIssuers.push(msg.sender);

        emit IssuerSignedUp(msg.sender, _organizationName, address(newContract));
    }

    // Admin function to verify an issuer
    function verifyIssuer(address _issuerAddress) external onlyAdmin {
        require(issuers[_issuerAddress].issuerAddress != address(0), "Issuer not found");
        issuers[_issuerAddress].isVerified = true;

        emit IssuerVerified(_issuerAddress, true);
    }

    // View function to get all issuers
    function getAllIssuers() external view returns (Issuer[] memory) {
        Issuer[] memory result = new Issuer[](allIssuers.length);
        for (uint i = 0; i < allIssuers.length; i++) {
            result[i] = issuers[allIssuers[i]];
        }
        return result;
    }

    function getIssuerContract(address _issuer) external view returns (address) {
        return issuers[_issuer].contractAddress;
    }
}

contract IssuerContract {
    address public issuer;

    struct Certificate {
        string cid; // Content Identifier for the certificate stored in Web3 storage
        bool isRevoked;
    }

    mapping(bytes32 => Certificate) public certificates;
    bytes32[] public issuedCertificateHashes;

    event CertificateIssued(bytes32 indexed certHash, string cid);
    event CertificateRevoked(bytes32 indexed certHash);

    constructor(address _issuer) {
        issuer = _issuer;
    }

    function issueCertificate(bytes32 certHash, string memory cid) external {
        require(msg.sender == issuer, "Not authorized to issue certificates");
        require(bytes(certificates[certHash].cid).length == 0, "Certificate already exists");

        certificates[certHash] = Certificate({
            cid: cid,
            isRevoked: false
        });
        issuedCertificateHashes.push(certHash);

        emit CertificateIssued(certHash, cid);
    }

    function revokeCertificate(bytes32 certHash) external {
        require(msg.sender == issuer, "Not authorized to revoke certificates");
        require(bytes(certificates[certHash].cid).length != 0, "Certificate does not exist");

        certificates[certHash].isRevoked = true;
        emit CertificateRevoked(certHash);
    }

    function verifyCertificate(bytes32 certHash) external view returns (string memory status, string memory cid) {
        if (bytes(certificates[certHash].cid).length == 0) {
            return ("Invalid", "");
        } else if (certificates[certHash].isRevoked) {
            return ("Revoked", "");
        } else {
            return ("Valid", certificates[certHash].cid);
        }
    }

    function getAllCertificates() external view returns (bytes32[] memory) {
        return issuedCertificateHashes;
    }

    function getCertificateCID(bytes32 certHash) external view returns (string memory) {
        require(bytes(certificates[certHash].cid).length > 0, "Certificate does not exist");
        return certificates[certHash].cid;
    }
}
