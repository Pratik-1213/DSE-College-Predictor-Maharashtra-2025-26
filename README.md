# DSE College Predictor Maharashtra 2025-26

[![React](https://img.shields.io/badge/React-19-blue.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF.svg?logo=vite)](https://vite.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A free, fully client-side web tool for Diploma Engineering students appearing in **Direct Second Year (DSE)** admissions in Maharashtra. Enter your score, category, and preferences — get ranked college recommendations, a ready-to-use CAP option form order, college cutoff explorer, and a downloadable PDF strategy report. All powered by official CAP Round I cutoff data from 2024-25. No login, no backend, no ads.

---

## Features

### Admission Predictor
- Matches your diploma percentage against 2,010 CAP Round I cutoff records
- Supports all reservation categories: OPEN, OBC, SEBC, EWS, SC, ST, NT-A, NT-B, NT-C, NT-D, TFWS — and separate Lady (female) seat cutoffs
- Filters by region, college type (Government / Aided / Un-Aided / Autonomous), and branch group
- Probability score assigned to every result: Safe · High Chance · Moderate · Low Chance · Dream

### Results Dashboard
- Sort by prestige (highest cutoff), probability, government-first, or autonomous-first
- Filter by region, chance status, and minimum probability slider
- Compare up to 3 colleges side-by-side

### CAP Option Form Strategy
Correct ordering for Maharashtra CAP (which freezes you at the first allotment):
1. **Dream** — try for the best seat first
2. **Aspirational** (Low Chance) — ambitious but worth trying
3. **Realistic** (Moderate Chance)
4. **Good Chance** (High Chance)
5. **Safe Backup** — guaranteed fallback at the bottom

### College & Cutoff Explorer
- Search any college by name, branch, or choice code
- Filter by region and college type
- Expand any college to see a full cutoff table — percentile + rank for every available category

### PDF Report
Two-page downloadable report: candidate info, top-10 recommended colleges, CAP form order, comparison matrix, and strategy tips.

### Analytics
- Probability distribution chart (Safe / High / Moderate / Low / Dream counts)
- Region-wise and branch-wise opportunity breakdown

---

## Tech Stack

| Layer | Library / Tool |
|---|---|
| UI Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| PDF | jsPDF 4 + jsPDF-AutoTable 5 |
| Animations | Framer Motion |

---

## Project Structure

```
src/
├── components/
│   ├── Header.tsx             # Navigation bar
│   ├── HeroSection.tsx        # Landing page
│   ├── PredictionForm.tsx     # Multi-step student input form
│   ├── LoadingScreen.tsx      # Animated loading screen
│   ├── ResultsDashboard.tsx   # Results with filters and college cards
│   ├── CapStrategy.tsx        # CAP option form order
│   ├── ComparisonSection.tsx  # Side-by-side college comparison
│   ├── ChartsSection.tsx      # Probability + analytics charts
│   └── CollegeSearch.tsx      # College & cutoff explorer
├── utils/
│   ├── predictionEngine.ts    # Matching + probability engine + CAP strategy
│   └── PdfGenerator.ts        # PDF report layout
├── data/
│   └── cutoff_data.json       # CAP Round I 2024-25 dataset (2,010 records)
├── types.ts                   # TypeScript interfaces
├── App.tsx                    # Root component + view routing
└── index.css                  # CSS variables + Tailwind base
```

---

## Admission Probability Logic

| Gap (Your % − Cutoff %) | Status | Probability |
|---|---|---|
| ≥ +0.5% | Safe | 90 – 99% |
| 0% to +0.5% | High Chance | 75 – 89% |
| −1.0% to 0% | Moderate Chance | 50 – 74% |
| −2.5% to −1.0% | Low Chance | 25 – 49% |
| < −2.5% | Dream | 5 – 24% |

Category key lookup order: category-specific key first (e.g. `GOBC`), then lady seat variant if female (e.g. `LOBC`), then fallback to `GOPEN` / `LOPEN`.

---

## Local Development

**Prerequisites:** Node.js 18+

```bash
git clone https://github.com/your-username/dse-predictor.git
cd dse-predictor
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
```

---

## Deploy to Vercel

### Option A — Vercel Dashboard (recommended)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import the GitHub repository
4. Vercel auto-detects Vite — no config needed:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click **Deploy** — live in ~60 seconds

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel          # follow prompts, auto-detects Vite
```

No environment variables required. The app is fully static — no server, no database.

---

## Cutoff Data Format

```json
{
  "collegeName": "COEP Technological University",
  "choiceCode": "1600624210",
  "region": "Pune",
  "type": "Government",
  "autonomous": true,
  "branch": "Computer Science and Engineering",
  "cutoffs": {
    "GOPEN": { "rank": 142,  "percentile": 97.93 },
    "GOBC":  { "rank": 1282, "percentile": 97.06 },
    "LOPEN": { "rank": null, "percentile": null }
  }
}
```

Key format: `G` = General merit, `L` = Lady (female) seat, suffix = category code. Null entries mean no seat was filled in that category in 2024-25.

---

## Disclaimer

Predictions are based on CAP Round I cutoffs from **2024-25**. Actual cutoffs for 2025-26 may vary. Use this tool for planning only — always verify with the official **Maharashtra State CET Cell** handbook.

---

## License

MIT — free to use, fork, and build upon.

