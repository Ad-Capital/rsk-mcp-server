import { AttestationService as CLIAttestationService, RSK_ATTESTATION_CONFIG } from "@rsksmart/rsk-cli/dist/src/utils/attestation.js";
import { createAttestationSigner } from "@rsksmart/rsk-cli/dist/src/utils/walletSigner.js";
import { WalletData } from "../tools/types.js";
import { ethers } from "ethers";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

export interface AttestationServiceResult {
  success: boolean;
  data?: any;
  error?: string;
  responseType?: string;
}

export interface IssueAttestationParams {
  testnet: boolean;
  recipient: string;
  schema: string;
  data: string;
  expirationTime?: number;
  revocable?: boolean;
  refUID?: string;
  value?: number;
  walletName?: string;
  walletData?: WalletData;
  walletPassword?: string;
}

export interface VerifyAttestationParams {
  testnet: boolean;
  uid: string;
}

export interface RevokeAttestationParams {
  testnet: boolean;
  uid: string;
  walletName?: string;
  walletData?: WalletData;
  walletPassword?: string;
}

export interface ListAttestationsParams {
  testnet: boolean;
  recipient?: string;
  attester?: string;
  schema?: string;
  limit?: number;
}

export interface CreateSchemaParams {
  testnet: boolean;
  schema: string;
  resolverAddress?: string;
  revocable: boolean;
  walletName?: string;
  walletData?: WalletData;
  walletPassword?: string;
}

export class AttestationService {
  async processIssueAttestation(params: IssueAttestationParams): Promise<AttestationServiceResult> {
    try {
      const signer = await createAttestationSigner({
        testnet: params.testnet,
        walletName: params.walletName,
        isExternal: true,
        walletsData: params.walletData,
        password: params.walletPassword
      });

      if (!signer) {
        return {
          success: false,
          error: "Failed to create wallet signer. Ensure wallet data and password are correct.",
          responseType: "ErrorIssuingAttestation"
        };
      }

      const cliService = new CLIAttestationService(signer, params.testnet, true);

      // @ts-ignore - accessing private method
      await cliService.initializeEAS();
      // @ts-ignore - accessing private property
      const eas = cliService.eas;

      const attestationData = {
        recipient: params.recipient as `0x${string}`,
        expirationTime: BigInt(params.expirationTime || 0),
        revocable: params.revocable !== false,
        refUID: (params.refUID || "0x0000000000000000000000000000000000000000000000000000000000000000") as `0x${string}`,
        data: params.data,
        value: BigInt(params.value || 0)
      };

      const tx = await eas.attest({
        schema: params.schema as `0x${string}`,
        data: attestationData
      });

      const uid = await tx.wait();

      return {
        success: true,
        data: {
          uid,
          recipient: params.recipient,
          schema: params.schema,
          viewUrl: `https://rootstock.easscan.org/attestation/view/${uid}`
        },
        responseType: "AttestationIssuedSuccessfully"
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        error: `Failed to issue attestation: ${errorMessage}`,
        responseType: "ErrorIssuingAttestation"
      };
    }
  }

  async processVerifyAttestation(params: VerifyAttestationParams): Promise<AttestationServiceResult> {
    try {
      const provider = new ethers.JsonRpcProvider(
        params.testnet
          ? "https://public-node.testnet.rsk.co"
          : "https://public-node.rsk.co"
      );
      const tempWallet = ethers.Wallet.createRandom();
      const signer = tempWallet.connect(provider);

      const cliService = new CLIAttestationService(signer, params.testnet, true);

      // @ts-ignore
      await cliService.initializeEAS();
      // @ts-ignore
      const eas = cliService.eas;

      const attestation = await eas.getAttestation(params.uid as `0x${string}`);

      if (!attestation) {
        return {
          success: false,
          error: "Attestation not found",
          responseType: "ErrorVerifyingAttestation"
        };
      }

      const exists = attestation.uid !== "0x0000000000000000000000000000000000000000000000000000000000000000";
      const isRevoked = attestation.revocationTime > 0n;
      const currentTime = BigInt(Math.floor(Date.now() / 1000));
      const isExpired = attestation.expirationTime > 0n && attestation.expirationTime <= currentTime;
      const isValid = exists && !isRevoked && !isExpired;

      let status = "valid";
      if (!exists) status = "not_found";
      else if (isRevoked) status = "revoked";
      else if (isExpired) status = "expired";

      return {
        success: true,
        data: {
          uid: params.uid,
          valid: isValid,
          status,
          attestation: {
            attester: attestation.attester,
            recipient: attestation.recipient,
            schema: attestation.schema,
            time: Number(attestation.time),
            expirationTime: Number(attestation.expirationTime),
            revocationTime: Number(attestation.revocationTime),
            data: attestation.data
          }
        },
        responseType: "AttestationVerifiedSuccessfully"
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        error: `Failed to verify attestation: ${errorMessage}`,
        responseType: "ErrorVerifyingAttestation"
      };
    }
  }

  async processRevokeAttestation(params: RevokeAttestationParams): Promise<AttestationServiceResult> {
    try {
      const signer = await createAttestationSigner({
        testnet: params.testnet,
        walletName: params.walletName,
        isExternal: true,
        walletsData: params.walletData,
        password: params.walletPassword
      });

      if (!signer) {
        return {
          success: false,
          error: "Failed to create wallet signer",
          responseType: "ErrorRevokingAttestation"
        };
      }

      const cliService = new CLIAttestationService(signer, params.testnet, true);

      // @ts-ignore
      await cliService.initializeEAS();
      // @ts-ignore
      const eas = cliService.eas;

      const attestation = await eas.getAttestation(params.uid as `0x${string}`);

      if (!attestation || attestation.uid === "0x0000000000000000000000000000000000000000000000000000000000000000") {
        return {
          success: false,
          error: "Attestation not found",
          responseType: "ErrorRevokingAttestation"
        };
      }

      const tx = await eas.revoke({
        schema: attestation.schema as `0x${string}`,
        data: {
          uid: params.uid as `0x${string}`,
          value: 0n
        }
      });

      const txHash = await tx.wait();

      return {
        success: true,
        data: {
          uid: params.uid,
          transactionHash: txHash,
          viewUrl: `https://rootstock.easscan.org/attestation/view/${params.uid}`
        },
        responseType: "AttestationRevokedSuccessfully"
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        error: `Failed to revoke attestation: ${errorMessage}`,
        responseType: "ErrorRevokingAttestation"
      };
    }
  }

  async processListAttestations(params: ListAttestationsParams): Promise<AttestationServiceResult> {
    try {
      const config = params.testnet
        ? RSK_ATTESTATION_CONFIG.testnet
        : RSK_ATTESTATION_CONFIG.mainnet;

      const query = this.buildGraphQLQuery(params);

      const response = await fetch(config.graphqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
      }

      return {
        success: true,
        data: result.data,
        responseType: "AttestationsListedSuccessfully"
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        error: `Failed to list attestations: ${errorMessage}`,
        responseType: "ErrorListingAttestations"
      };
    }
  }

  private buildGraphQLQuery(params: ListAttestationsParams): string {
    const limit = params.limit || 10;
    const filters: string[] = [];

    if (params.recipient) {
      filters.push(`recipient: { equals: "${params.recipient.toLowerCase()}" }`);
    }
    if (params.attester) {
      filters.push(`attester: { equals: "${params.attester.toLowerCase()}" }`);
    }
    if (params.schema) {
      filters.push(`schemaId: { equals: "${params.schema.toLowerCase()}" }`);
    }

    const whereClause = filters.length > 0 ? `where: { ${filters.join(', ')} }` : '';

    return `
      query Attestations {
        attestations(
          ${whereClause}
          take: ${limit}
          orderBy: { time: desc }
        ) {
          id
          attester
          recipient
          refUID
          revocable
          revocationTime
          expirationTime
          data
          schemaId
          time
        }
      }
    `;
  }

  async processCreateSchema(params: CreateSchemaParams): Promise<AttestationServiceResult> {
    try {
      const signer = await createAttestationSigner({
        testnet: params.testnet,
        walletName: params.walletName,
        isExternal: true,
        walletsData: params.walletData,
        password: params.walletPassword
      });

      if (!signer) {
        return {
          success: false,
          error: "Failed to create wallet signer",
          responseType: "ErrorCreatingSchema"
        };
      }

      const config = params.testnet
        ? RSK_ATTESTATION_CONFIG.testnet
        : RSK_ATTESTATION_CONFIG.mainnet;

      const easSdk = require("@ethereum-attestation-service/eas-sdk");
      const SchemaRegistry = easSdk.SchemaRegistry;

      const schemaRegistry = new SchemaRegistry(config.schemaRegistryAddress);
      schemaRegistry.connect(signer);

      const tx = await schemaRegistry.register({
        schema: params.schema,
        resolverAddress: (params.resolverAddress || "0x0000000000000000000000000000000000000000") as `0x${string}`,
        revocable: params.revocable
      });

      const schemaUID = await tx.wait();

      return {
        success: true,
        data: {
          schemaUID,
          schema: params.schema,
          revocable: params.revocable,
          viewUrl: `https://rootstock.easscan.org/schema/view/${schemaUID}`
        },
        responseType: "SchemaCreatedSuccessfully"
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        error: `Failed to create schema: ${errorMessage}`,
        responseType: "ErrorCreatingSchema"
      };
    }
  }
}
