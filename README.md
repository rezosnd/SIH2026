# HoneyChain 🍯

HoneyChain is a blockchain-based honey traceability and smart beekeeping management platform designed to guarantee product authenticity, ensure supply-chain transparency, and provide powerful rural beekeeper management.

## 🏗 Architecture
The platform is built on a modern micro-services-ready architecture:
- **Beekeeper Mobile App**: React Native / Expo
- **Consumer Web & Admin Dashboard**: Next.js (App Router), Tailwind CSS
- **Backend API**: NestJS, TypeScript, Prisma ORM
- **Database**: Neon PostgreSQL
- **Blockchain Trust Layer**: Solidity, Hardhat, Ethers.js, EVM Testnet (Polygon Amoy)
- **Authentication**: Google OAuth/OIDC + JWT

## 🚀 Key Features
- **Deterministic QR Anti-Counterfeit Engine**: Analyzes scan locations and frequency to detect unusual activity (e.g. unrealistic geographic movement).
- **Digital Honey Passport**: Public consumer verification of honey batches with unalterable blockchain proofs.
- **Role-Based Access Control**: Strict segregation for `BEEKEEPER`, `PROCESSOR`, `ADMIN`, and `KVIC`.
- **Automated Blockchain Integration**: Every Honey Batch created automatically registers its hash on the blockchain.

---

## 🛠 Project Setup

### 1. Environment Variables
Copy `.env.example` to `.env` in the root folder (and inside respective backend/web folders if they use specific loaded environments).
```bash
cp .env.example .env
```
Ensure you provide a real **Neon PostgreSQL** database URL and your **Google OAuth Credentials**.

### 2. Database Setup (Neon + Prisma)
The backend uses Prisma as the ORM to communicate with Neon PostgreSQL.

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
```

**Seed the Database**
To create the test cluster, Admin, KVIC user, and Beekeeper profiles:
```bash
npx ts-node prisma/seed.ts
```

*Test Credentials Created:*
- Admin: `admin@honeychain.gov.in`
- KVIC: `kvic@honeychain.gov.in`
- Beekeeper: `beekeeper@honeychain.local`
- *Password for all:* `password123`

### 3. Smart Contract / Blockchain Setup
The blockchain layer stores the cryptographic proofs of traceability events.
```bash
cd contracts
npm install
npx hardhat compile

# Run a local blockchain node for development
npx hardhat node

# Deploy the contract (in a separate terminal)
npx hardhat run scripts/deploy.js --network localhost
```
Update your `.env` with the deployed contract address.

### 4. Running the Backend (NestJS)
```bash
cd backend
npm run build
npm run start:dev
```
*API runs on `http://localhost:3000`*

### 5. Running the Web Application (Next.js)
The web application hosts both the Admin Dashboard and the public Consumer Verification portal.
```bash
cd web
npm install
npm run dev
```
*Web runs on `http://localhost:3001`*

### 6. Running the Mobile Application (React Native / Expo)
The mobile app is for the Beekeepers on the field.
```bash
cd mobile
npm install
npm start
```
*Scan the QR code with the Expo Go app on your phone.*

---

## 🔐 Security & Anti-Counterfeiting
HoneyChain does NOT rely on machine learning for counterfeit detection in this phase. It uses a **Deterministic Risk Engine**:
- **Location Anomaly**: If a single QR code is scanned in two geographically distant locations (e.g. Bhubaneswar and Delhi) in an unrealistic timeframe (e.g. 8 minutes), it flags the QR as `SUSPICIOUS`.
- **Scan Frequency**: If a single QR code is scanned >10 times in 5 minutes, it flags as `SUSPICIOUS`.
These alerts are pushed to the **Admin QR Security Center** for investigation.

## 🔮 Future Architecture (Phase 2)
The backend architecture contains clean extension points for future additions without requiring rewrites:
- **IoT Smart Hives**: Architecture is ready for MQTT ingestion via NestJS from ESP32/DHT22 sensors.
- **Machine Learning**: Yield prediction and bee disease classification models via a separate Python/FastAPI microservice which will feed insights into the current NestJS application.

---
**Designed with a strict, professional black/white/neutral visual language for enterprise agricultural supply chains.**
