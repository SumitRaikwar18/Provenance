import type { SessionAuth } from "@/lib/auth-message";
import type { EncryptedPayload } from "@/types";

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function deriveKey(auth: SessionAuth, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(auth.signature),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: 150_000,
      hash: "SHA-256",
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function encryptCheckpointContent(params: {
  content: string;
  sessionId: string;
  checkpointIndex: number;
  walletAddress: string;
  auth: SessionAuth;
}): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(params.auth, salt);
  const aad = `provenance:${params.walletAddress}:${params.sessionId}:${params.checkpointIndex}`;
  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv as BufferSource,
      additionalData: new TextEncoder().encode(aad) as BufferSource,
    },
    key,
    new TextEncoder().encode(params.content),
  );

  return {
    algorithm: "AES-GCM",
    keyDerivation: "wallet-signature-session-key",
    ciphertext: bytesToBase64(new Uint8Array(encrypted)),
    iv: bytesToBase64(iv),
    salt: bytesToBase64(salt),
    aad,
  };
}

export async function decryptCheckpointContent(payload: EncryptedPayload, auth: SessionAuth): Promise<string> {
  const key = await deriveKey(auth, base64ToBytes(payload.salt));
  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: base64ToBytes(payload.iv) as BufferSource,
      additionalData: new TextEncoder().encode(payload.aad) as BufferSource,
    },
    key,
    base64ToBytes(payload.ciphertext) as BufferSource,
  );

  return new TextDecoder().decode(decrypted);
}
