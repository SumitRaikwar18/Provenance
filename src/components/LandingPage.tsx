"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ConnectModal } from "@mysten/dapp-kit-react/ui";
import { useWalletConnection } from "@mysten/dapp-kit-react";

export function LandingPage() {
  const connection = useWalletConnection();
  const router = useRouter();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const connectModalRef = useRef<any>(null);

  useEffect(() => {
    const el = connectModalRef.current;
    if (!el) return;
    const handleClosed = () => {
      setShowConnectModal(false);
    };
    el.addEventListener("closed", handleClosed);
    return () => {
      el.removeEventListener("closed", handleClosed);
    };
  }, [showConnectModal]);

  useEffect(() => {
    if (connection.status === "connected") {
      router.push("/dashboard");
    }
  }, [connection.status, router]);

  useEffect(() => {
    const LINES = [
      "In a world where AI generates text effortlessly, the process is the proof",
      "Provenance creates a cryptographic trail no language model can fabricate",
      "Every word, every revision, every checkpoint — sealed forever on Walrus",
      "Your Sui wallet anchors your creative identity to an immutable chain",
    ];
    let li = 0, ci = 0, forward = true;
    const el = document.getElementById("hero-type");
    if (!el) return;

    const interval = setInterval(() => {
      const line = LINES[li];
      if (forward) {
        if (ci < line.length) {
          ci++;
        } else {
          forward = false;
          return;
        }
      } else {
        if (ci > 0) {
          ci--;
        } else {
          li = (li + 1) % LINES.length;
          forward = true;
          return;
        }
      }
      el.textContent = line.slice(0, ci);
      const cursor = document.createElement("span");
      cursor.className = "cursor";
      el.appendChild(cursor);
    }, 44);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div id="page-landing" className="page active">
        {/* ═══════ NAV ═══════ */}
        <nav className="nav">
          <div className="nav-logo">
            <div className="nav-beacon" />
            Provenance
          </div>
          <div className="nav-links">
            <a href="#how">How it works</a>
            <a href="#why">Why Walrus</a>
          </div>
          <button className="nav-cta" onClick={() => setShowConnectModal(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
            Connect Wallet
          </button>
        </nav>

        {/* ═══════ HERO ═══════ */}
        <section className="hero">
          <div className="hero-eyebrow">
            <span />
            Live on Walrus Testnet &nbsp;·&nbsp; Sui Overflow 2026
          </div>

          <h1 className="hero-headline">
            Your writing,
            <br />
            <span className="italic">cryptographically proven.</span>
          </h1>

          <p className="hero-sub">
            Provenance seals every draft milestone as a permanent Walrus blob, persists the checkpoint chain in MemWal
            agent memory, and publishes a tamper-proof authorship proof — anchored to your Sui wallet identity.
          </p>

          <div className="hero-actions">
            <button className="btn-primary" onClick={() => setShowConnectModal(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
              Connect Wallet to Start
            </button>
            <a href="#how" className="btn-ghost">
              See how it works
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Terminal mockup */}
          <div className="hero-terminal">
            <div className="terminal-bar">
              <div className="tm-dots">
                <div className="tm-dot r" />
                <div className="tm-dot y" />
                <div className="tm-dot g" />
              </div>
              <div className="tm-url">provenance.walrus.site — session_a7k2m · Sui Testnet</div>
              <div className="tm-status">
                <div className="tm-status-dot" />
                Walrus Live
              </div>
            </div>
            <div className="terminal-body">
              <div className="tm-editor">
                <div className="tm-wallet-chip">
                  <div className="wd" />
                  0x7a23...b9c1 · Testnet
                </div>
                <div className="tm-ticker">
                  <div className="td" />
                  Next seal in 38s · Demo mode
                </div>
                <div className="tm-text" id="hero-type">
                  In a world where AI generates text effortlessly, the process is the proof
                  <span className="cursor" />
                </div>
                <button className="tm-proof-btn">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                  Generate Proof →
                </button>
              </div>
              <div className="tm-chain">
                <div className="tm-chain-lbl">Checkpoint Chain — MemWal</div>
                <div className="tm-cp">
                  <div className="tm-cp-num">1</div>
                  <div className="tm-cp-info">
                    <div className="tm-cp-time">09:14:02 · 12 words</div>
                    <div className="tm-cp-blob">M4hsZGQ1oCVZt-e3sW7_4BUk...</div>
                  </div>
                  <div className="tm-cp-words">+12</div>
                </div>
                <div className="tm-cp">
                  <div className="tm-cp-num">2</div>
                  <div className="tm-cp-info">
                    <div className="tm-cp-time">09:14:17 · 27 words</div>
                    <div className="tm-cp-blob">BKq9XPRT3nWwYmRs4oGV7TFZ...</div>
                  </div>
                  <div className="tm-cp-words">+15</div>
                </div>
                <div className="tm-cp">
                  <div className="tm-cp-num">3</div>
                  <div className="tm-cp-info">
                    <div className="tm-cp-time">09:14:32 · 41 words</div>
                    <div className="tm-cp-blob">x7P4mS9kQaYoW3nR2vLjH8...</div>
                  </div>
                  <div className="tm-cp-words">+14</div>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-stats">
            <div className="hs-item">
              <div className="hs-val">53</div>
              <div className="hs-lbl">Walrus epochs stored</div>
            </div>
            <div className="hs-item">
              <div className="hs-val">15s</div>
              <div className="hs-lbl">Demo seal cadence</div>
            </div>
            <div className="hs-item">
              <div className="hs-val">∞</div>
              <div className="hs-lbl">Proof permanence</div>
            </div>
            <div className="hs-item">
              <div className="hs-val">0</div>
              <div className="hs-lbl">Trusted middlemen</div>
            </div>
          </div>
        </section>

        {/* ═══════ HOW IT WORKS ═══════ */}
        <section className="flow-section" id="how">
          <div className="flow-inner">
            <div className="section-ey">User Flow</div>
            <h2 className="section-h2">
              From blank page
              <br />
              to verifiable proof.
            </h2>
            <p className="section-sub">
              Connect your Sui wallet once, then write. The checkpoint chain and agent memory build themselves
              automatically.
            </p>
            <div className="flow-grid">
              <div className="flow-card hi">
                <div className="fc-index">01 — Identity</div>
                <div className="fc-icon">🔑</div>
                <div className="fc-title">Connect Sui Wallet</div>
                <p className="fc-desc">
                  Your wallet address is the cryptographic anchor for your authorship identity — not an email, not a
                  password.
                </p>
              </div>
              <div className="flow-card">
                <div className="fc-index">02 — Capture</div>
                <div className="fc-icon">✍️</div>
                <div className="fc-title">Write Normally</div>
                <p className="fc-desc">
                  Every 60 seconds (15s demo), a checkpoint is SHA-256 hashed and sealed as a permanent Walrus blob via
                  MemWal.
                </p>
              </div>
              <div className="flow-card">
                <div className="fc-index">03 — Analyze</div>
                <div className="fc-icon">🧠</div>
                <div className="fc-title">Agent Observes</div>
                <p className="fc-desc">
                  The AI writing agent recalls your checkpoint history from MemWal and surfaces insights about pace,
                  themes, and style.
                </p>
              </div>
              <div className="flow-card">
                <div className="fc-index">04 — Prove</div>
                <div className="fc-icon">📄</div>
                <div className="fc-title">Generate Proof</div>
                <p className="fc-desc">
                  MemWal recalls the full checkpoint chain. A self-contained, permanent HTML proof page is published to
                  Walrus.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ AGENT / TRACK FIT ═══════ */}
        <section className="track-section" id="agents">
          <div className="track-inner">
            <div className="track-copy">
              <div className="section-ey">Walrus Track Fit</div>
              <h2 className="section-h2">A durable agentic workflow, not a demo.</h2>
              <p className="section-sub">
                Writing sessions become reusable agent context. Checkpoints become persistent Walrus files. MemWal keeps the
                ordered memory chain. The AI can return to any session, any time.
              </p>
            </div>
            <div className="track-grid">
              <div className="track-card">
                <div className="tc-icon">🧠</div>
                <div className="tc-title">MemWal Memory</div>
                <p className="tc-desc">Session namespaces preserve checkpoint chains across visits and tools.</p>
              </div>
              <div className="track-card">
                <div className="tc-icon">🌊</div>
                <div className="tc-title">Walrus Artifacts</div>
                <p className="tc-desc">Draft checkpoints, manifests, and proof pages are stored as permanent Walrus blobs.</p>
              </div>
              <div className="track-card">
                <div className="tc-icon">🔗</div>
                <div className="tc-title">Agent-Ready Context</div>
                <p className="tc-desc">The API exposes recall and analysis routes for any workflow automation.</p>
              </div>
              <div className="track-card">
                <div className="tc-icon">↗️</div>
                <div className="tc-title">Portable Sharing</div>
                <p className="tc-desc">Every session shares as a verifier-readable Walrus URL — no account needed to view.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ WHY IT'S UNFORGEABLE ═══════ */}
        <section className="why-section" id="why">
          <div className="why-inner">
            <div>
              <div className="section-ey">Why it works</div>
              <h2 className="section-h2">The chain of custody is cryptographic, not claimed.</h2>
              <p className="section-sub" style={{ marginBottom: 0 }}>
                Every other provenance tool tells you when a file was uploaded. Provenance proves the living process —
                and the chain cannot be retroactively edited by anyone, including us.
              </p>
              <div className="why-points">
                <div className="why-pt">
                  <div className="wp-icon">🔐</div>
                  <div>
                    <div className="wp-title">Content-addressed blobs</div>
                    <p className="wp-desc">
                      Walrus blob IDs are SHA-256 fingerprints. You cannot upload different content and get the same ID.
                    </p>
                  </div>
                </div>
                <div className="why-pt">
                  <div className="wp-icon">🧠</div>
                  <div>
                    <div className="wp-title">MemWal ordered chain</div>
                    <p className="wp-desc">
                      MemWal stores the ordered sequence of blob IDs with timestamps in a namespace outside your control.
                    </p>
                  </div>
                </div>
                <div className="why-pt">
                  <div className="wp-icon">🪪</div>
                  <div>
                    <div className="wp-title">Wallet-anchored identity</div>
                    <p className="wp-desc">
                      Your Sui wallet ties every session to a cryptographic author identity — not an email or a login.
                    </p>
                  </div>
                </div>
                <div className="why-pt">
                  <div className="wp-icon">♾️</div>
                  <div>
                    <div className="wp-title">Proof page is itself a blob</div>
                    <p className="wp-desc">
                      The proof HTML is a permanent Walrus blob. Its URL is its content address — read-only, forever.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="why-proof-demo">
                <div className="wpd-header">
                  Provenance Writing Proof
                  <span>session_a7k2m · Sui Testnet · 3 checkpoints</span>
                </div>
                <div className="wpd-body">
                  <div className="wpd-row">
                    <div className="wpd-lbl">Wallet</div>
                    <div className="wpd-val">0x7a23b9c14f3e8d2a1c5f6b9e0a3d7c2e1f8b4a9c</div>
                  </div>
                  <div className="wpd-row">
                    <div className="wpd-lbl">Checkpoint 1 · Blob ID</div>
                    <div className="wpd-val">M4hsZGQ1oCVZt-e3sW7_4BUkp...</div>
                  </div>
                  <div className="wpd-row">
                    <div className="wpd-lbl">SHA-256</div>
                    <div className="wpd-val green">3f2a1b9c7e4d8f5a2c6b0e3d...</div>
                  </div>
                  <div className="wpd-row">
                    <div className="wpd-lbl">Proof Page · Walrus Blob</div>
                    <div className="wpd-val">aggregator.walrus-testnet.walrus.space/v1/blobs/xP4m...</div>
                  </div>
                  <div className="wpd-verify">
                    ✓ Verify independently: fetch each blob, hash the <code>content</code> field with SHA-256, compare to
                    the displayed hash. No account needed.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ CTA ═══════ */}
        <section className="cta-section">
          <h2 className="cta-h2">
            Start proving
            <br />
            <em>your process.</em>
          </h2>
          <p className="cta-sub">Connect your Sui wallet and write your first sealed session in under a minute.</p>
          <div className="cta-actions">
            <button className="btn-primary" onClick={() => setShowConnectModal(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
              Connect Wallet to Start
            </button>
            <a href="https://github.com/SumitRaikwar18/Provenance" target="_blank" rel="noreferrer" className="btn-ghost">
              View on GitHub →
            </a>
          </div>
        </section>

        {/* ═══════ FOOTER ═══════ */}
        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-logo">Provenance</div>
            <div className="footer-links">
              <a href="https://docs.wal.app" target="_blank" rel="noreferrer">
                Walrus Docs
              </a>
              <a href="https://docs.memwal.ai" target="_blank" rel="noreferrer">
                MemWal SDK
              </a>
              <a href="https://sui.io" target="_blank" rel="noreferrer">
                Sui Network
              </a>
              <a href="https://github.com/SumitRaikwar18/Provenance" target="_blank" rel="noreferrer">
                GitHub
              </a>
            </div>
            <div className="footer-built">
              Built on{" "}
              <a href="https://walrus.xyz" target="_blank" rel="noreferrer">
                Walrus
              </a>{" "}
              &amp; Sui · Overflow 2026
            </div>
          </div>
        </footer>
        <ConnectModal ref={connectModalRef} open={showConnectModal} />
      </div>
    </>
  );
}
