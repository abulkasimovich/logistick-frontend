# Fleet Command — Logistics Intelligence Platform

Full-stack logistics dashboard: **NestJS + PostgreSQL + React 18 + TypeScript**

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, Vite, Chart.js 4, Zustand, TanStack Query |
| Backend | NestJS 10, TypeORM, PostgreSQL 16, JWT Auth, Socket.IO |
| DevOps | Docker, Docker Compose, Nginx |

---

## Quick Start (Docker — Recommended)

```bash
# 1. Clone and enter
cd fleet-command

# 2. Create .env file
cp .env.example .env

# 3. Start all services
docker-compose up -d

# 4. Seed the database (first time only)
docker-compose exec backend npm run seed

# 5. Open in browser
# http://localhost — Frontend
# http://localhost:3000/api/docs — Swagger
```

---

## Local Development

### Backend

```bash
cd backend

# Install dependencies
npm install

# Copy env
cp .env.example .env
# Edit .env — set your PostgreSQL credentials

# Start PostgreSQL (or use Docker)
docker run -d --name fc-pg \
  -e POSTGRES_DB=fleet_command \
  -e POSTGRES_USER=fleet_user \
  -e POSTGRES_PASSWORD=fleet_pass_2024 \
  -p 5432:5432 postgres:16-alpine

# Start backend in dev mode
npm run start:dev

# Seed database
npm run seed
```

Backend runs at: `http://localhost:3000`
Swagger docs: `http://localhost:3000/api/docs`

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy env
cp .env.example .env

# Start dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Default Login Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@fleetcommand.com | Admin123! |
| Dispatcher | dispatcher@fleetcommand.com | Pass123! |
| Analyst | analyst@fleetcommand.com | Pass123! |

---

## API Endpoints

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | Login → JWT tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user |

### Stats
| Method | Path | Description |
|---|---|---|
| GET | `/api/stats/overview?period=12M` | KPI aggregation |
| GET | `/api/stats/monthly?period=12M` | Monthly breakdown |
| GET | `/api/stats/financials?period=12M` | P&L data |

### Loads
| Method | Path | Description |
|---|---|---|
| GET | `/api/loads?page=1&status=delivered&search=LD` | List with filters |
| POST | `/api/loads` | Create load |
| PUT | `/api/loads/:id` | Update load |
| PATCH | `/api/loads/:id/status` | Update status |
| DELETE | `/api/loads/:id` | Delete load |

---

## Role Permissions

| Role | Overview | Loads | Drivers | Dispatchers | Customers | Financials | Settings |
|---|---|---|---|---|---|---|---|
| admin | ✅ | CRUD | CRUD | CRUD | CRUD | ✅ | ✅ |
| dispatcher | ✅ | RW | R | - | - | - | - |
| analyst | ✅ | R | R | R | R | ✅ | - |
| driver | ✅ | R (own) | - | - | - | - | - |

---

## WebSocket Events

| Event | Direction | Description |
|---|---|---|
| `load:created` | Server→Client | New load created |
| `load:delivered` | Server→Client | Load status → delivered |
| `load:status_changed` | Server→Client | Any status change |
| `stats:updated` | Server→Client | KPI refresh (60s interval) |
| `notification:new` | Server→Client | Push notification |
| `subscribe:room` | Client→Server | Join loads/stats room |

---

## Project Structure

```
fleet-command/
├── backend/                   # NestJS API
│   └── src/
│       ├── auth/              # JWT auth, guards, strategies
│       ├── loads/             # Loads CRUD + status
│       ├── drivers/           # Drivers + performance stats
│       ├── dispatchers/       # Dispatchers + leaderboard
│       ├── customers/         # Customer revenue tracking
│       ├── stats/             # KPI aggregations
│       ├── users/             # User management
│       ├── gateway/           # Socket.IO WebSocket
│       └── database/          # Seed data
├── frontend/                  # React 18 SPA
│   └── src/
│       ├── components/
│       │   ├── charts/        # Chart.js components
│       │   └── layout/        # AppLayout, Sidebar, Topbar
│       ├── pages/             # Overview, Loads, Drivers...
│       ├── store/             # Zustand (auth, ui)
│       ├── services/          # Axios API services
│       ├── hooks/             # useSocket, useDebounce
│       └── types/             # TypeScript interfaces
└── docker-compose.yml
```
