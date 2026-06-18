export interface Checkpoint {
  sessionId: string;
  walletAddress: string;
  checkpointIndex: number;
  timestamp: string;
  wordCount: number;
  charCount: number;
  contentHash: string;
  content?: string;
  title?: string;
  privacyMode?: "public" | "encrypted";
  encryptedPayload?: EncryptedPayload;
  appName: string;
  version: string;
}

export interface EncryptedPayload {
  algorithm: "AES-GCM";
  keyDerivation: "wallet-signature-session-key";
  ciphertext: string;
  iv: string;
  salt: string;
  aad: string;
  seal?: {
    status: "configured" | "fallback";
    packageId?: string;
    moduleName?: string;
    threshold?: number;
    keyServerCount?: number;
    policy?: "creator-owned-checkpoint-key";
  };
}

export interface CheckpointMemory {
  sessionId: string;
  checkpointIndex: number;
  blobId: string;
  timestamp: string;
  wordCount: number;
}

export interface Session {
  sessionId: string;
  walletAddress: string;
  title: string;
  startTime: string;
  lastSaved: string;
  checkpointCount: number;
  wordCount: number;
  lastBlobId: string | null;
  proofUrl: string | null;
  proofBlobId: string | null;
  shareUrl?: string | null;
  shareBlobId?: string | null;
}

export interface ProofEntry {
  checkpointIndex: number;
  timestamp: string;
  wordCount: number;
  wordDelta: number;
  blobId: string;
  blobUrl: string;
  excerpt: string;
  contentHash: string;
  privacyMode?: "public" | "encrypted";
}

export interface CheckpointResponse {
  success: boolean;
  blobId?: string;
  timestamp?: string;
  checkpointIndex?: number;
  wordCount?: number;
  error?: string;
}

export interface ProofResponse {
  success: boolean;
  proofUrl?: string;
  proofBlobId?: string;
  checkpointCount?: number;
  sessionId?: string;
  error?: string;
}

export interface RecallResponse {
  success: boolean;
  sessionId?: string;
  checkpoints?: CheckpointMemory[];
  error?: string;
}

export interface SessionShareResponse {
  success: boolean;
  shareUrl?: string;
  shareBlobId?: string;
  error?: string;
}
