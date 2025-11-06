import { attestationCommand } from "@rsksmart/rsk-cli/dist/src/commands/attestation.js";
import { WalletData } from "../tools/types.js";

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
      const result = await attestationCommand({
        testnet: params.testnet,
        isExternal: true,
        walletName: params.walletName,
        action: 'create',
        recipient: params.recipient as `0x${string}`,
        schema: params.schema as `0x${string}`,
        data: params.data,
      });

      if (result?.success && result.data) {
        return {
          success: true,
          data: result.data,
          responseType: "AttestationIssuedSuccessfully"
        };
      }

      return {
        success: false,
        error: result?.error || "Failed to issue attestation",
        responseType: "ErrorIssuingAttestation"
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
      const result = await attestationCommand({
        testnet: params.testnet,
        isExternal: true,
        action: 'verify',
        uid: params.uid as `0x${string}`,
      });

      if (result?.success && result.data) {
        return {
          success: true,
          data: result.data,
          responseType: "AttestationVerifiedSuccessfully"
        };
      }

      return {
        success: false,
        error: result?.error || "Failed to verify attestation",
        responseType: "ErrorVerifyingAttestation"
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
      // First verify the attestation to get its schema
      const verifyResult = await attestationCommand({
        testnet: params.testnet,
        isExternal: true,
        action: 'verify',
        uid: params.uid as `0x${string}`,
      });

      if (!verifyResult?.success || !verifyResult.data?.attestation) {
        return {
          success: false,
          error: "Attestation not found or could not be verified",
          responseType: "ErrorRevokingAttestation"
        };
      }

      const schema = verifyResult.data.attestation.schema;

      const result = await attestationCommand({
        testnet: params.testnet,
        isExternal: true,
        walletName: params.walletName,
        action: 'revoke',
        uid: params.uid as `0x${string}`,
        schema: schema as `0x${string}`,
      });

      if (result?.success && result.data) {
        return {
          success: true,
          data: result.data,
          responseType: "AttestationRevokedSuccessfully"
        };
      }

      return {
        success: false,
        error: result?.error || "Failed to revoke attestation",
        responseType: "ErrorRevokingAttestation"
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
      const result = await attestationCommand({
        testnet: params.testnet,
        isExternal: true,
        action: 'list',
        address: params.recipient as `0x${string}` | undefined,
        attester: params.attester as `0x${string}` | undefined,
        schema: params.schema as `0x${string}` | undefined,
        limit: params.limit,
      });

      if (result?.success && result.data) {
        return {
          success: true,
          data: result.data,
          responseType: "AttestationsListedSuccessfully"
        };
      }

      return {
        success: false,
        error: result?.error || "Failed to list attestations",
        responseType: "ErrorListingAttestations"
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

  async processCreateSchema(params: CreateSchemaParams): Promise<AttestationServiceResult> {
    try {
      const result = await attestationCommand({
        testnet: params.testnet,
        isExternal: true,
        walletName: params.walletName,
        action: 'schema',
        schemaString: params.schema,
        resolverAddress: params.resolverAddress as `0x${string}` | undefined,
        revocable: params.revocable,
      });

      if (result?.success && result.data) {
        return {
          success: true,
          data: result.data,
          responseType: "SchemaCreatedSuccessfully"
        };
      }

      return {
        success: false,
        error: result?.error || "Failed to create schema",
        responseType: "ErrorCreatingSchema"
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