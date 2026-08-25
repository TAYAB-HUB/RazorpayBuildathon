<div align="center">

# ⚡ REKON / Autonomous AI Finance Controller

**Autonomous 3-Way Financial Reconciliation, Settlement Control & Cash Intelligence Platform**

Built for the **Razorpay Buildathon 2026** · *AI Finance Controller Track*

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-razorpay--buildathon--gamma.vercel.app-0052FF?style=for-the-badge&logo=vercel)](https://razorpay-buildathon-gamma.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

## 📌 Executive Overview

**REKON** is an autonomous financial reconciliation engine designed to close the 3-way money loop across **Gateway Payments (captured orders)**, **Bank Settlement Feeds (messy raw bank files)**, and **Internal Books (invoices/accounting)**.

In modern fintech, transaction volume scales infinitely, but **verifying money movement remains a major operational bottleneck**. Human finance teams waste hundreds of hours manually matching messy spreadsheets, dealing with mangled UTR references, date drifts, and fee deductions.

REKON bridges this gap by combining an **8-pass deterministic arithmetic engine for money matching** with **Generative AI for natural language adjudication and conversational ledger intelligence**.

---

## 🎯 Architectural Philosophy: "Where AI Sits — And Where It Refuses To"

Money movement demands proof, auditability, and replayability. A machine learning model that is 99.9% accurate would still hallucinate or misplace funds on 60 out of 60,000 transactions.

| 🟢 Where REKON Uses AI | 🔴 Where REKON Refuses AI |
| :--- | :--- |
| **Exception Adjudication:** Generates precise 2-3 sentence operational notes for unresolved exceptions (colliding twins, split payments, chargebacks). | **Arithmetic & Matching:** ₹24,499 == ₹24,499 is deterministic math. Never guessed by a model. |
| **Conversational Ledger Q&A:** Re-phrases computed financial numbers into crisp operational answers. | **Fee Schedule Deductions:** Exact per-method gateway fee calculations (UPI, Card, Netbanking, Wallet). |
| **Natural Language Parsing:** Maps operator questions to deterministic ledger query intents. | **Reference Matching:** String edit distance (Trigram + Levenshtein) with explicit confidence scoring. |

---

## ⚙️ The 8-Pass Cascade Matching Engine

REKON processes raw financial records through an 8-pass cascade, prioritizing the strongest empirical evidence first:

| Pass | Rule Name | Description | Confidence |
| :---: | :--- | :--- | :---: |
| **P0** | `quarantine` | Isolates corrupt bank lines (null/negative amounts, unparseable dates) without crashing the pipeline. | `0.00` |
| **P1** | `exact_utr_gross` | Instant match on UTR trace number + exact gross transaction amount. | `0.99` |
| **P2** | `net_utr_fee` | Calculates method fee schedules (UPI 0.3%, Card 2.0%, Netbanking 1.9%, Wallet 1.5%) and matches net settlement. | `0.96` |
| **P3** | `utr_amount_tolerance` | UTR exact with bank posting noise (≤ ₹8). | `0.92` |
| **P4** | `fuzzy_ref_amount` | Recovers truncated or mangled references using Trigram similarity + Levenshtein edit distance, gated on amount. | `0.87` |
| **P5** | `split_pair` | Pairs single settlements arriving as two separate bank credit lines summing to net amount. | `0.82` |
| **P6** | `amount_date_unique` | Matches amount equality within a ±2-day window. Abstains on candidate ties to avoid guessing. | `0.75` |
| **P7** | `extended_window` | Extends matching window to T+6 for delayed bank settlements. | `0.65` |
| **P8** | `books` | Joins internal ERP invoices to gateway payments by Customer Name + Amount to close the 3-way loop. | `0.90` |

---

## 📊 Measured Accuracy & Hidden Ground Truth

Unlike traditional systems that rely on cherry-picked samples, REKON includes a **Synthetic Workload & Corruption Generator (`lib/synth.ts`)**. 

Every batch is generated with **hidden ground truth** and a **deterministic corruption deck** (mangled references, transposed amounts, date drifts, orphaned credits). After every run, REKON benchmarks itself against the ground truth and reports:
- **Precision, Recall & F1 Score** (Bank-side & Book-side)
- **Chaos Deck Coverage Matrix** (Every injected fault is either matched or explicitly excepted)
- **Wall-clock Latency & Throughput** (Records processed per second)

---

## 🛠️ Tech Stack & Architecture

- **Frontend & Framework:** Next.js 16 (App Router, React 19, Turbopack)
- **Styling & Animations:** Tailwind CSS v4, Framer Motion, Lucide React
- **Database & ORM:** PostgreSQL, Drizzle ORM, Drizzle Kit
- **AI & Natural Language Layer:** OpenAI / Gemini API (Optional fallback to deterministic heuristics)
- **Deployment & Hosting:** Vercel (Production deployment)

---

## 📂 Project Directory Structure

```text
ai-finance-controller-buildathon/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── batches/            # Ingest & synthetic workload generation API
│   │   │   │   └── [id]/
│   │   │   │       ├── records/    # Raw table records (Payments/Settlements/Invoices)
│   │   │   │       └── run/        # Execution route for 8-pass reconciliation engine
│   │   │   ├── exceptions/[id]/    # Human-in-the-loop exception override endpoint
│   │   │   ├── health/             # Health check endpoint
│   │   │   ├── qa/                 # Settlement Q&A conversational agent endpoint
│   │   │   └── runs/[id]/          # Detailed run metrics & audit log endpoint
│   │   ├── console/                # Interactive operational console UI & widgets
│   │   │   ├── page.tsx
│   │   │   └── widgets.tsx
│   │   ├── globals.css             # High-contrast dark financial UI theme
│   │   ├── layout.tsx              # Root app layout
│   │   └── page.tsx                # Product landing page & methodology breakdown
│   ├── db/
│   │   ├── index.ts                # Drizzle ORM PostgreSQL database client
│   │   └── schema.ts               # Complete database schema (Batches, Payments, Matches, etc.)
│   └── lib/
│       ├── ai.ts                   # LLM adjudication & natural language phrasing module
│       ├── clientTypes.ts          # Shared TypeScript interfaces
│       ├── engine.ts               # 8-Pass deterministic reconciliation core engine
│       ├── qa.ts                   # Deterministic intent parser for Q&A bot
│       ├── runDetail.ts            # Server-side run data assembler
│       ├── synth.ts                # Synthetic batch generator with ground truth
│       └── util.ts                 # Financial formatting, Levenshtein & RNG utilities
├── drizzle.config.ts               # Drizzle ORM database migration configuration
├── next.config.ts                  # Next.js configuration
├── package.json                    # Project dependencies & scripts
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # Project documentation
```

---

## 🚀 Local Setup & Installation

### Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** (Local instance or cloud URL from Neon/Supabase)

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/TAYAB-HUB/RazorpayBuildathon.git
   cd RazorpayBuildathon
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://postgres:root@127.0.0.1:5432/app_db"

   # Optional: OpenAI API Key for live AI adjudication & Q&A
   OPENAI_API_KEY="your-openai-api-key"
   ```

4. **Push Database Schema:**
   ```bash
   npx drizzle-kit push
   ```

5. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👤 Developer Profile

**Syed Mohammed Tayab**  
*Aspiring AI/ML Engineer & Full-Stack Developer*  
*B.Tech in Computer Science and Engineering — Presidency University, Bengaluru*

- 🚀 **Live Project Demo:** [https://razorpay-buildathon-gamma.vercel.app/](https://razorpay-buildathon-gamma.vercel.app/)
- 🐙 **GitHub:** [github.com/TAYAB-HUB](https://github.com/TAYAB-HUB)
- 💼 **LinkedIn:** [linkedin.com/in/syed-tayab01](https://www.linkedin.com/in/syed-tayab01)
- 📧 **Email:** [syedtayab01@gmail.com](mailto:syedtayab01@gmail.com)
- 📱 **Mobile:** [+91 7013775939](tel:+917013775939)
- 🧩 **LeetCode:** [leetcode.com/u/Tayabsyed](https://leetcode.com/u/Tayabsyed)
- 🏆 **HackerRank:** [hackerrank.com/profile/syedtayab01](https://hackerrank.com/profile/syedtayab01)

---

<div align="center">
  <sub>Built with precision for the Razorpay Buildathon 2026. Every rupee, accounted for.</sub>
</div>

