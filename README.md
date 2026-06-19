# 🎓 DSE College Predictor Maharashtra

[![React](https://img.shields.io/badge/React-19-blue.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF.svg?logo=vite)](https://vite.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An advanced, fully client-side interactive web application designed for Diploma Engineering students seeking **Direct Second Year (DSE) Engineering Admissions** in Maharashtra. It parses and analyzes previous CAP Round 1 cutoff data to accurately predict admission possibilities, build strategic option forms, and generate detailed PDF reports.

---

## 🚀 Key Features

### 1. **High-Fidelity Admission Predictor**
* **Accurate Data Matching:** Searches a local database of **2,000+ course cutoffs** extracted from official DTE Maharashtra CAP Round 1 cutoff sheets.
* **Smart Probability Scoring:** Uses a custom bracket engine that accounts for positive/negative score differences to assign categories: **Safe**, **High Chance**, **Moderate Chance**, **Low Chance**, or **Dream**.
* **DTE Code Parsing:** Automatically accommodates 4-digit and 5-digit DTE college codes (e.g., COEP's code `16006`).

### 2. **Interactive Results & Advanced Filtering**
* **Prestige-First Sorting:** Defaults to **Highest Cutoff (Prestige)** so candidates see top-tier options matching their caliber. Also supports **Government First**, **Autonomous First**, and **Highest Probability** sorting.
* **Granular Filters:** Filter matches instantly by College Type (Government, Aided, Private), Autonomous Status, Region (Pune, Mumbai, Nagpur, etc.), Choice Category (OBC, SC, ST, EWS, Open), and minimum admission probability.

### 3. **🏆 Best Match Highlight Card**
* Automatically calculates and displays the single **best recommended college** (the most prestigious, highest-cutoff college in Pune/Maharashtra that is within the candidate's qualification bracket).

### 4. **College Comparison Matrix**
* Compare up to **3 colleges side-by-side** on choice codes, branch details, college management types, regions, previous cutoffs, and candidate's matching probability.
* Responsive card stack layout on mobile devices.

### 5. **Strategic CAP Option Form Generator**
* Simulates the official CAP option form process by dividing recommended colleges into optimal sequence brackets:
  * 🌟 **Dream Choices (Top 20%)**: Ambitious targets slightly above candidate score.
  * ⚖️ **Realistic Matches (Middle 50%)**: Solid matches matching the candidate's score.
  * 🛡️ **Safe Backups (Bottom 30%)**: Guaranteed backups to secure admission.

### 6. **Custom SVG Charts Dashboard**
* **Chance Distribution:** Radial donut chart showcasing count of Safe vs. Moderate vs. Dream matches.
* **Opportunity Bars:** Visual breakdown of branch-wise and region-wise matching options.

### 7. **Print-Ready PDF Exporter**
* Instantly generate and download a professional, beautifully styled **PDF Admission Report** containing candidate profiles, matched colleges, comparison matrix, and the recommended CAP option form list.

---

## 🛠️ Tech Stack & Libraries

* **Framework:** React 19 + TypeScript (TSX)
* **Build Tool:** Vite (Ultra-fast Hot Module Replacement)
* **Styling:** Tailwind CSS v4 (Harmonious colors, responsive flexgrids, and modern glassmorphic overlays)
* **Icons:** Lucide React
* **PDF Exporter:** jsPDF & jsPDF-AutoTable (Client-side vector table compilation)
* **Animations & Micro-interactions:** Canvas Confetti

---

## 📁 Project Structure

```bash
dse-college-predictor/
├── public/                  # Static assets
├── src/
│   ├── components/
│   │   ├── CapStrategy.tsx        # CAP Form sequencing logic & visual list
│   │   ├── ChartsSection.tsx      # SVG-based opportunity bar & donut charts
│   │   ├── ComparisonSection.tsx  # Side-by-side college comparison card table
│   │   ├── Header.tsx             # Navbar, light/dark theme toggle, subheadings
│   │   ├── HeroSection.tsx        # Visual landing page hero
│   │   ├── LoadingScreen.tsx      # Micro-interaction loading animations
│   │   ├── PredictionForm.tsx     # Multi-step onboarding student profile intake
│   │   └── ResultsDashboard.tsx   # Dashboard with filters, search, & result cards
│   ├── data/
│   │   └── cutoff_data.json       # Parsed CAP cutoff dataset (2,044 courses)
│   ├── utils/
│   │   ├── PdfGenerator.ts        # jsPDF layout renderer with custom styles
│   │   └── predictionEngine.ts    # Logic for admission probabilities and stats
│   ├── types.ts                   # Unified TypeScript Interfaces
│   ├── App.tsx                    # Core app states & theme controller
│   ├── App.css                    # Component specific styling overrides
│   ├── index.css                  # Core CSS variables & Tailwind directives
│   └── main.tsx                   # Render entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚦 Admission Logic Brackets

Admission probability calculations are processed dynamically based on the difference between the **Student's Diploma Percentage** and the **Category Cutoff Value**:

$$\text{Difference} = \text{Student Percent} - \text{Cutoff Percent}$$

| Score Difference | Chance Status | Probability Range | Action |
|---|---|---|---|
| $\ge +0.5\%$ | **Safe** | $90\% - 99\%$ | Safe Backup Seat |
| $0.0\%$ to $+0.49\%$ | **High Chance** | $75\% - 89\%$ | Ideal Target |
| $-1.0\%$ to $-0.01\%$ | **Moderate Chance** | $50\% - 74\%$ | Competitive Try |
| $-2.5\%$ to $-1.01\%$ | **Low Chance** | $25\% - 49\%$ | Ambitious Try |
| $< -2.5\%$ | **Dream** | $5\% - 24\%$ | Dream Option |

---

## 💻 Local Setup & Development

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18 or higher is recommended).

### 2. Installation
Clone the repository and install the dependencies:
```bash
# Clone the repository
git clone https://github.com/your-username/dse-college-predictor.git

# Navigate to project folder
cd dse-college-predictor

# Install dependencies
npm install
```

### 3. Running Dev Server
Launch Vite dev server:
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 4. Build for Production
To bundle and optimize the application for static hosting (GitHub Pages, Vercel, Netlify):
```bash
npm run build
```
The production bundle will be created inside the `dist` directory.

---

## 📜 License
This project is licensed under the MIT License. Feel free to use and customize it.
