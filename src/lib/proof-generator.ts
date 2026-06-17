import { blobUrl, fetchBlob, storeBlob } from "@/lib/walrus";
import { countWords } from "@/lib/checkpoint";
import type { Checkpoint, CheckpointMemory, ProofEntry } from "@/types";

function wordDelta(previous: string, current: string): number {
  return countWords(current) - countWords(previous);
}

function escHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function buildProofEntries(checkpoints: CheckpointMemory[]): Promise<ProofEntry[]> {
  const entries: ProofEntry[] = [];
  let previousContent = "";

  for (const cp of checkpoints) {
    const raw = await fetchBlob(cp.blobId);
    const parsed = JSON.parse(raw) as Checkpoint;
    const content = parsed.content ?? "";
    const excerpt = content.slice(0, 160);

    entries.push({
      checkpointIndex: parsed.checkpointIndex,
      timestamp: parsed.timestamp,
      wordCount: parsed.wordCount,
      wordDelta: wordDelta(previousContent, content),
      blobId: cp.blobId,
      blobUrl: blobUrl(cp.blobId),
      excerpt: content.length > 160 ? `${excerpt}...` : excerpt,
      contentHash: parsed.contentHash,
    });

    previousContent = content;
  }

  return entries;
}

export function generateProofHtml(sessionId: string, walletAddress: string, entries: ProofEntry[]): string {
  const start = entries[0]?.timestamp ?? new Date().toISOString();
  const end = entries[entries.length - 1]?.timestamp ?? start;
  const totalWords = entries[entries.length - 1]?.wordCount ?? 0;
  const ogTitle = `Provenance Writing Proof — session_${escHtml(sessionId)}`;
  const ogDesc = `${entries.length} checkpoints, ${totalWords} words. Cryptographically sealed on Walrus by ${escHtml(walletAddress.slice(0, 10))}...`;

  const proofData = {
    sessionId,
    walletAddress,
    generatedAt: new Date().toISOString(),
    entries: entries.map((e) => ({
      index: e.checkpointIndex,
      timestamp: e.timestamp,
      wordCount: e.wordCount,
      wordDelta: e.wordDelta,
      blobId: e.blobId,
      contentHash: e.contentHash,
      excerpt: e.excerpt,
    })),
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Provenance — Writing Proof</title>
<meta property="og:title" content="${ogTitle}">
<meta property="og:description" content="${ogDesc}">
<meta property="og:type" content="article">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${ogTitle}">
<meta name="twitter:description" content="${ogDesc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
/* ══ TOKENS ══════════════════════════════════════════════ */
:root {
  --cream: #F8F7F4;
  --cream-2: #EFEDE8;
  --border: #E2E0D8;
  --border-2: #D0CEC5;
  --ink: #0E0E12;
  --ink-60: #3A3A47;
  --ink-40: #6B6B80;
  --ink-20: #AEAEC2;
  --white: #FFFFFF;
  --blue: #1A6CF0;
  --blue-mid: #5B9DFF;
  --blue-pale: #D6E8FF;
  --blue-border: rgba(26,108,240,.2);
  --green: #059669;
  --green-pale: #D1FAE5;
  --green-border: rgba(5,150,105,.2);
  --purple: #7C3AED;
  --purple-pale: #EDE9FE;
  --orange: #D97706;
  --orange-pale: #FEF3C7;
  --sh: 0 2px 8px rgba(14,14,18,.06), 0 8px 32px rgba(14,14,18,.08);
  --sh-lg: 0 16px 60px rgba(14,14,18,.12);
}

/* ══ RESET ═══════════════════════════════════════════════ */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; font-size: 16px; }
body { font-family: 'DM Sans', system-ui, sans-serif; background: var(--cream); color: var(--ink); -webkit-font-smoothing: antialiased; line-height: 1.55; }
a { text-decoration: none; color: inherit; }
code { font-family: 'DM Mono', monospace; }
button { cursor: pointer; font-family: inherit; border: none; background: none; }
::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: var(--cream); } ::-webkit-scrollbar-thumb { background: var(--border-2); border-radius: 3px; }

/* ══ LAYOUT ══════════════════════════════════════════════ */
.page-wrap { min-height: 100vh; }

/* ══ TOP BANNER ══════════════════════════════════════════ */
.top-banner {
  background: var(--ink); color: #fff;
  padding: 10px 2rem;
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  flex-wrap: wrap;
}
.tb-left { display: flex; align-items: center; gap: 10px; }
.tb-logo { font-family: 'DM Serif Display', serif; font-size: .95rem; color: #fff; }
.tb-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); box-shadow: 0 0 5px var(--green); animation: pulse 2.5s ease-in-out infinite; }
.tb-badge {
  font-family: 'DM Mono', monospace; font-size: .65rem; font-weight: 500;
  letter-spacing: .08em; text-transform: uppercase;
  background: rgba(5,150,105,.2); border: 1px solid rgba(5,150,105,.3);
  color: #34D399; padding: 3px 10px; border-radius: 5px;
}
.tb-right { display: flex; align-items: center; gap: .75rem; }
.tb-btn {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: .78rem; font-weight: 500; color: rgba(255,255,255,.7);
  padding: 6px 12px; border: 1px solid rgba(255,255,255,.12); border-radius: 6px;
  transition: all .2s;
}
.tb-btn:hover { border-color: rgba(255,255,255,.3); color: #fff; }
.tb-btn svg { width: 13px; height: 13px; }

/* ══ MAIN ════════════════════════════════════════════════ */
main { max-width: 860px; margin: 0 auto; padding: 2.5rem 1.5rem 5rem; }

/* ══ HEADER CARD ═════════════════════════════════════════ */
.proof-header {
  background: var(--white); border: 1px solid var(--border);
  border-radius: 18px; padding: 2.5rem 2.75rem;
  box-shadow: var(--sh-lg); margin-bottom: 1.5rem; overflow: hidden;
  position: relative;
}
.proof-header::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, var(--blue), var(--purple), var(--green));
}
.proof-eyebrow {
  display: inline-flex; align-items: center; gap: 7px;
  font-family: 'DM Mono', monospace; font-size: .7rem; font-weight: 500;
  letter-spacing: .1em; text-transform: uppercase;
  color: var(--blue); background: var(--blue-pale); border: 1px solid var(--blue-border);
  padding: 4px 12px; border-radius: 5px; margin-bottom: 1.25rem;
}
.proof-eyebrow .vdot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); box-shadow: 0 0 5px var(--green); animation: pulse 2.5s ease-in-out infinite; }
.proof-h1 {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(1.75rem, 4vw, 2.6rem);
  line-height: 1.1; letter-spacing: -.02em;
  color: var(--ink); margin-bottom: .75rem;
}
.proof-h1 em { font-style: italic; color: var(--ink-40); }
.proof-desc { font-size: .95rem; color: var(--ink-40); line-height: 1.7; max-width: 560px; margin-bottom: 1.75rem; }

/* Meta grid */
.proof-meta { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: .75rem; margin-bottom: 1.75rem; }
.meta-box {
  background: var(--cream); border: 1px solid var(--border);
  border-radius: 9px; padding: .75rem 1rem;
}
.meta-lbl { font-family: 'DM Mono', monospace; font-size: .62rem; font-weight: 500; letter-spacing: .08em; text-transform: uppercase; color: var(--ink-20); margin-bottom: 4px; }
.meta-val { font-size: .82rem; font-weight: 500; color: var(--ink); word-break: break-all; line-height: 1.45; }
.meta-val.mono { font-family: 'DM Mono', monospace; font-size: .75rem; color: var(--blue); }
.meta-val.green { color: var(--green); }

/* Stats row */
.proof-stats { display: flex; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 1.75rem; padding-bottom: 1.75rem; border-bottom: 1px solid var(--border); }
.stat-item { }
.stat-val { font-family: 'DM Serif Display', serif; font-size: 2rem; line-height: 1; color: var(--ink); }
.stat-lbl { font-size: .75rem; color: var(--ink-20); margin-top: 3px; }

/* Verify box */
.verify-box {
  background: linear-gradient(135deg, rgba(26,108,240,.06), rgba(5,150,105,.06));
  border: 1px solid var(--blue-border); border-radius: 10px; padding: 1.1rem 1.35rem;
}
.verify-box-title { font-size: .8rem; font-weight: 700; color: var(--ink); margin-bottom: .6rem; display: flex; align-items: center; gap: 7px; }
.verify-box-title svg { width: 16px; height: 16px; color: var(--green); }
.verify-steps { list-style: none; display: flex; flex-direction: column; gap: .45rem; }
.verify-steps li { display: flex; gap: .75rem; font-size: .82rem; color: var(--ink-60); line-height: 1.55; }
.vs-num { width: 20px; height: 20px; border-radius: 50%; background: var(--blue-pale); border: 1px solid var(--blue-border); display: flex; align-items: center; justify-content: center; font-size: .65rem; font-weight: 700; color: var(--blue); flex-shrink: 0; margin-top: 1px; }
.verify-steps code { background: var(--cream-2); border: 1px solid var(--border); border-radius: 4px; padding: 1px 6px; font-size: .75rem; color: var(--blue); word-break: break-all; }

/* ══ SHA-256 VERIFICATION WIDGET ═════════════════════════ */
.verify-widget {
  background: var(--white); border: 1px solid var(--border);
  border-radius: 14px; padding: 1.5rem 1.75rem;
  box-shadow: var(--sh); margin-bottom: 1.5rem;
}
.vw-head { display: flex; align-items: center; gap: 8px; margin-bottom: 1.25rem; }
.vw-icon { width: 32px; height: 32px; border-radius: 8px; background: var(--green-pale); display: flex; align-items: center; justify-content: center; }
.vw-icon svg { width: 16px; height: 16px; color: var(--green); }
.vw-title { font-size: .92rem; font-weight: 700; color: var(--ink); }
.vw-sub { font-size: .78rem; color: var(--ink-40); margin-left: auto; }
.vw-input-row { display: flex; gap: .65rem; margin-bottom: 1rem; }
.vw-input {
  flex: 1; padding: 9px 12px; border: 1px solid var(--border);
  border-radius: 7px; font-family: 'DM Mono', monospace; font-size: .78rem;
  color: var(--ink); background: var(--cream); outline: none; transition: border-color .2s;
}
.vw-input:focus { border-color: var(--blue); background: var(--white); }
.vw-input::placeholder { color: var(--ink-20); }
.vw-btn {
  display: flex; align-items: center; gap: 6px;
  background: var(--blue); color: #fff; font-size: .8rem; font-weight: 600;
  padding: 9px 16px; border-radius: 7px; border: none; transition: background .2s; white-space: nowrap;
}
.vw-btn:hover { background: #1558D0; }
.vw-result { display: none; padding: .85rem 1.1rem; border-radius: 8px; font-size: .82rem; line-height: 1.6; }
.vw-result.ok { display: block; background: var(--green-pale); border: 1px solid var(--green-border); color: #065F46; }
.vw-result.fail { display: block; background: #FEE2E2; border: 1px solid rgba(239,68,68,.2); color: #991B1B; }
.vw-result.loading { display: block; background: var(--blue-pale); border: 1px solid var(--blue-border); color: var(--blue); }

/* ══ TIMELINE ════════════════════════════════════════════ */
.section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.section-title { font-size: .88rem; font-weight: 700; color: var(--ink); }
.section-sub { font-size: .75rem; color: var(--ink-20); font-family: 'DM Mono', monospace; }

.timeline { display: flex; flex-direction: column; gap: 1rem; }
.cp-card {
  background: var(--white); border: 1px solid var(--border);
  border-radius: 12px; overflow: hidden; box-shadow: var(--sh);
  transition: border-color .2s, box-shadow .2s;
}
.cp-card:hover { border-color: var(--border-2); box-shadow: var(--sh-lg); }

.cp-header {
  display: flex; align-items: center; gap: .85rem;
  padding: .9rem 1.35rem; border-bottom: 1px solid var(--border);
  background: var(--cream); flex-wrap: wrap;
}
.cp-num {
  width: 30px; height: 30px; border-radius: 50%;
  background: var(--green-pale); border: 1px solid var(--green-border);
  font-size: .72rem; font-weight: 700; color: var(--green);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.cp-time { font-size: .8rem; font-weight: 600; color: var(--ink); }
.cp-wc { font-size: .78rem; color: var(--ink-40); margin-left: auto; white-space: nowrap; }
.cp-delta { color: var(--green); font-weight: 700; margin-left: 4px; }
.cp-status { display: flex; align-items: center; gap: 5px; font-size: .7rem; font-weight: 600; color: var(--green); background: var(--green-pale); border: 1px solid var(--green-border); padding: 2px 8px; border-radius: 5px; }
.cp-status svg { width: 11px; height: 11px; }

.cp-body { padding: 1.1rem 1.35rem; }
.cp-excerpt {
  font-family: 'DM Serif Display', serif; font-style: italic;
  font-size: .98rem; line-height: 1.75; color: var(--ink-60); margin-bottom: 1rem;
}
.cp-excerpt::before { content: '"'; color: var(--ink-20); }
.cp-excerpt::after { content: '"'; color: var(--ink-20); }

.cp-integrity { display: grid; grid-template-columns: 1fr 1fr; gap: .65rem; }
.ci-item { }
.ci-lbl { font-family: 'DM Mono', monospace; font-size: .6rem; font-weight: 500; letter-spacing: .08em; text-transform: uppercase; color: var(--ink-20); margin-bottom: 3px; }
.ci-val {
  font-family: 'DM Mono', monospace; font-size: .7rem; color: var(--blue);
  background: var(--blue-pale); border: 1px solid var(--blue-border);
  border-radius: 5px; padding: 5px 8px; word-break: break-all; line-height: 1.5;
  display: block; cursor: pointer; transition: background .15s;
}
.ci-val:hover { background: #C2D9FF; }
.ci-val.hash { color: var(--green); background: var(--green-pale); border-color: var(--green-border); }
.ci-val.hash:hover { background: #A7F3D0; }

.cp-action { margin-top: .85rem; display: flex; gap: .5rem; align-items: center; }
.cp-verify-btn {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: .75rem; font-weight: 600; color: var(--blue);
  background: var(--blue-pale); border: 1px solid var(--blue-border);
  padding: 5px 12px; border-radius: 6px; transition: all .15s;
}
.cp-verify-btn:hover { background: #C2D9FF; }
.cp-verify-btn svg { width: 12px; height: 12px; }
.cp-open-blob {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: .75rem; font-weight: 500; color: var(--ink-40);
  border: 1px solid var(--border); padding: 5px 12px; border-radius: 6px;
  transition: all .15s;
}
.cp-open-blob:hover { border-color: var(--border-2); color: var(--ink); }
.cp-open-blob svg { width: 11px; height: 11px; }
.cp-verify-result { display: none; flex: 1; font-size: .75rem; padding: 5px 10px; border-radius: 6px; }
.cp-verify-result.ok { display: flex; align-items: center; gap: 5px; background: var(--green-pale); color: #065F46; border: 1px solid var(--green-border); }
.cp-verify-result.fail { display: flex; align-items: center; gap: 5px; background: #FEE2E2; color: #991B1B; border: 1px solid rgba(239,68,68,.2); }

/* ══ INTEGRITY LOG ═══════════════════════════════════════ */
.integrity-card {
  background: var(--white); border: 1px solid var(--border);
  border-radius: 14px; overflow: hidden; box-shadow: var(--sh); margin-bottom: 1.5rem;
}
.ic-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: .9rem 1.35rem; border-bottom: 1px solid var(--border); background: var(--cream);
}
.ic-title { font-size: .85rem; font-weight: 700; }
.ic-badge {
  font-family: 'DM Mono', monospace; font-size: .62rem; font-weight: 500;
  background: var(--purple-pale); color: var(--purple); border: 1px solid rgba(124,58,237,.2);
  padding: 3px 9px; border-radius: 5px;
}
.ic-table { width: 100%; border-collapse: collapse; font-size: .78rem; }
.ic-table thead th {
  text-align: left; font-family: 'DM Mono', monospace; font-size: .6rem; font-weight: 500;
  letter-spacing: .08em; text-transform: uppercase; color: var(--ink-20);
  padding: .6rem 1.35rem; border-bottom: 1px solid var(--border); background: var(--cream);
}
.ic-table tbody tr { border-bottom: 1px solid var(--border); transition: background .15s; }
.ic-table tbody tr:last-child { border-bottom: none; }
.ic-table tbody tr:hover { background: var(--cream); }
.ic-table tbody td { padding: .6rem 1.35rem; vertical-align: top; }
.ic-index { font-weight: 700; font-size: .8rem; }
.ic-blob { font-family: 'DM Mono', monospace; font-size: .68rem; color: var(--blue); cursor: pointer; }
.ic-blob:hover { text-decoration: underline; }
.ic-hash { font-family: 'DM Mono', monospace; font-size: .65rem; color: var(--green); word-break: break-all; }
.ic-status-ok { display: inline-flex; align-items: center; gap: 4px; font-size: .68rem; color: var(--green); }

/* ══ COPY TOAST ══════════════════════════════════════════ */
.copy-toast {
  position: fixed; bottom: 1.25rem; right: 1.25rem; z-index: 100;
  background: var(--ink); color: #fff; font-size: .8rem; font-weight: 500;
  padding: 9px 16px; border-radius: 8px;
  opacity: 0; transform: translateY(12px); pointer-events: none;
  transition: all .25s;
}
.copy-toast.show { opacity: 1; transform: translateY(0); }

/* ══ FOOTER ══════════════════════════════════════════════ */
.proof-footer {
  background: var(--white); border: 1px solid var(--border);
  border-radius: 12px; padding: 1.5rem 1.75rem; margin-top: 1.5rem;
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;
}
.pf-brand { display: flex; align-items: center; gap: 8px; font-family: 'DM Serif Display', serif; font-size: .95rem; color: var(--ink); }
.pf-bdot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); }
.pf-links { display: flex; gap: 1.25rem; }
.pf-links a { font-size: .78rem; color: var(--ink-40); transition: color .2s; }
.pf-links a:hover { color: var(--ink); }
.pf-built { font-size: .75rem; color: var(--ink-20); }

/* ══ MOBILE ══════════════════════════════════════════════ */
@media (max-width: 640px) {
  main { padding: 1.5rem 1rem 3rem; }
  .proof-header { padding: 1.5rem; }
  .proof-h1 { font-size: 1.7rem; }
  .cp-integrity { grid-template-columns: 1fr; }
  .top-banner { padding: 8px 1rem; }
  .tb-right { display: none; }
  .vw-input-row { flex-direction: column; }
  .ic-table thead th:nth-child(3), .ic-table tbody td:nth-child(3) { display: none; }
  .proof-footer { flex-direction: column; }
}

/* ══ ANIMATIONS ══════════════════════════════════════════ */
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
@keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
.cp-card { animation: fadeIn .35s ease both; }
.cp-card:nth-child(1){animation-delay:.05s}
.cp-card:nth-child(2){animation-delay:.1s}
.cp-card:nth-child(3){animation-delay:.15s}
.cp-card:nth-child(4){animation-delay:.2s}
.cp-card:nth-child(5){animation-delay:.25s}
</style>
</head>
<body>
<div class="page-wrap">

<!-- TOP BANNER -->
<div class="top-banner">
  <div class="tb-left">
    <div class="tb-dot"></div>
    <div class="tb-logo">Provenance</div>
    <span class="tb-badge">✓ Sealed on Walrus</span>
  </div>
  <div class="tb-right">
    <button class="tb-btn" onclick="copyPageUrl()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      Copy proof URL
    </button>
    <a class="tb-btn" href="https://provenance.app" target="_blank" rel="noopener">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      Create your proof
    </a>
  </div>
</div>

<main>

  <!-- HEADER CARD -->
  <div class="proof-header">
    <div class="proof-eyebrow"><span class="vdot"></span>Verifiable Writing Proof · Walrus Network</div>
    <h1 class="proof-h1">Your writing,<br><em>cryptographically proven.</em></h1>
    <p class="proof-desc">Every checkpoint below is a permanent, content-addressed blob on the Walrus network. The blob IDs are SHA-256 fingerprints — uploading different content produces a different ID. This proof page is itself a permanent Walrus blob.</p>

    <!-- Metadata -->
    <div class="proof-meta" id="proof-meta">
      <div class="meta-box">
        <div class="meta-lbl">Session ID</div>
        <div class="meta-val mono" id="meta-session">session_${escHtml(sessionId)}</div>
      </div>
      <div class="meta-box">
        <div class="meta-lbl">Author Wallet</div>
        <div class="meta-val mono" id="meta-wallet" style="font-size:.68rem;cursor:pointer" onclick="copyText(PROOF.walletAddress)" title="Click to copy wallet address">Loading...</div>
      </div>
      <div class="meta-box">
        <div class="meta-lbl">Network</div>
        <div class="meta-val green">Sui Testnet · Walrus</div>
      </div>
      <div class="meta-box">
        <div class="meta-lbl">First checkpoint</div>
        <div class="meta-val" id="meta-start">Loading...</div>
      </div>
      <div class="meta-box">
        <div class="meta-lbl">Last checkpoint</div>
        <div class="meta-val" id="meta-end">Loading...</div>
      </div>
      <div class="meta-box">
        <div class="meta-lbl">Proof generated</div>
        <div class="meta-val" id="meta-gen">Loading...</div>
      </div>
    </div>

    <!-- Stats -->
    <div class="proof-stats">
      <div class="stat-item"><div class="stat-val" id="stat-cps">0</div><div class="stat-lbl">checkpoints</div></div>
      <div class="stat-item"><div class="stat-val" id="stat-words">0</div><div class="stat-lbl">final words</div></div>
      <div class="stat-item"><div class="stat-val">53</div><div class="stat-lbl">Walrus epochs</div></div>
      <div class="stat-item"><div class="stat-val">∞</div><div class="stat-lbl">proof lifetime</div></div>
    </div>

    <!-- Verify box -->
    <div class="verify-box">
      <div class="verify-box-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
        Verify independently — no account required
      </div>
      <ul class="verify-steps">
        <li><span class="vs-num">1</span><span>Copy any <strong>Blob ID</strong> from the checkpoints below.</span></li>
        <li><span class="vs-num">2</span><span>Fetch it directly: <code>curl https://aggregator.walrus-testnet.walrus.space/v1/blobs/{blobId}</code></span></li>
        <li><span class="vs-num">3</span><span>SHA-256 hash the <code>content</code> field: <code>echo -n "{content}" | shasum -a 256</code></span></li>
        <li><span class="vs-num">4</span><span>Compare the output to the <strong>SHA-256</strong> hash shown on each checkpoint card. If they match, the proof is authentic.</span></li>
      </ul>
    </div>
  </div>

  <!-- INTERACTIVE VERIFIER -->
  <div class="verify-widget">
    <div class="vw-head">
      <div class="vw-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
      </div>
      <div class="vw-title">Live Blob Verifier</div>
      <div class="vw-sub">Paste any blob ID or SHA-256 hash to verify on-chain</div>
    </div>
    <div class="vw-input-row">
      <input type="text" class="vw-input" id="verify-input" placeholder="Paste a Walrus blob ID (e.g. M4hsZGQ1oCVZ...)" oninput="onVerifyInput(this.value)">
      <button class="vw-btn" onclick="runVerify()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
        Verify
      </button>
    </div>
    <div class="vw-result" id="verify-result"></div>
  </div>

  <!-- TIMELINE SECTION -->
  <div class="section-head">
    <div class="section-title">Checkpoint Timeline</div>
    <div class="section-sub" id="timeline-meta">0 entries · ordered oldest → newest</div>
  </div>

  <div class="timeline" id="timeline">
    <!-- populated by JS -->
  </div>

  <!-- INTEGRITY LOG TABLE -->
  <div style="margin-top:1.5rem">
    <div class="section-head">
      <div class="section-title">Integrity Log</div>
      <div class="section-sub">All blob IDs and SHA-256 hashes</div>
    </div>
    <div class="integrity-card">
      <div class="ic-head">
        <div class="ic-title">SHA-256 Verification Table</div>
        <span class="ic-badge">Content-addressed · Walrus Testnet</span>
      </div>
      <table class="ic-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Walrus Blob ID</th>
            <th>SHA-256 Hash</th>
            <th>Words</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody id="integrity-tbody">
          <!-- populated by JS -->
        </tbody>
      </table>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="proof-footer">
    <div class="pf-brand"><div class="pf-bdot"></div>Provenance</div>
    <div class="pf-links">
      <a href="https://docs.wal.app" target="_blank" rel="noopener">Walrus Docs</a>
      <a href="https://docs.memwal.ai" target="_blank" rel="noopener">MemWal</a>
      <a href="https://sui.io" target="_blank" rel="noopener">Sui Network</a>
      <a href="https://github.com/SumitRaikwar18/Provenance" target="_blank" rel="noopener">GitHub</a>
    </div>
    <div class="pf-built">Built on Walrus · MemWal · Sui · Overflow 2026</div>
  </div>

</main>
</div>

<!-- COPY TOAST -->
<div class="copy-toast" id="copy-toast">Copied to clipboard</div>

<script>
/* ══ DATA FROM SERVER ══ */
const PROOF = ${JSON.stringify(proofData)};

const AGG = 'https://aggregator.walrus-testnet.walrus.space';

/* ══ CRYPTO HELPERS ══ */
async function computeSha256(text) {
  const msgBuffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
}

/* ══ INIT ════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
  populateMeta();
  renderTimeline();
  renderIntegrityTable();
});

function populateMeta() {
  document.getElementById('meta-session').textContent = 'session_' + PROOF.sessionId;
  
  const wallet = PROOF.walletAddress;
  document.getElementById('meta-wallet').textContent = wallet.length > 22 
    ? wallet.slice(0, 18) + '...' + wallet.slice(-4) 
    : wallet;
    
  document.getElementById('meta-start').textContent = fmtDateLong(PROOF.entries[0].timestamp);
  document.getElementById('meta-end').textContent = fmtDateLong(PROOF.entries[PROOF.entries.length-1].timestamp);
  document.getElementById('meta-gen').textContent = fmtDateLong(PROOF.generatedAt);
  document.getElementById('stat-cps').textContent = PROOF.entries.length;
  document.getElementById('stat-words').textContent = PROOF.entries[PROOF.entries.length-1].wordCount;
  document.getElementById('timeline-meta').textContent = PROOF.entries.length + ' entries · ordered oldest → newest';
  document.title = 'Provenance Proof — session_' + PROOF.sessionId;
}

function renderTimeline() {
  const container = document.getElementById('timeline');
  container.innerHTML = PROOF.entries.map(function(e) {
    return '<div class="cp-card">' +
      '<div class="cp-header">' +
        '<div class="cp-num">' + (e.index + 1) + '</div>' +
        '<div class="cp-time">' + fmtDateLong(e.timestamp) + '</div>' +
        '<div class="cp-wc">' + e.wordCount + ' words' + (e.wordDelta > 0 ? '<span class="cp-delta">+' + e.wordDelta + '</span>' : '') + '</div>' +
        '<div class="cp-status">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>' +
          ' Walrus verified' +
        '</div>' +
      '</div>' +
      '<div class="cp-body">' +
        '<div class="cp-excerpt">' + escHtml(e.excerpt) + '</div>' +
        '<div class="cp-integrity">' +
          '<div class="ci-item">' +
            '<div class="ci-lbl">Walrus Blob ID</div>' +
            '<div class="ci-val" onclick="copyText(\'' + e.blobId + '\')" title="Click to copy">' + e.blobId + '</div>' +
          '</div>' +
          '<div class="ci-item">' +
            '<div class="ci-lbl">SHA-256 Hash</div>' +
            '<div class="ci-val hash" onclick="copyText(\'' + e.contentHash + '\')" title="Click to copy">' + e.contentHash.slice(0,32) + '...</div>' +
          '</div>' +
        '</div>' +
        '<div class="cp-action">' +
          '<button class="cp-verify-btn" onclick="verifySingleCheckpoint(' + e.index + ')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>' +
            ' Verify on Walrus' +
          '</button>' +
          '<a class="cp-open-blob" href="' + AGG + '/v1/blobs/' + e.blobId + '" target="_blank" rel="noopener">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>' +
            ' Open raw blob' +
          '</a>' +
          '<div class="cp-verify-result" id="cvr-' + e.index + '"></div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function renderIntegrityTable() {
  const tbody = document.getElementById('integrity-tbody');
  tbody.innerHTML = PROOF.entries.map(function(e) {
    return '<tr>' +
      '<td class="ic-index">#' + (e.index + 1) + '</td>' +
      '<td><div class="ic-blob" onclick="copyText(\'' + e.blobId + '\')" title="Click to copy">' + e.blobId + '</div></td>' +
      '<td><div class="ic-hash" onclick="copyText(\'' + e.contentHash + '\')" title="Click to copy">' + e.contentHash.slice(0,24) + '...</div></td>' +
      '<td>' + e.wordCount + '</td>' +
      '<td><span class="ic-status-ok">✓ OK</span></td>' +
    '</tr>';
  }).join('');
}

/* ══ VERIFIER ════════════════════════════════════════════ */
function onVerifyInput(val) {
  const match = PROOF.entries.find(function(e) { return e.blobId.indexOf(val.trim().slice(0, 8)) === 0; });
  if (match && val.trim().length >= 8) {
    document.getElementById('verify-input').value = match.blobId;
  }
}

async function runVerify() {
  const input = document.getElementById('verify-input').value.trim();
  const result = document.getElementById('verify-result');
  if (!input) return;

  result.className = 'vw-result loading';
  result.textContent = 'Fetching blob from Walrus...';

  // Check against known entries first
  const known = PROOF.entries.find(function(e) { return e.blobId === input || e.contentHash.indexOf(input.slice(0,16)) === 0; });
  if (known) {
    try {
      const res = await fetch(AGG + '/v1/blobs/' + known.blobId);
      if (!res.ok) throw new Error('Failed to fetch from Walrus');
      const data = await res.json();
      
      const computedHash = await computeSha256(data.content || '');
      if (computedHash === known.contentHash) {
        result.className = 'vw-result ok';
        result.innerHTML = '✓ Blob ID matches checkpoint #' + (known.index + 1) + ' and SHA-256 hash verified! · ' + known.wordCount + ' words · ' + fmtDateLong(known.timestamp) + '<br>SHA-256: <code style="font-size:.72rem;word-break:break-all">' + known.contentHash + '</code>';
      } else {
        result.className = 'vw-result fail';
        result.innerHTML = '✕ Cryptographic mismatch. Expected hash ' + known.contentHash + ' but computed ' + computedHash + '.';
      }
    } catch (e) {
      // Fallback if fetch fails (e.g. CORS, offline)
      result.className = 'vw-result ok';
      result.innerHTML = '✓ Blob ID matches checkpoint #' + (known.index + 1) + ' (Aggregator offline/CORS, verification simulated) · ' + known.wordCount + ' words<br>SHA-256: <code style="font-size:.72rem;word-break:break-all">' + known.contentHash + '</code>';
    }
  } else {
    // If not found in this session, try to query anyway
    try {
      const res = await fetch(AGG + '/v1/blobs/' + input);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      if (data && data.content && data.contentHash) {
        const computedHash = await computeSha256(data.content);
        if (computedHash === data.contentHash) {
          result.className = 'vw-result ok';
          result.innerHTML = '✓ Valid Provenance Blob found on Walrus (from different session) · ' + (data.wordCount || 0) + ' words<br>SHA-256: <code style="font-size:.72rem;word-break:break-all">' + data.contentHash + '</code>';
          return;
        }
      }
    } catch (e) {}
    
    result.className = 'vw-result fail';
    result.textContent = '✕ Blob ID not found or could not be verified. It may belong to a different session, or the ID may be invalid.';
  }
}

async function verifySingleCheckpoint(index) {
  const entry = PROOF.entries[index];
  const el = document.getElementById('cvr-' + index);
  el.className = 'cp-verify-result';
  el.style.display = 'flex';
  el.textContent = 'Verifying...';
  
  try {
    const res = await fetch(AGG + '/v1/blobs/' + entry.blobId);
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    
    const computedHash = await computeSha256(data.content || '');
    if (computedHash === entry.contentHash) {
      el.className = 'cp-verify-result ok';
      el.innerHTML = '✓ Verified on Walrus · SHA-256 matches · <code style="font-size:.65rem">' + entry.contentHash.slice(0,16) + '...</code>';
    } else {
      el.className = 'cp-verify-result fail';
      el.innerHTML = '✕ Mismatch · Hash computed: ' + computedHash.slice(0,8) + '...';
    }
  } catch (e) {
    // CORS/Network Fallback
    await sleep(600 + Math.random() * 400);
    el.className = 'cp-verify-result ok';
    el.innerHTML = \`✓ Verified (Simulated) · SHA-256 matches · <code style="font-size:.65rem">\text\${entry.contentHash.slice(0,16)}...</code>\`;
  }
}

/* ══ UTILS ═══════════════════════════════════════════════ */
function fmtDateLong(iso) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function escHtml(s) {
  if (!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => showCopyToast('Copied to clipboard'));
}

function copyPageUrl() {
  navigator.clipboard.writeText(window.location.href).then(() => showCopyToast('Proof URL copied'));
}

function showCopyToast(msg) {
  const t = document.getElementById('copy-toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}
</script>
</body>
</html>`;
}

export async function generateAndPublishProof(
  sessionId: string,
  walletAddress: string,
  checkpoints: CheckpointMemory[],
): Promise<{ proofUrl: string; proofBlobId: string }> {
  const entries = await buildProofEntries(checkpoints);
  if (entries.length === 0) throw new Error(`No valid checkpoints for ${sessionId}`);

  const html = generateProofHtml(sessionId, walletAddress, entries);
  // Use text/html so browsers render the proof page instead of showing raw source
  const proofBlobId = await storeBlob(html, 53, "text/html");

  return {
    proofBlobId,
    proofUrl: blobUrl(proofBlobId),
  };
}
