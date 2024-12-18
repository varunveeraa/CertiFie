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

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    function signUpIssuer(string memory _organizationName, string memory _organizationData) external {
        require(issuers[msg.sender].issuerAddress == address(0), "Issuer already signed up");

        IssuerContract newContract = new IssuerContract(msg.sender);

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

    function verifyIssuer(address _issuerAddress) external onlyAdmin {
        require(issuers[_issuerAddress].issuerAddress != address(0), "Issuer not found");
        issuers[_issuerAddress].isVerified = true;

        emit IssuerVerified(_issuerAddress, true);
    }

    function getAllIssuers() external view returns (Issuer[] memory) {
        Issuer[] memory result = new Issuer[](allIssuers.length);
        for (uint i = 0; i < allIssuers.length; i++) {
            result[i] = issuers[allIssuers[i]];
        }
        return result;
    }

    // New getter to fetch the IssuerContract address
    function getIssuerContract(address _issuer) external view returns (address) {
        return issuers[_issuer].contractAddress;
    }
}

contract IssuerContract {
    address public issuer;

    mapping(bytes32 => bool) public certificates;
    mapping(bytes32 => bool) public revokedCertificates;

    event CertificateIssued(bytes32 indexed certHash);
    event CertificateRevoked(bytes32 indexed certHash);

    constructor(address _issuer) {
        issuer = _issuer;
    }

    function issueCertificate(bytes32 certHash) external {
        require(msg.sender == issuer, "Not authorized to issue certificates");
        require(!certificates[certHash], "Certificate already exists");

        certificates[certHash] = true;
        emit CertificateIssued(certHash);
    }

    function revokeCertificate(bytes32 certHash) external {
        require(msg.sender == issuer, "Not authorized to revoke certificates");
        require(certificates[certHash], "Certificate does not exist");

        revokedCertificates[certHash] = true;
        emit CertificateRevoked(certHash);
    }

    function verifyCertificate(bytes32 certHash) external view returns (string memory) {
        if (!certificates[certHash]) {
            return "Invalid";
        } else if (revokedCertificates[certHash]) {
            return "Revoked";
        } else {
            return "Valid";
        }
    }
}
