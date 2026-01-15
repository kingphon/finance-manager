# Finance Manager

A personal finance tracker with FastAPI backend and React frontend, built as a monorepo using Turborepo and pnpm.

## Tech Stack

### Backend
- **Framework:** FastAPI (Python 3.10+)
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy
- **Auth:** JWT + OAuth (Google, GitHub)

### Frontend
- **Framework:** React + TypeScript (Vite)
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** Lucide-React

## Prerequisites

- Node.js 18+
- pnpm 8+
- Python 3.10+
- PostgreSQL 14+
- Docker & Docker Compose (optional)

## Getting Started

### 1. Clone and Install

```bash
git clone <repo-url>
cd finance-manager
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Database Setup

```bash
# Start PostgreSQL (via Docker)
docker-compose up db -d

# Or use your local PostgreSQL
```

### 4. Backend Setup

```bash
cd apps/backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 5. Run Development

```bash
# From root directory
pnpm dev
```

This starts:
- Backend: http://localhost:8000
- Frontend: http://localhost:5173
- API Docs: http://localhost:8000/docs

## Docker

```bash
# Build and run all services
pnpm docker:up

# Stop services
pnpm docker:down
```

## Project Structure

```
/finance-manager
├── apps/
│   ├── backend/          # FastAPI Python app
│   └── frontend/         # Vite React app
├── packages/
│   └── shared/           # Shared TypeScript types
├── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps |
| `pnpm lint` | Lint all apps |
| `pnpm test` | Run tests |
| `pnpm docker:up` | Start Docker Compose |
| `pnpm docker:down` | Stop Docker Compose |

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## License

ISC
# finance-manager
