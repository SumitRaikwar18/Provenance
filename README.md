# 🔏 Provenance

<p align="center">
  <img src="https://img.shields.io/badge/Provenance-Your%20Writing%2C%20Cryptographically%20Proven-4DA2FF?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMiAxNWwtNS01IDEuNDEtMS40MUwxMCAxNC4xN2w3LjU5LTcuNTlMMTkgOGwtOSA5eiIvPjwvc3ZnPg==" alt="Provenance">
</p>

<p align="center">
  <strong>Your writing, cryptographically proven. 🖊️✨</strong><br/>
  <em>Built on Sui · Stored on Walrus · Remembered by MemWal</em>
</p>

<p align="center">
  <a href="https://sui.io"><img alt="Sui" src="https://img.shields.io/badge/Sui-Testnet-4DA2FF?style=for-the-badge&logo=sui&logoColor=white"></a>
  <a href="https://walrus.xyz"><img alt="Walrus" src="https://img.shields.io/badge/Walrus-Permanent%20Blobs-3B6FD4?style=for-the-badge&logoColor=white"></a>
  <a href="https://memwal.ai"><img alt="MemWal" src="https://img.shields.io/badge/MemWal-Agent%20Memory-1D8A5E?style=for-the-badge&logoColor=white"></a>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-14-1A1A2E?style=for-the-badge&logo=next.js&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge">
</p>

<p align="center">
  <a href="#-demo-flow">Demo</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-data-flow">Data Flow</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-api-reference">API</a> •
  <a href="#-verification">Verification</a>
</p>

---

## 🌟 What is Provenance?

**Provenance** is a full-stack Next.js application that gives writers, researchers, students, and builders a **verifiable, tamper-proof record** of how a document was created — from the first word to the final sentence.

> In a world where AI can generate text effortlessly, **the process is the proof**. Provenance seals your creative journey into permanent, cryptographically verifiable checkpoints anchored to your Sui wallet.

Built for the **🏆 Sui Overflow 2026 — Walrus Track**: durable memory, persistent artifacts, and portable context for long-running workflows.

---

## ✨ Key Features

| Feature | Description |
|--------|-------------|
| 🔑 **Sui Wallet Auth** | Writer identity anchored to a real on-chain address |
| 📝 **Focused Editor** | Distraction-free writing environment with live word count |
| ⏱️ **Auto-Seal Checkpoints** | Every draft milestone sealed as a permanent Walrus blob |
| 🧠 **MemWal Memory Chain** | Ordered checkpoint chain stored in session namespaces |
| 📄 **Shareable Proof Pages** | Permanent HTML artifacts published directly to Walrus |
| 🔗 **Session Manifests** | Public session JSON published to Walrus for sharing |
| 🔍 **Independent Verification** | Anyone can verify proofs using Walrus blob URLs + SHA-256 |
| 🌐 **Full SEO** | Sitemap, robots, Open Graph, Twitter Cards |

---

## 🎬 Demo Flow

```
1. Connect Sui Wallet     →  Identity anchored to your wallet address
2. Open Writing Dashboard →  Live word count & checkpoint ticker
3. Write                  →  Focused, distraction-free editor
4. Auto-Seal              →  Checkpoint every 15s (demo) or on demand
5. Share Session          →  Publish manifest to Walrus → public URL
6. Generate Proof         →  MemWal recalls chain → permanent proof page
7. Disconnect             →  Clean session end, return to landing
```

---

## 🏗️ Architecture

```mermaid
%%{init: {
  "theme": "base",
  "themeVariables": {
    "primaryColor": "#1e1b4b",
    "primaryTextColor": "#e0e7ff",
    "primaryBorderColor": "#6366f1",
    "lineColor": "#818cf8",
    "secondaryColor": "#0f172a",
    "tertiaryColor": "#0c4a6e",
    "background": "#0f172a",
    "fontFamily": "Inter, sans-serif",
    "fontSize": "14px",
    "edgeLabelBackground": "#1e1b4b",
    "clusterBkg": "#1e1b4b",
    "titleColor": "#a5b4fc"
  }
}}%%
flowchart TB
  subgraph CLIENT["🖥️  Client Layer"]
    direction LR
    User["👤 Writer / Researcher"]
    Landing["🏠 Landing Page"]
    Wallet["🔑 Sui Wallet Connect"]
    Dashboard["📊 Dashboard"]
    Editor["✍️ Focused Editor"]
  end

  subgraph API["⚙️  API Layer  (Next.js Route Handlers)"]
    direction LR
    CheckAPI["📌 POST /api/checkpoint"]
    ProofAPI["📄 POST /api/proof"]
    RecallAPI["🔍 GET /api/recall"]
    ShareAPI["🔗 POST /api/session-share"]
  end

  subgraph WALRUS["🌊  Walrus Testnet  (Permanent Decentralized Storage)"]
    direction LR
    WalrusCP["📦 Checkpoint Blob"]
    WalrusProof["🏅 Proof HTML Blob"]
    WalrusManifest["📋 Session Manifest Blob"]
  end

  subgraph MEMWAL["🧠  MemWal  (Agent Memory Layer)"]
    direction LR
    MemSession["🗂️ Session Namespace"]
    MemChain["🔗 Ordered Checkpoint Chain"]
  end

  subgraph OUTPUT["🌐  Public Outputs"]
    ProofURL["🔐 Proof Page URL"]
    ShareURL["📎 Session Share URL"]
  end

  User --> Landing
  Landing --> Wallet
  Wallet --> Dashboard
  Dashboard --> Editor
  Editor --> CheckAPI
  CheckAPI --> WalrusCP
  CheckAPI --> MemSession
  MemSession --> MemChain
  Dashboard --> ShareAPI
  ShareAPI --> WalrusManifest
  WalrusManifest --> ShareURL
  Dashboard --> ProofAPI
  ProofAPI --> RecallAPI
  RecallAPI --> MemChain
  ProofAPI --> WalrusCP
  ProofAPI --> WalrusProof
  WalrusProof --> ProofURL

  style CLIENT fill:#1e1b4b,stroke:#6366f1,color:#e0e7ff
  style API fill:#0c4a6e,stroke:#0ea5e9,color:#e0f2fe
  style WALRUS fill:#0d3b2e,stroke:#10b981,color:#d1fae5
  style MEMWAL fill:#2d1b4e,stroke:#a855f7,color:#ede9fe
  style OUTPUT fill:#1c1917,stroke:#f59e0b,color:#fef3c7
```

---

## 🌊 Data Flow

```mermaid
%%{init: {
  "theme": "base",
  "themeVariables": {
    "primaryColor": "#0f172a",
    "primaryTextColor": "#f1f5f9",
    "primaryBorderColor": "#38bdf8",
    "lineColor": "#22d3ee",
    "secondaryColor": "#164e63",
    "tertiaryColor": "#0d3b2e",
    "noteBkgColor": "#1e293b",
    "noteTextColor": "#94a3b8",
    "activationBorderColor": "#818cf8",
    "activationBkgColor": "#1e1b4b",
    "fontFamily": "Inter, sans-serif"
  }
}}%%
sequenceDiagram
  autonumber
  participant 👤 as User
  participant 🔑 as Sui Wallet
  participant 🖥️ as Next.js UI
  participant ⚙️ as API Routes
  participant 🌊 as Walrus
  participant 🧠 as MemWal

  👤->>🖥️: Open provenance.app
  👤->>🔑: Connect wallet
  🔑-->>🖥️: Wallet address (0x...)
  🖥️->>🖥️: Redirect → /dashboard

  Note over 👤,🧠: ✍️ Writing Session Begins

  loop Every 15s (demo) or on demand
    👤->>🖥️: Write draft content
    🖥️->>⚙️: POST /api/checkpoint {content, sessionId, walletAddress}
    ⚙️->>🌊: PUT /v1/blobs (permanent=true)
    🌊-->>⚙️: blobId (content-addressed)
    ⚙️->>🧠: remember(blobId, sessionNamespace)
    🧠-->>⚙️: Memory indexed ✅
    ⚙️-->>🖥️: {blobId, wordCount, checkpointIndex}
  end

  Note over 👤,🧠: 🏅 Proof Generation

  👤->>🖥️: Click "Generate Proof"
  🖥️->>⚙️: POST /api/proof {sessionId, walletAddress}
  ⚙️->>🧠: recall(sessionId, limit=100)
  🧠-->>⚙️: Ordered blob chain
  ⚙️->>🌊: Fetch all checkpoint blobs
  🌊-->>⚙️: Checkpoint JSON objects
  ⚙️->>⚙️: Build proof HTML with SHA-256 hashes
  ⚙️->>🌊: PUT proof HTML blob (permanent)
  🌊-->>⚙️: proofBlobId
  ⚙️-->>🖥️: proofUrl (permanent Walrus URL)
  🖥️-->>👤: 🎉 Shareable proof page ready!
```

---

## 📦 Artifact Model

```mermaid
%%{init: {
  "theme": "base",
  "themeVariables": {
    "primaryColor": "#18181b",
    "primaryTextColor": "#fafafa",
    "primaryBorderColor": "#8b5cf6",
    "lineColor": "#a78bfa",
    "secondaryColor": "#1d1d27",
    "tertiaryColor": "#0d3b2e",
    "clusterBkg": "#1e1b4b",
    "titleColor": "#c4b5fd",
    "fontFamily": "Inter, sans-serif"
  }
}}%%
graph TD
  W["🔑 Sui Wallet\n0x7a23...b9c1"]:::wallet

  subgraph SESSION["📁 Writing Session"]
    S["🆔 Session ID\n(nanoid)"]
    CP1["📝 Checkpoint 1\nJSON artifact"]
    CP2["📝 Checkpoint 2\nJSON artifact"]
    CPN["📝 Checkpoint N\nJSON artifact"]
  end

  subgraph WALRUS["🌊 Walrus Testnet"]
    B1["🔵 blobId-1\nSHA-256: abc..."]
    B2["🟢 blobId-2\nSHA-256: def..."]
    BN["🟣 blobId-N\nSHA-256: xyz..."]
    PB["🏅 Proof Blob\nHTML artifact"]
    MB["📋 Manifest Blob\nJSON artifact"]
  end

  subgraph MEMWAL["🧠 MemWal Memory"]
    NS["📂 provenance:{sessionId}\nnamespace"]
    CHAIN["🔗 Ordered Chain\n[cp0, cp1, ..., cpN]"]
  end

  subgraph PUBLIC["🌐 Public Outputs"]
    PU["🔐 /v1/blobs/proof-id\nShareable Proof Page"]
    SU["📎 /v1/blobs/manifest-id\nShareable Session URL"]
  end

  W --> S
  S --> CP1 --> B1
  S --> CP2 --> B2
  S --> CPN --> BN
  B1 --> NS
  B2 --> NS
  BN --> NS
  NS --> CHAIN
  CHAIN --> PB --> PU
  CHAIN --> MB --> SU

  classDef wallet fill:#1e1b4b,stroke:#818cf8,color:#c4b5fd
  classDef default fill:#0f172a,stroke:#334155,color:#94a3b8
  class W wallet
```

---

## 🔄 Component Interaction

```mermaid
%%{init: {
  "theme": "base",
  "themeVariables": {
    "primaryColor": "#0c0a09",
    "primaryTextColor": "#fafaf9",
    "primaryBorderColor": "#f97316",
    "lineColor": "#fb923c",
    "secondaryColor": "#1c1917",
    "fontFamily": "Inter, sans-serif"
  }
}}%%
graph LR
  subgraph PAGES["📄 Pages"]
    L["/ Landing"]
    D["/dashboard"]
    E["/editor"]
  end

  subgraph COMPONENTS["🧩 Components"]
    LP["LandingPage.tsx"]
    DC["Dashboard.tsx"]
    PR["Providers.tsx"]
    DCC["DashboardClient.tsx"]
    LC["LandingClient.tsx"]
  end

  subgraph LIBS["📚 Libraries"]
    WL["walrus.ts\nstoreBlob / fetchBlob"]
    ML["memwal.ts\nremember / recall"]
    PG["proof-generator.ts\nbuildProofEntries"]
    CL["checkpoint.ts\nhashContent"]
    CT["client-text.ts\nclientSide utils"]
  end

  subgraph APIS["🔌 API Routes"]
    AC["api/checkpoint/route.ts"]
    AP["api/proof/route.ts"]
    AR["api/recall/route.ts"]
    AS["api/session-share/route.ts"]
  end

  L --> LP --> LC --> PR
  D --> DC --> DCC --> PR
  E --> DC
  AC --> WL
  AC --> ML
  AP --> ML
  AP --> WL
  AP --> PG
  AR --> ML
  AS --> WL
  DC --> AC
  DC --> AP
  DC --> AS

  style PAGES fill:#1c1917,stroke:#f97316,color:#fff7ed
  style COMPONENTS fill:#0c4a6e,stroke:#0ea5e9,color:#e0f2fe
  style LIBS fill:#1a2e05,stroke:#84cc16,color:#f7fee7
  style APIS fill:#2d1b4e,stroke:#a855f7,color:#ede9fe
```

---

## 🔐 Security & Proof Integrity

```mermaid
%%{init: {
  "theme": "base",
  "themeVariables": {
    "primaryColor": "#0d1117",
    "primaryTextColor": "#e6edf3",
    "primaryBorderColor": "#21262d",
    "lineColor": "#30a14e",
    "secondaryColor": "#161b22",
    "fontFamily": "Inter, sans-serif"
  }
}}%%
flowchart LR
  Write["✍️ Writer composes\ncontent"] --> Hash["#️⃣ SHA-256\ncontent hash"]
  Hash --> Store["🌊 Walrus PUT\n(permanent=true)"]
  Store --> BlobID["🆔 blobId =\nf(content)"]
  BlobID --> MemStore["🧠 MemWal stores\nblobId in namespace"]
  MemStore --> Chain["🔗 Ordered,\ntamper-evident chain"]
  Chain --> ProofGen["⚙️ Proof generator\nrecalls + verifies"]
  ProofGen --> ProofHTML["📄 Proof HTML\n(self-contained)"]
  ProofHTML --> WalrusPublish["🌊 Walrus PUT\nproof page"]
  WalrusPublish --> URL["🌐 Permanent URL\n(content-addressed)"]

  URL --> Verify["🔍 Independent\nVerification"]
  Verify --> Step1["1. Fetch each\nblobId from Walrus"]
  Step1 --> Step2["2. SHA-256 hash\nthe content field"]
  Step2 --> Step3["3. Compare to\ndisplayed hash"]
  Step3 --> Result["✅ Proof verified\nor ❌ mismatch detected"]

  style Write fill:#0d3b2e,stroke:#10b981,color:#d1fae5
  style URL fill:#1e1b4b,stroke:#6366f1,color:#e0e7ff
  style Result fill:#1c1917,stroke:#f59e0b,color:#fef3c7
```

---

## ⚡ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| 🖥️ **Framework** | Next.js 14, React 18, TypeScript 5 | Full-stack app with API routes |
| 🎨 **Styling** | Tailwind CSS 3, custom CSS tokens | Responsive, dark-first design |
| 🔑 **Wallet** | `@mysten/dapp-kit-react`, `@mysten/dapp-kit-core` | Sui wallet integration |
| 🌊 **Storage** | Walrus HTTP API (`/v1/blobs`) | Permanent decentralized blob storage |
| 🧠 **Memory** | `@mysten-incubation/memwal` | Ordered agent memory for checkpoint chains |
| 🔐 **Hashing** | Web Crypto API (SHA-256) | Content-addressed proof integrity |
| 🆔 **IDs** | nanoid | Session and artifact identification |

---

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 18
- A Sui-compatible wallet (Sui Wallet, Slush, etc.)
- A [MemWal account](https://memwal.ai) with a delegate key

### 1. Clone & Install

```bash
git clone https://github.com/SumitRaikwar18/Provenance.git
cd Provenance
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# MemWal Agent Memory (server-side only — never exposed to browser)
MEMWAL_KEY=your_delegate_private_key_hex
MEMWAL_ACCOUNT_ID=0x_your_memwal_account_id
MEMWAL_SERVER_URL=https://relayer.memory.walrus.xyz

# Walrus Storage Endpoints
WALRUS_PUBLISHER=https://publisher.walrus-testnet.walrus.space
WALRUS_AGGREGATOR=https://aggregator.walrus-testnet.walrus.space

# Public (safe to expose)
NEXT_PUBLIC_WALRUS_AGGREGATOR=https://aggregator.walrus-testnet.walrus.space
NEXT_PUBLIC_APP_NAME=Provenance
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> ⚠️ **Security**: `.env.local` is in `.gitignore` — **never** commit `MEMWAL_KEY` or any private credentials.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Reference

### `POST /api/checkpoint`

Stores a writing checkpoint as a permanent Walrus blob and indexes it in MemWal.

**Request:**
```json
{
  "sessionId": "abc123",
  "walletAddress": "0x7a23...b9c1",
  "content": "Draft text content...",
  "checkpointIndex": 0
}
```

**Response:**
```json
{
  "blobId": "M4hsZGQ1oC...W7_4BUk",
  "wordCount": 42,
  "checkpointIndex": 0,
  "contentHash": "sha256:abc..."
}
```

---

### `GET /api/recall?sessionId=abc123`

Recalls ordered checkpoint references from MemWal for a given session namespace.

**Response:**
```json
[
  { "sessionId": "abc123", "checkpointIndex": 0, "blobId": "...", "wordCount": 42 },
  { "sessionId": "abc123", "checkpointIndex": 1, "blobId": "...", "wordCount": 89 }
]
```

---

### `POST /api/proof`

Generates a permanent proof page: recalls MemWal chain → fetches checkpoint blobs → builds SHA-256 verified HTML → publishes to Walrus.

**Request:**
```json
{
  "sessionId": "abc123",
  "walletAddress": "0x7a23...b9c1"
}
```

**Response:**
```json
{
  "proofUrl": "https://aggregator.walrus-testnet.walrus.space/v1/blobs/...",
  "proofBlobId": "x7P4mS9kQ...aL2vN"
}
```

---

### `POST /api/session-share`

Publishes a shareable JSON manifest for a writing session.

**Response:**
```json
{
  "shareUrl": "https://aggregator.walrus-testnet.walrus.space/v1/blobs/...",
  "manifestBlobId": "oehkoh0352...dNAlXg"
}
```

---

## ✅ Verification

Run type checks and build:

```bash
npm run type-check
npm run build
```

**Independently verify a proof:**

1. Open the proof URL in your browser
2. Copy any `blobId` from the proof
3. Fetch: `GET https://aggregator.walrus-testnet.walrus.space/v1/blobs/{blobId}`
4. SHA-256 hash the `content` field
5. Compare to the displayed hash — they must match

**Testnet smoke test completed:**
- ✅ Checkpoint blob stored on Walrus Testnet
- ✅ MemWal recalled ordered checkpoint chain
- ✅ Proof page published as permanent Walrus blob
- ✅ Session manifest published as permanent Walrus blob

---

## 🗂️ Project Structure

```
provenance/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── checkpoint/route.ts    # Store checkpoint → Walrus + MemWal
│   │   │   ├── proof/route.ts         # Generate proof page artifact
│   │   │   ├── recall/route.ts        # Recall MemWal checkpoint chain
│   │   │   └── session-share/route.ts # Publish session manifest
│   │   ├── dashboard/page.tsx         # Writing dashboard
│   │   ├── editor/page.tsx            # Focused writing editor
│   │   ├── layout.tsx                 # Root layout + full SEO metadata
│   │   ├── page.tsx                   # Landing page
│   │   ├── sitemap.ts                 # Dynamic XML sitemap
│   │   └── robots.ts                  # Robots.txt route
│   ├── components/
│   │   ├── Dashboard.tsx              # Main dashboard UI
│   │   ├── DashboardClient.tsx        # Client boundary wrapper
│   │   ├── LandingPage.tsx            # Landing page UI
│   │   ├── LandingClient.tsx          # Client boundary wrapper
│   │   └── Providers.tsx              # dApp Kit providers
│   ├── lib/
│   │   ├── walrus.ts                  # Walrus HTTP API (store/fetch/url)
│   │   ├── memwal.ts                  # MemWal client (remember/recall)
│   │   ├── proof-generator.ts         # Build + publish proof HTML
│   │   ├── checkpoint.ts              # SHA-256 content hashing
│   │   └── client-text.ts            # Client-side text utilities
│   └── types/
│       └── index.ts                   # TypeScript interfaces
├── .env.example                       # Environment variable template
├── .gitignore                         # Ignores .env.local, node_modules, etc.
├── next.config.js                     # Next.js configuration
├── package.json                       # Dependencies
├── tailwind.config.ts                 # Tailwind configuration
└── tsconfig.json                      # TypeScript configuration
```

---

## 🏆 Sui Overflow 2026 — Walrus Track

| Requirement | Provenance Implementation |
|-------------|--------------------------|
| 🧠 **Long-term memory** | MemWal stores checkpoint references in `provenance:{sessionId}` namespaces |
| 💾 **Persistent data** | Walrus stores checkpoint JSON, proof HTML, and session manifests (`permanent=true`) |
| ⏳ **Long-running workflows** | Sessions accumulate state over time and can resume across visits |
| 📄 **Artifact-driven workflows** | Proof pages and session manifests are durable, shareable Walrus artifacts |
| 🔗 **Portable context** | Walrus URLs open outside the app and are shareable with reviewers |
| 👨‍💻 **Developer adoption** | Reusable pattern for building Walrus + MemWal powered applications |

---

## 🔮 Future Roadmap

- [ ] **Seal Privacy** — Encrypted draft checkpoints using `@mysten/seal`
- [ ] **Team Sessions** — Multi-author writing with shared MemWal namespaces
- [ ] **Agent-Readable Memory** — Writing history queryable by AI agents via MemWal
- [ ] **Walrus Sites Deployment** — Deploy the app itself to Walrus Sites
- [ ] **Proof Comparison** — Side-by-side diff view between checkpoints
- [ ] **Export Formats** — PDF, EPUB export with embedded Walrus proof hashes

---

## 🔒 Security Checklist

- ✅ `.env.local` is in `.gitignore` — private keys never committed
- ✅ `MEMWAL_KEY` is server-side only — never sent to the browser
- ✅ `NEXT_PUBLIC_*` variables are intentionally public (URLs only)
- ✅ No API keys in source code
- ✅ Content hash verification prevents blob tampering
- ✅ Wallet address binding prevents session hijacking

---

## 📜 License

MIT © 2026 [Sumit Raikwar](https://github.com/SumitRaikwar18) — Built for Sui Overflow 2026

---

<p align="center">
  <strong>Built with 🌊 Walrus · 🧠 MemWal · ⚡ Sui</strong><br/>
  <em>Provenance — where creativity meets cryptographic proof.</em>
</p>
