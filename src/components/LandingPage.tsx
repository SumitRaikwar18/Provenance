"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConnectButton } from "@mysten/dapp-kit-react/ui";
import { useWalletConnection } from "@mysten/dapp-kit-react";
import { ArrowRight, BookOpen, ExternalLink, ShieldCheck, Wallet } from "lucide-react";

const proofRows = [
  ["Checkpoint 01", "M4hsZGQ1oC...W7_4BUk"],
  ["Checkpoint 02", "oehkoh0352...dNAlXg"],
  ["Proof page", "x7P4mS9kQ...aL2vN"],
];

export function LandingPage() {
  const connection = useWalletConnection();
  const router = useRouter();

  useEffect(() => {
    if (connection.status === "connected") router.push("/dashboard");
  }, [connection.status, router]);

  return (
    <>
      <nav className="nav">
        <div className="nav-brand">
          <span className="pulse-dot" />
          <span className="nav-logo">Provenance</span>
        </div>
        <div className="nav-links">
          <a href="#flow">Flow</a>
          <a href="#why">Why Walrus</a>
          <a href="https://github.com/MystenLabs/MemWal" target="_blank" rel="noreferrer">
            MemWal
          </a>
          <ConnectButton>
            <span className="inline-flex items-center gap-2">
              <Wallet size={16} /> Connect Wallet
            </span>
          </ConnectButton>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div>
            <div className="hero-tag">
              <span className="pulse-dot" />
              Walrus memory for writers
            </div>
            <h1 className="hero-h1">
              Your writing, <em>cryptographically proven.</em>
            </h1>
            <p className="hero-p">
              Provenance seals your drafts to Walrus and stores the ordered checkpoint chain in MemWal, giving your
              creative process a permanent, verifiable timeline anchored to your Sui wallet.
            </p>
            <div className="hero-btns">
              <ConnectButton>
                <span className="inline-flex items-center gap-2">
                  <Wallet size={18} /> Connect Wallet to Start
                </span>
              </ConnectButton>
              <a className="btn-outline" href="#flow">
                <BookOpen /> See the flow
              </a>
            </div>
            <div className="hero-stats">
              <div>
                <div className="hs-val">60s</div>
                <div className="hs-lbl">checkpoint cadence</div>
              </div>
              <div>
                <div className="hs-val">53</div>
                <div className="hs-lbl">proof epochs</div>
              </div>
              <div>
                <div className="hs-val">0x</div>
                <div className="hs-lbl">wallet identity</div>
              </div>
            </div>
          </div>

          <div className="hero-mockup" aria-label="Provenance editor preview">
            <div className="mockup-bar">
              <div className="mac-dots">
                <span className="r" />
                <span className="y" />
                <span className="g" />
              </div>
              <div className="mockup-url">provenance.app/editor</div>
            </div>
            <div className="mockup-body">
              <div className="mb-wallet-chip">
                <span className="pulse-dot" /> 0x7a23...b9c1
              </div>
              <div className="mb-ticker">
                <span className="pulse-dot" /> Next seal in 42s
              </div>
              <div className="mb-text">
                In a world where generated text is effortless, the process becomes the proof. Provenance records each
                meaningful turn of the draft as a content-addressed artifact.<span className="mb-cursor" />
              </div>
              <div className="mb-cps">
                <div className="mb-cps-lbl">Sealed checkpoints</div>
                {proofRows.map(([label, blob]) => (
                  <div className="mb-cp-row" key={label}>
                    <span className="cdot" />
                    <span>{label}</span>
                    <span className="cbid">{blob}</span>
                  </div>
                ))}
              </div>
              <button className="btn-dark w-full mt-4" type="button">
                Generate Proof <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

        <section className="flow-section" id="flow">
          <div className="flow-inner">
            <div className="section-ey">Workflow</div>
            <h2 className="section-h2">From blank page to permanent proof.</h2>
            <p className="section-sub">
              The app keeps the writing experience quiet while the cryptographic workflow runs behind the scenes.
            </p>
            <div className="flow-steps">
              {[
                ["01", "Connect", "Use a Sui wallet as the author identity for the session."],
                ["02", "Write", "Draft in a focused editor built for long-form text."],
                ["03", "Auto-seal", "Every checkpoint is uploaded as a permanent Walrus blob."],
                ["04", "Prove", "MemWal recalls the chain and publishes a shareable proof page."],
              ].map(([num, title, desc], index) => (
                <article className={`flow-step ${index === 2 ? "active-step" : ""}`} key={title}>
                  <div className="fs-num">{num}</div>
                  <div className="fs-title">{title}</div>
                  <div className="fs-desc">{desc}</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="why-section" id="why">
          <div className="why-inner">
            <div>
              <div className="why-lbl">Why it cannot be faked</div>
              <h2 className="why-h2">The proof is the artifact, not a screenshot.</h2>
              <p className="why-p">
                Walrus blob IDs are content addresses, MemWal stores the ordered chain, and the final proof page is
                itself a permanent Walrus blob. A different draft produces a different address.
              </p>
            </div>
            <div className="why-points">
              {[
                ["Content addressed", "Blob IDs are derived from the stored content, so replacement changes the ID."],
                ["Ordered memory", "MemWal keeps the checkpoint chain in a session namespace the user cannot rewrite."],
                ["Wallet anchored", "The connected Sui wallet address binds the proof to an author identity."],
              ].map(([title, desc]) => (
                <div className="why-pt" key={title}>
                  <ShieldCheck color="var(--blue-mid)" />
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
          <div className="inline-brand">
            <span className="pulse-dot" />
            <strong className="font-display">Provenance</strong>
          </div>
          <div className="lf-links">
            <a href="https://docs.wal.app/docs/http-api/storing-blobs" target="_blank" rel="noreferrer">
              Walrus <ExternalLink size={12} />
            </a>
            <a href="https://github.com/MystenLabs/MemWal" target="_blank" rel="noreferrer">
              MemWal <ExternalLink size={12} />
            </a>
            <a href="https://sdk.mystenlabs.com/dapp-kit" target="_blank" rel="noreferrer">
              Sui dApp Kit <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
