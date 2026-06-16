"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ConnectButton } from "@mysten/dapp-kit-react/ui";
import { useDAppKit, useCurrentWallet, useWalletConnection } from "@mysten/dapp-kit-react";
import { nanoid } from "nanoid";
import {
  Copy,
  ExternalLink,
  FileClock,
  FileText,
  History,
  KeyRound,
  LogOut,
  PenLine,
  Plus,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { countWords, extractTitle, formatDate, formatTime, truncateAddress } from "@/lib/client-text";
import type { CheckpointResponse, ProofResponse, Session, SessionShareResponse } from "@/types";

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const INTERVAL = DEMO ? 15_000 : 60_000;

type Panel = "editor" | "sessions" | "proofs" | "wallet";
type TickerState = "idle" | "saving" | "saved" | "error";

interface CpLogEntry {
  blobId: string;
  timestamp: string;
  wordCount: number;
  index: number;
}

interface StoredProof {
  sessionId: string;
  title: string;
  url: string;
  proofBlobId: string | null;
  checkpointCount: number;
  wordCount: number;
  walletAddress: string;
  createdAt: string;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(localStorage.getItem(key) || "") as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function Dashboard() {
  const router = useRouter();
  const dAppKit = useDAppKit();
  const connection = useWalletConnection();
  const wallet = useCurrentWallet();
  const walletAddress = connection.account?.address ?? "";

  const [panel, setPanel] = useState<Panel>("editor");
  const [sessionId, setSessionId] = useState(() => nanoid(10));
  const [content, setContent] = useState("");
  const [checkpointIndex, setCheckpointIndex] = useState(0);
  const [checkpoints, setCheckpoints] = useState<CpLogEntry[]>([]);
  const [tickerState, setTickerState] = useState<TickerState>("idle");
  const [nextSaveIn, setNextSaveIn] = useState(INTERVAL / 1000);
  const [lastBlobId, setLastBlobId] = useState<string | null>(null);
  const [proofState, setProofState] = useState<"idle" | "generating" | "done" | "error">("idle");
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [proofBlobId, setProofBlobId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareBlobId, setShareBlobId] = useState<string | null>(null);
  const [shareState, setShareState] = useState<"idle" | "sharing" | "done" | "error">("idle");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [proofs, setProofs] = useState<StoredProof[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const contentRef = useRef(content);
  const indexRef = useRef(checkpointIndex);
  const tickerRef = useRef<TickerState>(tickerState);
  contentRef.current = content;
  indexRef.current = checkpointIndex;
  tickerRef.current = tickerState;

  const wordCount = useMemo(() => countWords(content), [content]);
  const title = useMemo(() => extractTitle(content), [content]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3600);
  }, []);

  const loadStorage = useCallback(() => {
    setSessions(readJson<Session[]>("provenance:sessions", []));
    setProofs(readJson<StoredProof[]>("provenance:proofs", []));
  }, []);

  useEffect(() => {
    loadStorage();
  }, [loadStorage]);

  useEffect(() => {
    if (connection.status === "disconnected") router.push("/");
  }, [connection.status, router]);

  const persistSession = useCallback(
    (partial?: Partial<Session>) => {
      if (!walletAddress) return;
      const existing = readJson<Session[]>("provenance:sessions", []);
      const old = existing.find((item) => item.sessionId === sessionId);
      const now = new Date().toISOString();
      const next: Session = {
        sessionId,
        walletAddress,
        title,
        startTime: old?.startTime ?? checkpoints[0]?.timestamp ?? now,
        lastSaved: partial?.lastSaved ?? old?.lastSaved ?? now,
        checkpointCount: partial?.checkpointCount ?? checkpoints.length,
        wordCount: partial?.wordCount ?? wordCount,
        lastBlobId: partial?.lastBlobId ?? lastBlobId,
        proofUrl: partial?.proofUrl ?? old?.proofUrl ?? proofUrl,
        proofBlobId: partial?.proofBlobId ?? old?.proofBlobId ?? proofBlobId,
        shareUrl: partial?.shareUrl ?? old?.shareUrl ?? shareUrl,
        shareBlobId: partial?.shareBlobId ?? old?.shareBlobId ?? shareBlobId,
      };
      const merged = [next, ...existing.filter((item) => item.sessionId !== sessionId)].slice(0, 30);
      writeJson("provenance:sessions", merged);
      setSessions(merged);
    },
    [checkpoints, lastBlobId, proofBlobId, proofUrl, sessionId, shareBlobId, shareUrl, title, walletAddress, wordCount],
  );

  const saveCheckpoint = useCallback(async () => {
    if (!walletAddress || contentRef.current.trim() === "" || tickerRef.current === "saving") return;

    setTickerState("saving");
    try {
      const res = await fetch("/api/checkpoint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          walletAddress,
          content: contentRef.current,
          checkpointIndex: indexRef.current,
        }),
      });
      const data = (await res.json()) as CheckpointResponse;
      if (!data.success) throw new Error(data.error || "Checkpoint failed");

      const nextEntry: CpLogEntry = {
        blobId: data.blobId!,
        timestamp: data.timestamp!,
        wordCount: data.wordCount!,
        index: data.checkpointIndex!,
      };

      setCheckpoints((prev) => [nextEntry, ...prev]);
      setCheckpointIndex((value) => value + 1);
      setLastBlobId(data.blobId!);
      setTickerState("saved");
      setNextSaveIn(INTERVAL / 1000);
      persistSession({
        lastSaved: data.timestamp!,
        checkpointCount: indexRef.current + 1,
        wordCount: data.wordCount!,
        lastBlobId: data.blobId!,
      });
      showToast(`Checkpoint #${data.checkpointIndex! + 1} sealed on Walrus`);
      window.setTimeout(() => setTickerState("idle"), 2600);
    } catch (error) {
      setTickerState("error");
      showToast(error instanceof Error ? error.message : "Checkpoint failed");
      window.setTimeout(() => setTickerState("idle"), 4200);
    }
  }, [persistSession, sessionId, showToast, walletAddress]);

  useEffect(() => {
    const autosave = window.setInterval(() => {
      void saveCheckpoint();
    }, INTERVAL);
    const countdown = window.setInterval(() => {
      setNextSaveIn((value) => (tickerRef.current === "idle" ? Math.max(0, value - 1) : value));
    }, 1000);
    return () => {
      window.clearInterval(autosave);
      window.clearInterval(countdown);
    };
  }, [saveCheckpoint]);

  const generateProof = async () => {
    if (checkpoints.length === 0 || proofState === "generating") return;
    setProofState("generating");
    try {
      const res = await fetch("/api/proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, walletAddress }),
      });
      const data = (await res.json()) as ProofResponse;
      if (!data.success) throw new Error(data.error || "Proof generation failed");

      const storedProof: StoredProof = {
        sessionId,
        title,
        url: data.proofUrl!,
        proofBlobId: data.proofBlobId ?? null,
        checkpointCount: data.checkpointCount ?? checkpoints.length,
        wordCount,
        walletAddress,
        createdAt: new Date().toISOString(),
      };
      const mergedProofs = [storedProof, ...readJson<StoredProof[]>("provenance:proofs", [])].slice(0, 50);
      writeJson("provenance:proofs", mergedProofs);
      setProofs(mergedProofs);
      setProofUrl(data.proofUrl!);
      setProofBlobId(data.proofBlobId ?? null);
      persistSession({ proofUrl: data.proofUrl!, proofBlobId: data.proofBlobId ?? null });
      setProofState("done");
      setModalOpen(true);
      showToast("Proof published to Walrus");
    } catch (error) {
      setProofState("error");
      showToast(error instanceof Error ? error.message : "Proof generation failed");
      window.setTimeout(() => setProofState("idle"), 4200);
    }
  };

  const shareSession = async () => {
    if (checkpoints.length === 0 || shareState === "sharing") return;
    setShareState("sharing");
    try {
      const res = await fetch("/api/session-share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          walletAddress,
          title,
          wordCount,
          checkpointCount: checkpoints.length,
          checkpoints: [...checkpoints].reverse(),
          proofUrl,
        }),
      });
      const data = (await res.json()) as SessionShareResponse;
      if (!data.success) throw new Error(data.error || "Session share failed");
      setShareUrl(data.shareUrl!);
      setShareBlobId(data.shareBlobId ?? null);
      persistSession({ shareUrl: data.shareUrl!, shareBlobId: data.shareBlobId ?? null });
      setShareState("done");
      showToast("Session manifest published to Walrus");
    } catch (error) {
      setShareState("error");
      showToast(error instanceof Error ? error.message : "Session share failed");
      window.setTimeout(() => setShareState("idle"), 4200);
    }
  };

  const disconnectWallet = async () => {
    await dAppKit.disconnectWallet();
    router.push("/");
  };

  const startNewSession = () => {
    setSessionId(nanoid(10));
    setContent("");
    setCheckpointIndex(0);
    setCheckpoints([]);
    setLastBlobId(null);
    setProofUrl(null);
    setProofBlobId(null);
    setShareUrl(null);
    setShareBlobId(null);
    setShareState("idle");
    setProofState("idle");
    setNextSaveIn(INTERVAL / 1000);
    setPanel("editor");
    showToast("New Provenance session started");
  };

  const copyText = async (value: string, label = "Copied to clipboard") => {
    await navigator.clipboard.writeText(value);
    showToast(label);
  };

  if (!walletAddress) {
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <section className="panel-card max-w-md text-center">
          <div className="inline-brand justify-center mb-4">
            <span className="pulse-dot" />
            <strong className="font-display text-2xl">Provenance</strong>
          </div>
          <h1 className="font-display text-3xl font-bold mb-3">Connect your Sui wallet.</h1>
          <p className="text-[var(--ink-3)] mb-6">
            Your wallet anchors the writing session before checkpoints are sealed to Walrus.
          </p>
          <ConnectButton>
            <span className="inline-flex items-center gap-2">
              <Wallet size={18} /> Connect Wallet
            </span>
          </ConnectButton>
        </section>
      </main>
    );
  }

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="pulse-dot" />
          Provenance
        </div>
        <div className="sidebar-card">
          <div className="sidebar-label">Connected wallet</div>
          <div className="sidebar-value">{truncateAddress(walletAddress)}</div>
          <button className="btn-soft mt-3 w-full" type="button" onClick={() => copyText(walletAddress, "Address copied")}>
            <Copy size={15} /> Copy address
          </button>
        </div>
        <div className="side-stats">
          <div className="side-stat">
            <b>{wordCount}</b>
            <span>words</span>
          </div>
          <div className="side-stat">
            <b>{checkpoints.length}</b>
            <span>checkpoints</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <SideNavButton active={panel === "editor"} count={`${checkpoints.length} cp`} icon={<PenLine />} label="Editor" onClick={() => setPanel("editor")} />
          <SideNavButton active={panel === "sessions"} count={sessions.length} icon={<History />} label="Sessions" onClick={() => { loadStorage(); setPanel("sessions"); }} />
          <SideNavButton active={panel === "proofs"} count={proofs.length} icon={<ShieldCheck />} label="Proofs" onClick={() => { loadStorage(); setPanel("proofs"); }} />
          <SideNavButton active={panel === "wallet"} icon={<KeyRound />} label="Wallet Info" onClick={() => setPanel("wallet")} />
        </nav>
      </aside>

      <main className="dash-main">
        <div className="dash-topbar">
          <div>
            <div className="topbar-title">{panelTitle(panel)}</div>
            <div className="topbar-session">session_{sessionId}</div>
          </div>
          <div className="topbar-actions">
            <button className="btn-soft" type="button" onClick={startNewSession}>
              <Plus /> New session
            </button>
            <button className="btn-soft" type="button" onClick={() => void disconnectWallet()}>
              <LogOut /> Disconnect
            </button>
          </div>
        </div>

        <section className={`dash-panel ${panel === "editor" ? "active" : ""}`}>
          <div className="editor-grid">
            <div className="editor-frame">
              <div className="editor-toolbar">
                <div className="editor-meta">
                  <span className="font-display font-bold">Provenance</span>
                  <span className="text-sm text-[var(--ink-3)]">{wordCount} words</span>
                  <Ticker state={tickerState} nextSaveIn={nextSaveIn} lastBlobId={lastBlobId} />
                </div>
                <button className="btn-dark" disabled={proofState === "generating" || checkpoints.length === 0} type="button" onClick={generateProof}>
                  <FileText />
                  {proofState === "generating" ? "Building proof..." : "Generate Proof"}
                </button>
              </div>
              <textarea
                autoFocus
                className="editor-textarea"
                onChange={(event) => setContent(event.target.value)}
                placeholder="Start writing. Your process is being sealed on Walrus..."
                value={content}
              />
            </div>

            <aside className="checkpoint-panel">
              <div className="panel-card">
                <h2 className="panel-title">Checkpoint chain</h2>
                <p className="panel-sub">
                  {DEMO ? "Demo Mode - 15s seal" : "Production cadence - 60s seal"}
                </p>
                <button className="btn-sui w-full" disabled={content.trim() === "" || tickerState === "saving"} type="button" onClick={() => void saveCheckpoint()}>
                  <FileClock /> Seal now
                </button>
                <button className="btn-outline w-full mt-3" disabled={checkpoints.length === 0 || shareState === "sharing"} type="button" onClick={() => void shareSession()}>
                  <ExternalLink /> {shareState === "sharing" ? "Publishing session..." : "Share Session"}
                </button>
                {shareUrl ? (
                  <button className="btn-soft w-full mt-3" type="button" onClick={() => copyText(shareUrl, "Session URL copied")}>
                    <Copy /> Copy session URL
                  </button>
                ) : null}
              </div>
              <div className="panel-card">
                <h2 className="panel-title">Sealed checkpoints</h2>
                <p className="panel-sub">Permanent Walrus blob IDs for this session.</p>
                {checkpoints.length === 0 ? (
                  <div className="cp-empty">No checkpoints yet. Write text and wait for the next seal.</div>
                ) : (
                  <div className="cp-list">
                    {checkpoints.map((cp) => (
                      <div className="cp-item" key={`${cp.blobId}-${cp.index}`}>
                        <div className="cp-num">{cp.index + 1}</div>
                        <div className="min-w-0">
                          <div className="cp-time">
                            {formatTime(cp.timestamp)} - {cp.wordCount} words
                          </div>
                          <button className="cp-blob text-left w-full" type="button" onClick={() => copyText(cp.blobId, "Blob ID copied")}>
                            {cp.blobId}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </section>

        <section className={`dash-panel ${panel === "sessions" ? "active" : ""}`}>
          <div className="grid-cards">
            {sessions.length === 0 ? (
              <div className="empty-state">No sessions yet. Start writing to create your first session.</div>
            ) : (
              sessions.map((session) => (
                <article className="session-card" key={session.sessionId}>
                  <h3>{session.title}</h3>
                  <div className="card-meta">
                    {session.checkpointCount} checkpoints - {session.wordCount} words - {formatDate(session.lastSaved)}
                    <br />
                    <span className="font-mono">{truncateAddress(session.walletAddress)}</span>
                  </div>
                  <div className="card-actions">
                    {session.proofUrl ? (
                      <>
                        <a className="btn-soft" href={session.proofUrl} target="_blank" rel="noreferrer">
                          <ExternalLink /> View proof
                        </a>
                        <button className="btn-soft" type="button" onClick={() => copyText(session.proofUrl!, "Proof URL copied")}>
                          <Copy /> Copy
                        </button>
                      </>
                    ) : (
                      <button className="btn-soft" type="button" onClick={() => setPanel("editor")}>
                        Continue writing
                      </button>
                    )}
                    {session.shareUrl ? (
                      <a className="btn-soft" href={session.shareUrl} target="_blank" rel="noreferrer">
                        <ExternalLink /> Share
                      </a>
                    ) : null}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className={`dash-panel ${panel === "proofs" ? "active" : ""}`}>
          <div className="grid-cards">
            {proofs.length === 0 ? (
              <div className="empty-state">No proofs yet. Generate a proof after at least one checkpoint.</div>
            ) : (
              proofs.map((proof) => (
                <article className="proof-card" key={`${proof.url}-${proof.createdAt}`}>
                  <h3>{proof.title}</h3>
                  <div className="proof-url">{proof.url}</div>
                  <div className="card-meta mt-2">
                    {proof.checkpointCount} checkpoints - {proof.wordCount} words - {formatDate(proof.createdAt)}
                  </div>
                  <div className="card-actions">
                    <a className="btn-soft" href={proof.url} target="_blank" rel="noreferrer">
                      <ExternalLink /> Open
                    </a>
                    <button className="btn-soft" type="button" onClick={() => copyText(proof.url, "Proof URL copied")}>
                      <Copy /> Copy
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className={`dash-panel ${panel === "wallet" ? "active" : ""}`}>
          <div className="wallet-info-grid">
            <div className="wallet-info-hero">
              <div className="sidebar-label text-[var(--blue-dark)]">Author identity</div>
              <h2 className="font-display text-3xl font-bold my-2">{truncateAddress(walletAddress)}</h2>
              <p className="text-[var(--ink-3)] font-mono break-all">{walletAddress}</p>
            </div>
            <div className="panel-card">
              <h3 className="panel-title">Wallet</h3>
              <p className="panel-sub">{wallet?.name ?? "Connected Sui wallet"}</p>
            </div>
            <div className="panel-card">
              <h3 className="panel-title">Network</h3>
              <p className="panel-sub">Sui Testnet</p>
            </div>
            <div className="panel-card">
              <h3 className="panel-title">Artifacts</h3>
              <p className="panel-sub">
                {sessions.length} sessions - {proofs.length} proofs
              </p>
            </div>
            <div className="panel-card">
              <h3 className="panel-title">Connection</h3>
              <button className="btn-dark w-full" type="button" onClick={() => void disconnectWallet()}>
                <LogOut /> Disconnect and return home
              </button>
            </div>
          </div>
        </section>
      </main>

      {modalOpen && proofUrl ? (
        <ProofModal
          checkpointCount={checkpoints.length}
          onClose={() => setModalOpen(false)}
          onCopy={() => void copyText(proofUrl, "Proof URL copied")}
          proofUrl={proofUrl}
          sessionId={sessionId}
          walletAddress={walletAddress}
          wordCount={wordCount}
        />
      ) : null}

      {toast ? (
        <div className="toast-wrap">
          <div className="toast">{toast}</div>
        </div>
      ) : null}
    </div>
  );
}

function SideNavButton({
  active,
  count,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  count?: string | number;
  icon: React.ReactElement;
  label: string;
  onClick: () => void;
}) {
  return (
    <button className={`sb-nav-btn ${active ? "active" : ""}`} type="button" onClick={onClick}>
      <span>
        {icon}
        {label}
      </span>
      {count !== undefined ? <span className="nav-count">{count}</span> : null}
    </button>
  );
}

function Ticker({ lastBlobId, nextSaveIn, state }: { lastBlobId: string | null; nextSaveIn: number; state: TickerState }) {
  const text =
    state === "saving"
      ? "Sealing on Walrus..."
      : state === "saved"
        ? `Sealed - ${lastBlobId?.slice(0, 10) ?? "blob"}...`
        : state === "error"
          ? "Seal failed"
          : `Next seal in ${nextSaveIn}s`;

  return (
    <span className={`ticker tk-${state}`}>
      <span className="pulse-dot" />
      {text}
    </span>
  );
}

function ProofModal({
  checkpointCount,
  onClose,
  onCopy,
  proofUrl,
  sessionId,
  walletAddress,
  wordCount,
}: {
  checkpointCount: number;
  onClose: () => void;
  onCopy: () => void;
  proofUrl: string;
  sessionId: string;
  walletAddress: string;
  wordCount: number;
}) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-label="Proof published" onClick={(event) => event.stopPropagation()}>
        <h2>Proof published.</h2>
        <p className="text-[var(--ink-3)]">
          {checkpointCount} checkpoints - {wordCount} words - session_{sessionId} - {truncateAddress(walletAddress)}
        </p>
        <div className="modal-url">{proofUrl}</div>
        <div className="modal-actions">
          <button className="btn-sui" type="button" onClick={onCopy}>
            <Copy /> Copy URL
          </button>
          <a className="btn-outline" href={proofUrl} target="_blank" rel="noreferrer">
            <ExternalLink /> Open Proof
          </a>
          <button className="btn-soft" type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function panelTitle(panel: Panel): string {
  switch (panel) {
    case "sessions":
      return "Sessions";
    case "proofs":
      return "Proofs";
    case "wallet":
      return "Wallet Info";
    default:
      return "Editor";
  }
}
