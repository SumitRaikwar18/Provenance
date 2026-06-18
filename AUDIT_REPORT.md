# Provenance Hackathon Audit Report

Audit date: June 18, 2026

## Executive Summary

Provenance is a functioning Sui Overflow Walrus Track project with real Walrus storage, real MemWal recall, shareable artifacts, a Sui wallet UX, and an AI writing-analysis workflow. The core technical narrative is strong: a long-running writing process becomes durable agent memory and independently inspectable artifacts.

The project is credible for shortlisting, but it should not claim that authorship is cryptographically bound to a wallet until API requests include a verified wallet signature. Draft privacy and public API abuse controls are the other major gaps before production or a top-prize claim.

## Verified Evidence

- TypeScript check passes.
- Next.js production build passes.
- Landing page renders without browser console errors.
- `/api/health` reports configured MemWal and optional OpenAI credentials.
- Real Walrus checkpoint upload succeeded.
- Real MemWal recall returned the checkpoint.
- Real agent analysis succeeded using recalled Walrus content.
- Real session-share manifest upload succeeded.
- Real proof-page upload succeeded after proof-generation fixes.
- `.env.local`, `.next`, and `node_modules` are ignored by git.
- Tracked-file scans found no real MemWal or OpenAI secret values.

## Track Alignment

| Requirement | Evidence | Rating |
| --- | --- | --- |
| Long-term agent memory | MemWal session namespaces store checkpoint and analysis memories | Strong |
| Persistent data/files | Checkpoints, proof HTML, and manifests are Walrus blobs | Strong |
| Long-running workflow | Writing sessions accumulate ordered checkpoints over time | Strong |
| Artifact-driven workflow | Proof pages and session manifests are reusable artifacts | Strong |
| Cross-tool portability | Aggregator URLs work outside the application | Strong |
| Multi-agent coordination | One analysis agent exists; no genuine multi-agent coordination yet | Partial |
| Meaningful Sui use | Wallet UX provides identity context, but server-side signature verification is absent | Partial |

## Findings

### P1: Wallet ownership is not verified by the server

Checkpoint, proof, share, and agent APIs accept `walletAddress` from JSON. A direct caller can submit another address. The connected-wallet UI is real, but the server cannot currently prove that the caller controls that wallet.

Required fix: sign a nonce or canonical session payload with `signPersonalMessage`, send signature plus bytes to the API, and verify it server-side before storing or generating artifacts.

### P1: Draft checkpoints are public

Full draft content is uploaded to public Walrus Testnet blobs. Users may reasonably assume drafts are private before proof publication.

Required fix: add a clear public-data warning immediately, then implement Seal encryption for checkpoint content. Keep only intentionally public proof excerpts unencrypted.

### P1: Public APIs have no authentication, rate limits, or quotas

An attacker can consume Walrus publisher capacity, MemWal operations, and OpenAI credits through the API routes.

Required fix: wallet-signature authorization, per-wallet/IP rate limits, body-size limits, checkpoint frequency controls, and usage telemetry.

### P2: MemWal recall is used as an ordered database query

Semantic recall may not guarantee exhaustive retrieval or stable ordering under larger histories. Sorting returned checkpoint indexes helps but cannot recover omitted memories.

Recommended fix: store a canonical manifest/head pointer in addition to semantic memories, or use deterministic metadata retrieval when the SDK supports it.

### P2: Session continuity is browser-local

Session cards and proof indexes are stored in `localStorage`, so another device cannot discover a wallet's sessions automatically.

Recommended fix: publish and update a wallet-level index artifact, then store its pointer in a deterministic Sui object or authenticated MemWal namespace.

### P2: Framework advisories remain

Next.js was upgraded from 14.2.5 to 14.2.35, removing the critical advisory. `npm audit --omit=dev` still reports one high and one moderate production vulnerability whose automated fix requires a major Next upgrade.

Recommended fix: test migration to a currently supported Next.js release before public production deployment.

### P3: Multi-agent story is limited

The writing analysis agent is useful, but the project currently demonstrates one agent rather than coordination between specialized agents.

Recommended enhancement: add separate research, integrity, and editorial agents that share the same MemWal session namespace and produce distinct Walrus artifacts.

## Fixes Applied During Audit

- Updated the landing page to match the supplied design and added explicit Walrus Track workflow content.
- Improved responsive behavior for navigation, flow cards, track cards, footer, and mobile CTAs.
- Fixed proof API responses to return portable Walrus aggregator URLs.
- Added safe JSON serialization for draft excerpts embedded in proof-page scripts.
- Removed simulated-success verification fallbacks; network failures now fail closed.
- Added `waitForRememberJob` for agent analysis memories.
- Upgraded Next.js and `eslint-config-next` to 14.2.35.
- Confirmed sitemap, robots, metadata, keywords, and Open Graph configuration.

## Judging Score Estimate

| Category | Weight | Current estimate |
| --- | ---: | ---: |
| Product and UX | 20 | 16 |
| Real-world application | 50 | 38 |
| Technical implementation | 20 | 15 |
| Presentation and vision | 10 | 8 |
| Total | 100 | 77 |

## Winning Chances

- Shortlisting: moderate to strong if the live demo is stable and the problem story is concise.
- Honorable mention or lower prize: plausible with wallet-signature verification and a polished five-minute demo.
- Top prize: currently unlikely because authorship is not server-verified, drafts are public, APIs are unprotected, and the multi-agent story is limited.

This estimate is directional, not a probability guarantee. Competition quality and judge priorities are unknown.

## Highest-Impact Submission Priorities

1. Add wallet-signed session authorization and verify signatures server-side.
2. Add an explicit public-draft warning or Seal encryption.
3. Add API rate limiting and request-size limits.
4. Record a five-minute demo showing a real checkpoint, MemWal recall, agent analysis, proof generation, and independent verification.
5. Present Provenance as reusable agent memory infrastructure for creative workflows, not only as a writing editor.
