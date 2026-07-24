# D-voX — Decentralized Voting Platform

Overview
-
This repository contains a decentralized voting system implemented with Solidity (Foundry toolchain), a Node.js backend, a React web frontend, and a React Native mobile app. It includes smart contracts for voter registry, election management, privacy, consensus, and audit utilities, plus scripts and tests to build, deploy, and run the system locally.

Repository layout (important paths)
- Contracts: [src/](src/) — `ElectionManager`, `VoterRegistry`, `Privacy`, `Consensus`, `Audit`, and supporting contracts.
- Tests: [test/](test/) — unit and integration tests written for Foundry.
- Scripts & deploy: [script/](script/) and [broadcast/](broadcast/) — Foundry scripts and previous broadcast runs.
- Backend: [server/](server/) — Express server, Prisma config, migrations and seed scripts.
- Web: [web/](web/) — React frontend using Tailwind/PostCSS.
- Mobile: [apps/mobile/](apps/mobile) — React Native / Expo entrypoints for mobile app.

Key files
- `src/ElectionManager.sol` — core election flow and state machine.
- `src/VoterRegistry.sol` — manages voter registration and eligibility.
- `src/Privacy.sol` — privacy utilities used by the election system.
- `src/Consensus.sol` — consensus-related helpers and validators.
- `src/Audit.sol` — audit trail and checks.
- `server/index.js` — backend HTTP API and services.
- `server/prisma/schema.prisma` — database schema for backend data.

Prerequisites
- Node.js (>=16) and npm/yarn
- Foundry (forge, anvil, cast) — see https://book.getfoundry.sh/
- (Optional) Expo / React Native toolchain for mobile

Quick start (local development)

1) Run a local Ethereum node (Anvil)

```bash
anvil --chain-id 31337
```

2) Build & test contracts

```bash
forge build
forge test
```

3) Deploy contracts locally (example)

```bash
forge script script/DeployAll.s.sol:DeployAll --rpc-url http://127.0.0.1:8545 --private-key <PRIVATE_KEY> --broadcast
```

Previously recorded local deploys are available under [broadcast/DeployAll.s.sol/31337/](broadcast/DeployAll.s.sol/31337/) — e.g. run file `run-1761232520764.json` contains deployed addresses.

4) Backend

```bash
cd server
npm install
# set environment variables (DATABASE_URL, PORT, etc.)
node migrate.js   # run migrations (if using a DB service)
node seed.js      # optional initial data
npm run dev       # start dev server
```

5) Web frontend

```bash
cd web
npm install
npm run start
```

6) Mobile app

```bash
cd apps/mobile
npm install
# if using Expo:
npx expo start
```

Testing & formatting
- Contracts: `forge test`, `forge fmt`, `forge snapshot` for gas snapshots.
- Backend/web: standard `npm test` / `npm run lint` where configured.

Notes & troubleshooting
- Backend uses Prisma — ensure `DATABASE_URL` is set before running migrations or the server.
- If `npm run dev` fails in `server/`, check `server/package.json` scripts and inspect logs for missing env variables or DB connectivity.
- Foundry/Anvil runs on `chainId` 31337 in examples; confirm RPC URL and private key when broadcasting scripts.

Useful commands summary

```bash
# Contracts
forge build
forge test
forge fmt

# Run local node
anvil --chain-id 31337

# Backend
cd server
npm install
npm run dev

# Web
cd web
npm install
npm run start

# Mobile (Expo)
cd apps/mobile
npx expo start
```

Contributing
- Fork, create a branch, add tests for new features/fixes, run `forge test`, and submit a PR. Include changes to backend and frontend as separate commits where possible.

Where to look next
- Start with `src/ElectionManager.sol` to understand election flows.
- Review `server/index.js` for API endpoints and how the backend integrates with contracts.
- Use the broadcast run files in `broadcast/` to inspect example deployed addresses and transaction receipts.

If you want, I can now:
- run `forge test` and report results; or
- run the backend dev server and resolve the `npm run dev` error you previously saw; or
- walk through `src/ElectionManager.sol` and produce an annotated summary.

--
Generated README by the project maintainer assistant.
