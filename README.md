# Dry Touch Workshop | ورشة دراي تاتش

Production-ready automotive workshop booking management system.

## Stack

Next.js 15 · TypeScript · Tailwind CSS v4 · Prisma 6 · PostgreSQL · Server Actions · JWT Auth · AR/EN i18n

## Quick Start

```bash
npm install
cp .env.example .env
# Set DATABASE_URL (PostgreSQL or Neon)
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open http://localhost:3000 — **admin** / **admin123** (development only)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run typecheck` | TypeScript check |
| `npm run validate` | lint + typecheck + build |
| `npm run db:migrate` | Dev migrations |
| `npm run db:migrate:deploy` | Production migrations |
| `npm run db:seed` | Seed data |

## Project Structure

```
src/
├── actions/       Server Actions
├── app/           App Router pages
├── components/    UI + feature components
├── i18n/          Arabic & English
├── lib/           Core utilities, auth, env validation
└── types/
prisma/            Schema, migrations, seed
docs/              Plans & deployment guides
```

## Environment Variables

See `.env.example`. Required:

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — 32+ characters in production
- `NEXT_PUBLIC_APP_URL` — Public app URL

## Deployment

**Production:** https://dry-touch-workshop.vercel.app  
**GitHub:** https://github.com/engbaleegh/dry-touch-workshop

Vercel is connected to GitHub. Every push to `main` triggers an automatic production deployment.

```bash
git add .
git commit -m "your message"
git push origin main
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for Neon + Vercel environment setup.

## License

Private — Dry Touch Workshop
