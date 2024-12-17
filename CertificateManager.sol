// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract CertificateManager {
    // Mapping to store certificate hashes and their issuers
    mapping(bytes32 => address) public certificates;

    // Event to log certificate issuance
    event CertificateIssued(bytes32 indexed certHash, address indexed issuer);

    // Function to issue a certificate
    function issueCertificate(bytes32 certHash) public {
        require(certificates[certHash] == address(0), "Certificate already exists");
        certificates[certHash] = msg.sender;
        emit CertificateIssued(certHash, msg.sender);
    }

    // Function to verify if a certificate exists
    function verifyCertificate(bytes32 certHash) public view returns (bool) {
        return certificates[certHash] != address(0);
    }
}
