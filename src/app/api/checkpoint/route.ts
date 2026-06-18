import { NextRequest, NextResponse } from "next/server";
import { buildCheckpoint } from "@/lib/checkpoint";
import { storeCheckpointMemory } from "@/lib/memwal";
import { storeBlob } from "@/lib/walrus";
import { enforceRateLimit } from "@/lib/rate-limit";
import { requireSessionAuth } from "@/lib/server-auth";
import type { EncryptedPayload } from "@/types";

function isEncryptedPayload(value: unknown): value is EncryptedPayload {
  const payload = value as Partial<EncryptedPayload> | undefined;
  return Boolean(
    payload &&
      payload.algorithm === "AES-GCM" &&
      payload.keyDerivation === "wallet-signature-session-key" &&
      typeof payload.ciphertext === "string" &&
      typeof payload.iv === "string" &&
      typeof payload.salt === "string" &&
      typeof payload.aad === "string",
  );
}

export async function POST(req: NextRequest) {
  try {
    const limited = enforceRateLimit(req, { bucket: "checkpoint", limit: 30, windowMs: 60_000 });
    if (limited) return limited;

    const body = await req.json();
    const authError = await requireSessionAuth(body);
    if (authError) return authError;

    const {
      sessionId,
      walletAddress,
      content,
      checkpointIndex,
      privacyMode = "public",
      encryptedPayload,
      contentHash,
      wordCount,
      charCount,
      title,
    } = body;

    if (!sessionId || !walletAddress || checkpointIndex === undefined) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    if (privacyMode !== "public" && privacyMode !== "encrypted") {
      return NextResponse.json({ success: false, error: "Invalid privacy mode" }, { status: 400 });
    }

    const contentText = content === undefined ? "" : String(content);
    if (contentText.length > 100_000 || String(encryptedPayload?.ciphertext ?? "").length > 180_000) {
      return NextResponse.json({ success: false, error: "Content exceeds 100,000 characters" }, { status: 413 });
    }

    if (privacyMode === "encrypted" && !isEncryptedPayload(encryptedPayload)) {
      return NextResponse.json({ success: false, error: "Missing encrypted checkpoint payload" }, { status: 400 });
    }

    if (privacyMode === "public" && contentText.trim() === "") {
      return NextResponse.json({ success: false, error: "Content is empty" }, { status: 400 });
    }

    const checkpoint = buildCheckpoint(sessionId, walletAddress, Number(checkpointIndex), contentText, {
      privacyMode,
      encryptedPayload: privacyMode === "encrypted" ? encryptedPayload : undefined,
      contentHash: typeof contentHash === "string" ? contentHash : undefined,
      wordCount: Number.isFinite(Number(wordCount)) ? Number(wordCount) : undefined,
      charCount: Number.isFinite(Number(charCount)) ? Number(charCount) : undefined,
      title: typeof title === "string" ? title.slice(0, 140) : undefined,
    });
    const blobId = await storeBlob(JSON.stringify(checkpoint), 5);

    await storeCheckpointMemory({
      sessionId,
      checkpointIndex: checkpoint.checkpointIndex,
      blobId,
      timestamp: checkpoint.timestamp,
      wordCount: checkpoint.wordCount,
    });

    return NextResponse.json({
      success: true,
      blobId,
      timestamp: checkpoint.timestamp,
      checkpointIndex: checkpoint.checkpointIndex,
      wordCount: checkpoint.wordCount,
    });
  } catch (error) {
    console.error("[/api/checkpoint]", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 },
    );
  }
}
