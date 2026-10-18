# 🚀 Space Shooter Odyssey

A full-stack browser-based arcade space shooter game built for the **VELoop Rewards** platform.

![Space Shooter Odyssey](https://img.shields.io/badge/Status-In%20Development-blue) ![License](https://img.shields.io/badge/License-MIT-green)

## 🎮 Overview

**Space Shooter Odyssey** is a genuinely playable arcade space shooter with:

- **Phaser 3** game engine for real-time gameplay
- **50 missions** across 5 sectors with escalating difficulty
- **5 ship classes** (Interceptor, Guardian, Destroyer, Phantom, Nova) with unique abilities
- **5 boss encounters** with distinct attack patterns
- **8 power-up types** (Shield, Rapid Fire, Homing Missiles, EMP, Healing, Damage Boost, Multi-Shot, Invulnerability)
- **Server-authoritative rewards** — scores are never trusted from the client
- **VELoop Reward Coins** economy separate from in-game credits
- **JWT authentication**, leaderboards, achievements, daily streaks, events

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React + TypeScript + Vite           |
| Styling    | Tailwind CSS + custom glassmorphism |
| Game       | Phaser 3 (integrated in React)      |
| Backend    | Node.js + Express + TypeScript      |
| Database   | MongoDB (auto-falls back to in-memory MongoMemoryServer) |
| Auth       | JWT + bcrypt                        |
| Testing    | Vitest (24 backend tests passing)   |

## 📁 Project Structure

```
space-shooter-odyssey/
├── backend/                    # Express API server
│   ├── src/
│   │   ├── config/             # Database & environment config
│   │   ├── controllers/        # Route handlers (auth, player, mission, ship, wallet, etc.)
│   │   ├── middleware/          # Auth, admin, error handling
│   │   ├── models/             # Mongoose models (18+ models)
│   │   ├── routes/             # Express routes
│   │   ├── seeds/              # Data seeds (50 missions, 5 ships, upgrades, achievements)
│   │   ├── services/           # Anti-cheat, session, wallet, VELoop adapter
│   │   ├── types/              # Shared TypeScript types
│   │   ├── app.ts              # Express app setup
│   │   └── server.ts           # Server entry point
│   ├── tests/                  # Backend tests
│   └── package.json
├── frontend/                   # React Vite app
│   ├── src/
│   │   ├── components/         # NavBar, StarBackground
│   │   ├── context/            # Auth, Audio, Toast providers
│   │   ├── game/               # Phaser GameCanvas + SoundFX synthesizer
│   │   ├── pages/              # 12 pages (Landing, Login, Dashboard, Game, etc.)
│   │   ├── services/           # API client
│   │   ├── types/              # Shared types
│   │   ├── App.tsx             # Router & providers
│   │   └── main.tsx            # React entry
│   └── package.json
├── .gitignore
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **No external MongoDB needed** — the backend automatically uses an in-memory database

### Installation

```bash
# Clone the repo
git clone https://github.com/lokeshjhuria/Spacedesk-intern-.git
cd Spacedesk-intern-

# Install all dependencies
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### Running the App

**Terminal 1 — Backend (port 5000):**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend (port 5173):**
```bash
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

### Default Accounts

| Role   | Email              | Password       |
|--------|--------------------|----------------|
| Player | pilot@veloop.io    | Password123!   |
| Admin  | admin@veloop.io    | AdminPass123!  |

## 🎯 Features

### Core Gameplay
- Real-time Phaser 3 space combat — WASD/arrows to move, Space to fire, Q for special ability
- Enemy types: Scout, Drone, Heavy, Stealth, Swarm
- Boss encounters with multi-phase attack patterns
- Power-ups with visual effects and timed durations
- Mission objectives, wave systems, and completion scoring

### Pages
| Page | Description |
|------|-------------|
| Landing | Hero section, feature highlights, How to Play |
| Login/Register | JWT auth with form validation |
| Dashboard | Profile, XP bar, wallet, streak, stats |
| Missions | 50 missions across 5 sectors, star ratings |
| Gameplay | Phaser 3 canvas with HUD, pause/resume/exit |
| Ship Hangar | 5 ship classes, purchase/equip with stat bars |
| Upgrades Store | Category-filtered upgrades, purchase/equip |
| Wallet | 4-currency balances, daily streak, transaction history |
| Leaderboard | Server-validated rankings, timeframe filters |
| Achievements | Progress tracking, daily missions, claim rewards |
| Settings | Audio, graphics, controls, account management |
| Admin Panel | Platform stats, event management (admin-only) |

### Security
- Server-authoritative scoring — client scores are never trusted
- Anti-cheat session validation with physics constraints
- JWT authentication with bcrypt password hashing
- Rate limiting and input validation
- Idempotent reward claims
- Separate VELoop Reward Coins economy

## 🧪 Testing

```bash
cd backend
npm test
```

All 24 backend tests pass (auth, missions, anti-cheat, wallet, leaderboard).

## 📝 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=              # Leave empty for in-memory DB
JWT_SECRET=odyssey_jwt_secret_key_2024
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=/api/v1
```

## 🏗️ Architecture Highlights

- **Data-driven missions** — 50 missions procedurally configured across 5 sectors
- **Server-side anti-cheat** — validates session ownership, duration, and score feasibility
- **Atomic wallet operations** — prevents duplicate claims and race conditions
- **Ship balance as config** — ship stats are data-driven, adjustable without code changes
- **Procedural audio** — Web Audio API synthesizer, no external audio files
- **Responsive design** — desktop, tablet, and mobile layouts

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

Built for the **VELoop Rewards Platform** internship assignment.
