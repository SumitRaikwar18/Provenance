# Provenance Demo Video Steps

Target length: 3 minutes or less.

## 0:00-0:20 - Hook

Show the landing page.

Script:
> AI writing tools are powerful, but they make authorship harder to prove. Provenance records the writing process itself, then publishes verifiable proof using Sui identity, Walrus storage, and MemWal memory.

## 0:20-0:40 - Solution Overview

Scroll briefly through the landing page sections that show the Sui, Walrus, MemWal, and AI-agent flow.

Script:
> A writer connects a Sui wallet, writes normally, and Provenance seals checkpoints to Walrus. MemWal keeps the long-term memory chain, and the AI agent can recall the full session context later.

## 0:40-1:10 - Wallet Connection

1. Click **Connect Wallet** on the landing page.
2. Choose the Sui wallet.
3. Approve the connection.
4. Show that the app redirects to the dashboard.
5. Briefly show the connected wallet address and Testnet status.

Script:
> The wallet is the public identity for the writing session. The app uses the current Mysten dApp Kit wallet stack.

## 1:10-1:45 - Write And Seal Checkpoint

1. Start a new session in the editor.
2. Paste or type a short draft paragraph.
3. Click the manual checkpoint or seal action.
4. Show the checkpoint log updating.
5. Open the Walrus blob link if the UI exposes it.

Script:
> Every checkpoint is hashed, stored as a permanent Walrus blob, and indexed into the MemWal namespace for this session.

## 1:45-2:10 - Agent Memory

1. Trigger the agent analysis panel.
2. Show themes, style notes, writing pace, or key ideas.
3. Mention that the agent recalls the checkpoint chain from MemWal and fetches the underlying artifacts from Walrus.

Script:
> This is the agentic workflow: memory is not trapped in the browser or a single model context. The agent can rebuild context from portable, verifiable data.

## 2:10-2:35 - Generate Proof

1. Click **Generate Proof**.
2. Wait for the proof URL.
3. Open the generated Walrus proof page.
4. Show the checkpoint count, wallet address, blob IDs, and integrity log.

Script:
> The proof page is itself a Walrus-hosted HTML artifact. Anyone can inspect the blob IDs and recompute SHA-256 hashes against the checkpoint contents.

## 2:35-2:50 - Share Session

1. Click the session share action if available.
2. Copy the share or proof URL.
3. Show that it is a public, portable artifact.

Script:
> A session can be shared without depending on our server database. Walrus stores the artifacts, and MemWal keeps the recoverable memory index.

## 2:50-3:00 - Closing

Script:
> Provenance turns writing from a final file into a verifiable process. The next step is signed wallet-message verification and Seal-based private drafts.

## Recording Checklist

- Use a clean browser profile.
- Keep the wallet funded on Sui Testnet before recording.
- Hide `.env.local`, terminal secrets, and personal browser tabs.
- Cut out loading time from Walrus or MemWal calls.
- Keep terminal/code footage under 15 seconds.
- End with the GitHub repo and live demo URL visible.
