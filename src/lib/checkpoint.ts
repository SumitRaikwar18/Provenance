import { createHash } from "crypto";
import type { Checkpoint, EncryptedPayload } from "@/types";

export function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

export function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

export function buildCheckpoint(
  sessionId: string,
  walletAddress: string,
  checkpointIndex: number,
  content: string,
  options?: {
    contentHash?: string;
    wordCount?: number;
    charCount?: number;
    title?: string;
    privacyMode?: "public" | "encrypted";
    encryptedPayload?: EncryptedPayload;
  },
): Checkpoint {
  const privacyMode = options?.privacyMode ?? "public";
  const contentHash = options?.contentHash ?? sha256(content);
  const wordCount = options?.wordCount ?? countWords(content);
  const charCount = options?.charCount ?? content.length;

  return {
    sessionId,
    walletAddress,
    checkpointIndex,
    timestamp: new Date().toISOString(),
    wordCount,
    charCount,
    contentHash,
    content: privacyMode === "encrypted" ? undefined : content,
    title: options?.title,
    privacyMode,
    encryptedPayload: options?.encryptedPayload,
    appName: "Provenance",
    version: "1.0",
  };
}
