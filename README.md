# InfraHub

InfraHub is a full-stack portal for managing infrastructure tools such as Zabbix, Grafana, Zammad, OpenStack, and Ceph.

## Features

- Add, edit, delete, search, and favorite tools
- Parent and child tool hierarchy
- Logo uploads
- Flask REST API with SQLite storage
- React/Vite frontend

## Requirements

- Docker Desktop (recommended), or
- Python 3.8+, SQLite, Node.js 16+, and npm 7+

## Run with Docker

From the project root:

```bash
docker compose up --build
```

Open the frontend at [http://localhost:8501](http://localhost:8501).

- Backend API: [http://localhost:5000](http://localhost:5000)
- Health check: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- Stop services: `docker compose down`

SQLite data and uploaded logos persist in `backend/instance` and `backend/uploads`.
Backend settings can be provided in `backend/.env`.

## Run Locally

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate   # Linux/macOS
pip install -r requirements.txt
copy .env.example .env       # Windows
# cp .env.example .env       # Linux/macOS
python run.py
```

### Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Useful Commands

Run these from `backend`:

```bash
flask --app app init-db
flask --app app seed-db
flask --app app list-tools
```

Run these from `frontend`:

```bash
npm run build
npm run preview
```

**Last Updated**: 2026