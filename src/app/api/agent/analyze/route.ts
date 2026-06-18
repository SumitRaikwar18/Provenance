import { NextRequest, NextResponse } from "next/server";
import { fetchBlob } from "@/lib/walrus";
import { recallSession, sessionNamespace } from "@/lib/memwal";
import { MemWal } from "@mysten-incubation/memwal";
import type { Checkpoint } from "@/types";
import { enforceRateLimit } from "@/lib/rate-limit";
import { requireSessionAuth } from "@/lib/server-auth";

export interface AgentInsight {
  themes: string[];
  styleNotes: string;
  paceSummary: string;
  keyIdeas: string[];
  agentSummary: string;
  crossSessionPatterns: string[];
  nextActions: string[];
  reusableBrief: string;
  analyzedAt: string;
  checkpointCount: number;
}

/** Calls OpenAI to analyze writing excerpts. Falls back to a stub if no key is set. */
async function analyzeWithLLM(
  excerpts: string[],
  sessionId: string,
  sessionHistory: Array<{ title?: string; wordCount?: number; checkpointCount?: number; lastSaved?: string }> = [],
): Promise<AgentInsight> {
  const analyzedAt = new Date().toISOString();
  const historySummary = sessionHistory
    .slice(0, 8)
    .map((s, i) => `${i + 1}. ${s.title || "Untitled"} (${s.wordCount || 0} words, ${s.checkpointCount || 0} checkpoints, saved ${s.lastSaved || "unknown"})`)
    .join("\n");

  if (!process.env.OPENAI_API_KEY) {
    // Graceful stub: UI still renders without real LLM analysis.
    return {
      themes: ["(Set OPENAI_API_KEY to enable AI analysis)"],
      styleNotes: "AI analysis unavailable - add OPENAI_API_KEY to .env.local",
      paceSummary: `${excerpts.length} checkpoints recorded this session.`,
      keyIdeas: [],
      agentSummary: "Writing agent is active and tracking your session. Add an OpenAI key for full analysis.",
      crossSessionPatterns: sessionHistory.length > 1 ? ["Multiple sessions detected in local workspace memory."] : [],
      nextActions: ["Seal another checkpoint", "Generate a proof page", "Review recurring themes after two or more sessions"],
      reusableBrief: `Session ${sessionId} has ${excerpts.length} remembered checkpoint entries. Use MemWal recall to continue the writing thread later.`,
      analyzedAt,
      checkpointCount: excerpts.length,
    };
  }

  const combinedExcerpts = excerpts
    .map((e, i) => `[Checkpoint ${i + 1}]: ${e.slice(0, 300)}`)
    .join("\n\n");

  const systemPrompt = `You are a writing intelligence agent embedded in Provenance, a tool that
cryptographically seals writing checkpoints on the Walrus decentralized storage network.
Analyze the provided writing excerpts from a user's session and return a structured JSON response.
Be concise, insightful, and encouraging. Focus on the writer's process, not just content.`;

  const userPrompt = `Analyze these ${excerpts.length} writing checkpoints from session "${sessionId}".

Other local sessions for cross-session memory comparison:
${historySummary || "No other sessions supplied."}

${combinedExcerpts}

Return a JSON object with these exact fields:
- themes: string[] - 2-4 recurring themes or topics detected across checkpoints
- styleNotes: string - one sentence about the writer's style (e.g., tone, sentence structure)
- paceSummary: string - one sentence about writing pace and momentum across checkpoints
- keyIdeas: string[] - 2-3 key ideas or arguments that appear across the drafts
- agentSummary: string - a 2-sentence overall assessment of this writing session
- crossSessionPatterns: string[] - 2-4 patterns comparing this session with prior sessions
- nextActions: string[] - 3 concrete next actions the writer or another agent should take
- reusableBrief: string - a concise brief another agent could use to continue this workflow later

Return ONLY valid JSON, no markdown fences.`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: 600,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API error: ${res.status} ${await res.text()}`);
  }

  const json = await res.json();
  const raw = json.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as Partial<AgentInsight>;

  return {
    themes: parsed.themes ?? [],
    styleNotes: parsed.styleNotes ?? "",
    paceSummary: parsed.paceSummary ?? "",
    keyIdeas: parsed.keyIdeas ?? [],
    agentSummary: parsed.agentSummary ?? "",
    crossSessionPatterns: Array.isArray((parsed as any).crossSessionPatterns) ? (parsed as any).crossSessionPatterns : [],
    nextActions: Array.isArray((parsed as any).nextActions) ? (parsed as any).nextActions : [],
    reusableBrief: typeof (parsed as any).reusableBrief === "string" ? (parsed as any).reusableBrief : "",
    analyzedAt,
    checkpointCount: excerpts.length,
  };
}

export async function POST(req: NextRequest) {
  try {
    const limited = enforceRateLimit(req, { bucket: "agent", limit: 10, windowMs: 60_000 });
    if (limited) return limited;

    const body = await req.json();
    const authError = await requireSessionAuth(body);
    if (authError) return authError;

    const { sessionId, walletAddress } = body;
    const sessionHistory = Array.isArray(body.sessions) ? body.sessions.slice(0, 12) : [];

    if (!sessionId || !walletAddress) {
      return NextResponse.json({ success: false, error: "Missing sessionId or walletAddress" }, { status: 400 });
    }

    // Retrieve checkpoint metadata from MemWal
    const checkpoints = await recallSession(sessionId);
    if (checkpoints.length === 0) {
      return NextResponse.json(
        { success: false, error: "No checkpoints found - write and seal at least one checkpoint first." },
        { status: 404 },
      );
    }

    // Fetch actual writing content from Walrus blobs
    const excerpts: string[] = [];
    let encryptedCount = 0;
    for (const cp of checkpoints.slice(0, 10)) {
      // Cap at 10 to stay within LLM token limits
      try {
        const raw = await fetchBlob(cp.blobId);
        const parsed = JSON.parse(raw) as Checkpoint;
        if (parsed.privacyMode === "encrypted") {
          encryptedCount += 1;
          excerpts.push(
            `[Encrypted checkpoint ${parsed.checkpointIndex + 1}]: ${parsed.wordCount} words, ${parsed.charCount} chars, title="${parsed.title ?? "Untitled"}", sha256=${parsed.contentHash}`,
          );
        } else if (parsed.content?.trim()) {
          excerpts.push(parsed.content);
        }
      } catch {
        // Skip blobs that cannot be fetched; this is non-fatal.
      }
    }

    if (excerpts.length === 0) {
      return NextResponse.json(
        { success: false, error: "Could not fetch writing content from Walrus blobs." },
        { status: 500 },
      );
    }

    // Run LLM analysis
    const insight = await analyzeWithLLM(excerpts, sessionId, sessionHistory);
    if (encryptedCount > 0) {
      insight.agentSummary = `${insight.agentSummary} Privacy mode is active: ${encryptedCount} checkpoint${encryptedCount === 1 ? "" : "s"} were analyzed from encrypted Walrus metadata without exposing plaintext draft content.`;
    }

    // Store the analysis in MemWal as an agent memory for this session
    try {
      if (process.env.MEMWAL_KEY && process.env.MEMWAL_ACCOUNT_ID) {
        const memwal = MemWal.create({
          key: process.env.MEMWAL_KEY,
          accountId: process.env.MEMWAL_ACCOUNT_ID,
          serverUrl: process.env.MEMWAL_SERVER_URL ?? "https://relayer.memory.walrus.xyz",
        });
        const ns = sessionNamespace(sessionId);
        const memoryText = `Agent brief for session ${sessionId}: themes=${insight.themes.join(",")}. nextActions=${insight.nextActions.join(" | ")}. reusableBrief=${insight.reusableBrief || insight.agentSummary}`;
        const job = await memwal.remember(memoryText, ns);
        await memwal.waitForRememberJob(job.job_id);
      }
    } catch {
      // Storing in MemWal is best-effort; do not fail the whole request.
    }

    return NextResponse.json({ success: true, insight });
  } catch (error) {
    console.error("[/api/agent/analyze]", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Agent analysis failed" },
      { status: 500 },
    );
  }
}
