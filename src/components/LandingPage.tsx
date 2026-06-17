"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConnectButton } from "@mysten/dapp-kit-react/ui";
import { useWalletConnection } from "@mysten/dapp-kit-react";

export function LandingPage() {
  const connection = useWalletConnection();
  const router = useRouter();

  useEffect(() => {
    if (connection.status === "connected") {
      router.push("/dashboard");
    }
  }, [connection.status, router]);

  return (
    <>
      <nav className="lnav">
        <div className="brand">
          <span className="pulse" />
          <span className="brand-logo">Provenance</span>
        </div>
        <div className="lnav-links">
          <a href="#flow">How it works</a>
          <a href="#why">Why Walrus</a>
          <ConnectButton className="btn-connect-nav">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ marginRight: "7px" }}
            >
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
            Connect Wallet
          </ConnectButton>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div>
            <div className="hero-tag">
              <span className="pulse" />
              Live on Walrus Testnet
            </div>
            <h1 className="hero-h1">
              Your writing,
              <br />
              <em>cryptographically proven.</em>
            </h1>
            <p className="hero-p">
              Provenance seals every draft milestone as a permanent Walrus blob, stores the ordered checkpoint chain in
              MemWal agent memory, and publishes a tamper-proof proof page — all anchored to your Sui wallet.
            </p>
            <div className="hero-btns">
              <ConnectButton className="btn-sui">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ marginRight: "9px" }}
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                </svg>
                Connect Wallet to Start
              </ConnectButton>
              <a className="btn-outline" href="#flow">
                See the flow
              </a>
            </div>
            <div className="hero-stats">
              <div>
                <div className="hs-val">∞</div>
                <div className="hs-lbl">Proof lifetime</div>
              </div>
              <div>
                <div className="hs-val">15s</div>
                <div className="hs-lbl">Demo seal cadence</div>
              </div>
              <div>
                <div className="hs-val">0</div>
                <div className="hs-lbl">Middlemen needed</div>
              </div>
            </div>
          </div>

          <div className="hero-mockup" aria-label="Provenance editor preview">
            <div className="mock-bar">
              <div className="mac">
                <span className="r" />
                <span className="y" />
                <span className="g" />
              </div>
              <div className="mock-url">provenance.app/editor — session_a7k2m</div>
            </div>
            <div className="mock-body">
              <div className="mock-wallet">
                <span className="pulse" />
                0x7a23...b9c1 · Sui Testnet
              </div>
              <div className="mock-ticker">
                <span className="pulse" />
                Next seal in 38s · Demo mode
              </div>
              <div className="mock-text" id="hero-type">
                In a world where AI generates text effortlessly, the process is the proof
                <span className="mock-cursor" />
              </div>
              <div className="mock-cps">
                <div className="mock-cps-lbl">Sealed checkpoints</div>
                <div className="mock-cp-row">
                  <span className="cdot" />
                  #1 · 09:14:02
                  <span className="cbid">M4hsZGQ1oC...</span>
                </div>
                <div className="mock-cp-row">
                  <span className="cdot" />
                  #2 · 09:14:17
                  <span className="cbid">oehkoh0352...</span>
                </div>
                <div className="mock-cp-row">
                  <span className="cdot" />
                  #3 · 09:14:32
                  <span className="cbid">x7P4mS9kQa...</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flow-sec" id="flow">
          <div className="flow-inner">
            <div className="sec-ey">User Flow</div>
            <h2 className="sec-h2">From blank page to permanent proof.</h2>
            <p className="sec-sub">
              Connect your Sui wallet once — then write. The agent memory layer handles everything else.
            </p>
            <div className="flow-grid">
              {[
                [
                  "1",
                  "Connect Sui Wallet",
                  "Your wallet address anchors the writing session to a verifiable on-chain identity.",
                ],
                [
                  "2",
                  "Write Normally",
                  "Every 60 seconds, a checkpoint is SHA-256 hashed and sealed as a permanent Walrus blob.",
                ],
                [
                  "3",
                  "Agent Analyzes",
                  "An AI writing agent reads your draft history from MemWal and surfaces insights about your process.",
                ],
                [
                  "4",
                  "Generate Proof",
                  "MemWal recalls the full checkpoint chain. A permanent proof page is published to Walrus and shared.",
                ],
              ].map(([num, title, desc], index) => (
                <div className={`flow-step ${index === 0 ? "hi" : ""}`} key={title}>
                  <div className="fs-num">{num}</div>
                  <div className="fs-title">{title}</div>
                  <div className="fs-desc">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="why-sec" id="why">
          <div className="why-inner">
            <div>
              <div className="why-lbl">Why it's unforgeable</div>
              <h2 className="why-h2">The proof is the artifact, not a screenshot.</h2>
              <p className="why-p">
                Walrus blob IDs are content-addressed. MemWal stores the ordered chain. The proof page is itself a
                permanent Walrus blob. A different draft produces a different blob ID — always.
              </p>
            </div>
            <div className="why-pts">
              {[
                [
                  "🔐",
                  "Content-addressed blobs",
                  "Blob IDs are derived from content via SHA-256. You cannot upload a different checkpoint and get the same ID.",
                ],
                [
                  "🧠",
                  "MemWal agent memory",
                  "MemWal stores the ordered blob ID chain with timestamps in a namespace the user cannot rewrite.",
                ],
                [
                  "🪪",
                  "Wallet-anchored identity",
                  "Your Sui wallet address ties every checkpoint to a cryptographic author identity — not an email.",
                ],
                [
                  "♾️",
                  "Proof page is a blob",
                  "The proof HTML is itself a permanent Walrus blob. Its URL is its content address — read-only forever.",
                ],
              ].map(([ico, title, desc]) => (
                <div className="why-pt" key={title}>
                  <div className="why-pt-ico">{ico}</div>
                  <div>
                    <div className="why-pt-title">{title}</div>
                    <div className="why-pt-desc">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="land-footer">
        <div className="lf-inner">
          <div className="brand">
            <span className="pulse" />
            <strong style={{ fontFamily: "'Playfair Display', serif" }}>Provenance</strong>
          </div>
          <div className="lf-links">
            <a href="https://docs.wal.app" target="_blank" rel="noreferrer">
              Walrus Docs
            </a>
            <a href="https://docs.wal.app/walrus-memory/sdk/quick-start" target="_blank" rel="noreferrer">
              MemWal SDK
            </a>
            <a href="https://sui.io" target="_blank" rel="noreferrer">
              Sui Network
            </a>
            <a href="https://github.com/SumitRaikwar18/Provenance" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
          <div className="lf-built">
            Built on{" "}
            <a href="https://walrus.xyz" target="_blank" rel="noreferrer">
              Walrus
            </a>{" "}
            · Sui Overflow 2026
          </div>
        </div>
      </footer>
    </>
  );
}
