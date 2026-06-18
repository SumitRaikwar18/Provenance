import { NextResponse } from "next/server";
import { verifyPersonalMessageSignature } from "@mysten/sui/verify";
import { buildSessionAuthMessage, type SessionAuth } from "@/lib/auth-message";

const AUTH_TTL_MS = 24 * 60 * 60 * 1000;

export async function requireSessionAuth(body: {
  sessionId?: unknown;
  walletAddress?: unknown;
  auth?: unknown;
}): Promise<NextResponse | null> {
  if (typeof body.sessionId !== "string" || typeof body.walletAddress !== "string") {
    return NextResponse.json({ success: false, error: "Missing sessionId or walletAddress" }, { status: 400 });
  }

  const auth = body.auth as Partial<SessionAuth> | undefined;
  if (!auth || typeof auth.message !== "string" || typeof auth.signature !== "string" || typeof auth.signedAt !== "number") {
    return NextResponse.json({ success: false, error: "Missing signed wallet session authorization" }, { status: 401 });
  }

  if (!Number.isFinite(auth.signedAt) || Math.abs(Date.now() - auth.signedAt) > AUTH_TTL_MS) {
    return NextResponse.json({ success: false, error: "Wallet session authorization expired" }, { status: 401 });
  }

  const expectedMessage = buildSessionAuthMessage(body.sessionId, body.walletAddress, auth.signedAt);
  if (auth.message !== expectedMessage) {
    return NextResponse.json({ success: false, error: "Wallet session authorization does not match request" }, { status: 401 });
  }

  try {
    await verifyPersonalMessageSignature(new TextEncoder().encode(auth.message), auth.signature, {
      address: body.walletAddress,
    });
    return null;
  } catch {
    return NextResponse.json({ success: false, error: "Invalid wallet session signature" }, { status: 401 });
  }
}

