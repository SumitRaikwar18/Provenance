export interface SessionAuth {
  message: string;
  signature: string;
  signedAt: number;
}

export function buildSessionAuthMessage(sessionId: string, walletAddress: string, signedAt: number): string {
  return [
    "Provenance session authorization",
    `sessionId=${sessionId}`,
    `walletAddress=${walletAddress}`,
    `signedAt=${signedAt}`,
    "purpose=Seal writing checkpoints, recall MemWal memory, and publish Walrus proofs.",
  ].join("\n");
}

