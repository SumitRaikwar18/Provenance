import { NextRequest, NextResponse } from "next/server";
import { buildCheckpoint } from "@/lib/checkpoint";
import { storeCheckpointMemory } from "@/lib/memwal";
import { storeBlob } from "@/lib/walrus";
import { enforceRateLimit } from "@/lib/rate-limit";
import { requireSessionAuth } from "@/lib/server-auth";

export async function POST(req: NextRequest) {
  try {
    const limited = enforceRateLimit(req, { bucket: "checkpoint", limit: 30, windowMs: 60_000 });
    if (limited) return limited;

    const body = await req.json();
    const authError = await requireSessionAuth(body);
    if (authError) return authError;

    const { sessionId, walletAddress, content, checkpointIndex } = body;

    if (!sessionId || !walletAddress || content === undefined || checkpointIndex === undefined) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const contentText = String(content);
    if (contentText.length > 100_000) {
      return NextResponse.json({ success: false, error: "Content exceeds 100,000 characters" }, { status: 413 });
    }

    if (contentText.trim() === "") {
      return NextResponse.json({ success: false, error: "Content is empty" }, { status: 400 });
    }

    const checkpoint = buildCheckpoint(sessionId, walletAddress, Number(checkpointIndex), contentText);
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
