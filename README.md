# 🏏 CricSim — Advanced Cricket Match Simulator

An interactive, high-fidelity cricket simulator built with React and Vite. It features premium glassmorphism dark-mode aesthetics, real-time ball-by-ball commentary, and advanced match engines integrating realistic match factors.

## 🚀 Features

- **🏏 Ball Condition Engine**: Dynamically calculates ball wear and tear (New → Semi-New → Old → Very Old), influencing pace swing (1.4x), seam movement, bounce, and spin turn (1.6x). Enables **reverse swing** after 50+ balls.
- **⚡ Powerplay & Phase Rules**: Format-aware scoring/wicket multipliers (T20, ODI, Test sessions) with bowler-type powerplay adjustments (pacers are more expensive; spinners contain).
- **🏟️ 14 Real Stadium Profiles**: Preconfigured pitches from India, Australia, England, South Africa, West Indies, and UAE with custom runs, wickets, spin/pace multipliers, boundary dimensions, elevation carry, and evening **dew factors**.
- **👑 Captainship AI**: Win-rate-based aggressive/defensive coefficients, tactical bowler selection bonuses, and wicket probability boosts (+12% for elite captains) from field placement IQ.
- **🎯 Batting Roles & Tactics**: Players dynamically adapt roles (Aggressive, Moderate, Defensive) based on runs-per-ball pressure, wickets lost, chasing rates, and the previous batsman's performance.
- **📊 6 Teams with Real Rosters**: Fully configured player arrays for India, Australia, England, South Africa, Pakistan, and New Zealand.
- **💬 Dynamic Commentary**: High-variety contextual ball descriptions that change based on ball condition, bowler type, and batting modes.
- **📅 Dynamic Play Modes**:
  - **Ball-by-Ball Mode**: Deliveries are simulation-paced (1.2s default, adjustable).
  - **Over-by-Over Mode**: Progresses over-by-over.
  - **Wicket-by-Wicket Mode**: Skips directly to key dismissal events.
  - **Context Step Button**: Interactively click `Next (Ball/Over/Wicket)` when paused.

---

## 📈 Real-Time Stats Sync (ESPNCricinfo API)

To sync actual player statistics directly from ESPNCricinfo in real-time, you can use the integrated R data-fetching script.

### Prerequisites

You need **R** installed on your system. The script will automatically install any missing R packages (`cricketdata`, `jsonlite`, `dplyr`).

### Running the Sync

Simply run the following command in your terminal from the project root directory:

```bash
Rscript sync_stats.R
```

This script will:
1. Connect to ESPNCricinfo APIs via the `cricketdata` package.
2. Fetch the latest Test, ODI, and T20 career batting and bowling tables for all 6 countries.
3. Clean and map names (e.g. matching "Virat Kohli" to "V Kohli") using a smart initials & last name matching algorithm.
4. Update `src/engine/teams_stats.json`.

The React app will instantly pick up the updated JSON and apply the synced live stats (averages, strike rates, economies) to the match simulator at runtime!

---

## 🛠️ Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Server
```bash
npm run dev
```
Open **http://localhost:5173/** in your browser.

### 3. Build for Production
```bash
npm run build
```
