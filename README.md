# GamerZone

E-commerce de equipamentos gamer. Monorepo dividido em `Frontend/` (React + Vite) e `Backend/` (Node/Express + MongoDB).

## Estrutura

```
.
├── Frontend/          # SPA em React + TypeScript + Vite + Tailwind + shadcn-ui
├── Backend/           # API em Node.js + Express + MongoDB (Mongoose)
└── docker-compose.yml # sobe o MongoDB local
```

## Como rodar localmente

### 1. Banco de dados (MongoDB)

```sh
docker compose up -d
```

### 2. Backend

```sh
cd Backend
cp .env.example .env
npm install
npm run dev
```

A API sobe em `http://localhost:4000` por padrão (ver `.env`).

### 3. Frontend

```sh
cd Frontend
npm install
npm run dev
```

A aplicação sobe em `http://localhost:8080`.

## Tecnologias

**Frontend**: Vite, TypeScript, React, shadcn-ui, Tailwind CSS

**Backend**: Node.js, Express, MongoDB, Mongoose
