# Personal Expense Tracker

A full-stack personal expense tracker: log daily expenses, organize them into
per-user categories, and visualize spending over time. Built as a hands-on
learning project to practice full-stack development, authentication, database
design, and REST API architecture.

<p>
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white">
  <img alt="Express" src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white">
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white">
</p>

## Features

The backend REST API is implemented. The frontend is the next milestone.

- 🔐 **Authentication** — register / login with JWT and bcrypt-hashed passwords
- 🗂️ **Categories** — full CRUD, scoped per user, with default categories seeded on signup
- 💸 **Expenses** — full CRUD with strict ownership checks on every operation
- 🔎 **Filtering & pagination** — by category, date range, amount range, and free-text search
- 📊 **Spending summary** — aggregated totals grouped by category, ready for dashboard charts
- ✅ **Validation** — every request body, query, and path param is validated with Zod
- 🧱 **Layered architecture** — routes → controllers → services, with centralized error handling

## Tech Stack

**Backend (implemented)**

Node.js, TypeScript (strict), Express 5, PostgreSQL 16, Prisma 7 (ORM with the
node-postgres driver adapter), Zod for validation, JWT + bcrypt for auth.

**Frontend (planned)**

React + Vite, Tailwind CSS, Recharts for data visualization, TanStack Query.

## Architecture

The backend follows a layered, feature-oriented structure. Each module owns its
routes, request validation, HTTP controller, and business logic:

```
backend/
├── prisma/
│   ├── schema.prisma        # Data model (users, categories, expenses)
│   └── seed.ts              # Demo user + default categories seed
├── src/
│   ├── config/              # Env validation, Prisma client, constants
│   ├── middleware/          # authenticate, validate, error handler
│   ├── modules/
│   │   ├── auth/            # register / login / me
│   │   ├── categories/      # category CRUD
│   │   └── expenses/        # expense CRUD, filtering, summary
│   ├── utils/               # jwt, password hashing, AppError, asyncHandler
│   ├── app.ts               # Express app assembly
│   ├── routes.ts            # API router
│   └── index.ts             # Server bootstrap + graceful shutdown
├── Dockerfile
└── package.json
```

See [`Model.md`](./Model.md) for the full data model, entity relationships, and
business rules.

## Getting Started

### Option A — Docker (everything)

Runs PostgreSQL and the API together. Requires Docker and Docker Compose.

```bash
# From the repository root
JWT_SECRET="$(openssl rand -hex 32)" docker compose up --build
```

The API will be available at `http://localhost:3000` and migrations are applied
automatically on startup.

### Option B — Local development

Run PostgreSQL in Docker and the API on your machine with hot reload.

```bash
# 1. Start the database
docker compose up -d db

# 2. Configure the backend
cd backend
cp .env.example .env          # then set a strong JWT_SECRET

# 3. Install dependencies and set up the database
npm install
npm run prisma:generate
npm run prisma:migrate         # creates tables from the schema
npm run db:seed                # optional: demo user + sample data

# 4. Start the dev server (http://localhost:3000)
npm run dev
```

Demo credentials after seeding: `demo@expense-tracker.dev` / `demo1234`.

## Environment Variables

Configured in `backend/.env` (see `backend/.env.example`):

| Variable         | Description                                   | Default       |
| ---------------- | --------------------------------------------- | ------------- |
| `NODE_ENV`       | `development` \| `test` \| `production`       | `development` |
| `PORT`           | Port the API listens on                       | `3000`        |
| `DATABASE_URL`   | PostgreSQL connection string                  | —             |
| `JWT_SECRET`     | Secret for signing JWTs (min. 8 chars)        | —             |
| `JWT_EXPIRES_IN` | Token lifetime                                | `7d`          |
| `CORS_ORIGIN`    | Allowed origin(s), comma-separated, or `*`    | `*`           |

## API Reference

Base URL: `/api`. Protected routes require an `Authorization: Bearer <token>` header.

| Method   | Endpoint            | Auth | Description                                   |
| -------- | ------------------- | :--: | --------------------------------------------- |
| `GET`    | `/health`           |  —   | Health check                                  |
| `POST`   | `/auth/register`    |  —   | Create an account (seeds default categories)  |
| `POST`   | `/auth/login`       |  —   | Log in, returns a JWT                         |
| `GET`    | `/auth/me`          |  ✅  | Current user's profile                        |
| `GET`    | `/categories`       |  ✅  | List the user's categories                    |
| `POST`   | `/categories`       |  ✅  | Create a category                             |
| `PATCH`  | `/categories/:id`   |  ✅  | Update a category                             |
| `DELETE` | `/categories/:id`   |  ✅  | Delete a category (blocked if it has expenses)|
| `GET`    | `/expenses`         |  ✅  | List expenses (filter, search, paginate)      |
| `GET`    | `/expenses/summary` |  ✅  | Spending totals grouped by category           |
| `POST`   | `/expenses`         |  ✅  | Create an expense                             |
| `GET`    | `/expenses/:id`     |  ✅  | Get a single expense                          |
| `PATCH`  | `/expenses/:id`     |  ✅  | Update an expense                             |
| `DELETE` | `/expenses/:id`     |  ✅  | Delete an expense                             |

**Expense list filters** (query params): `categoryId`, `from`, `to`, `search`,
`minAmount`, `maxAmount`, `page`, `pageSize`.

### Example

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ada","email":"ada@example.com","password":"supersecret"}'

# Use the returned token
curl http://localhost:3000/api/expenses \
  -H "Authorization: Bearer <token>"
```

## Scripts

Run from `backend/`:

| Script                    | Description                            |
| ------------------------- | -------------------------------------- |
| `npm run dev`             | Start the dev server with hot reload   |
| `npm run build`           | Generate the Prisma client and compile |
| `npm start`               | Run the compiled server                |
| `npm run typecheck`       | Type-check without emitting            |
| `npm run prisma:migrate`  | Create/apply a development migration   |
| `npm run prisma:studio`   | Open Prisma Studio                     |
| `npm run db:seed`         | Seed a demo user and sample data       |

## Roadmap

- [x] Database schema & Prisma setup
- [x] Auth endpoints (register / login)
- [x] Category CRUD
- [x] Expense CRUD with filtering, search, and pagination
- [x] Spending summary endpoint
- [ ] Automated tests
- [ ] Frontend auth flow
- [ ] Dashboard & charts
- [ ] CSV import of bank statements (stretch goal)

## License

MIT
