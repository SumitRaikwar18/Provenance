import { NextRequest, NextResponse } from "next/server";

interface RateLimitOptions {
  bucket: string;
  limit: number;
  windowMs: number;
}

const buckets = new Map<string, { count: number; resetAt: number }>();

export function enforceRateLimit(req: NextRequest, options: RateLimitOptions): NextResponse | null {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || req.headers.get("x-real-ip") || "local";
  const key = `${options.bucket}:${ip}`;
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return null;
  }

  if (current.count >= options.limit) {
    const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    return NextResponse.json(
      { success: false, error: `Rate limit exceeded. Try again in ${retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  current.count += 1;
  return null;
}

