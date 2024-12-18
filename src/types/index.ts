export interface IssuerData {
  address: string;
  organizationName: string;
  organizationData: string;
  contractAddress: string;
  isVerified: boolean;
}

export interface Certificate {
  hash: string;
  issuerAddress: string;
  isRevoked: boolean;
  timestamp: number;
}