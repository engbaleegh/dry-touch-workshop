# Production Deployment Guide

## Neon PostgreSQL (Phase 4)

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string (enable **connection pooling** for serverless)
3. Append `?sslmode=require` if not present
4. For Vercel serverless, use the **pooled** connection string

```env
DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="<generate-64-char-random-string>"
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
SEED_ADMIN_PASSWORD="<strong-password>"
```

5. Run migrations:

```bash
npx prisma migrate deploy
npm run db:seed
```

## Vercel (Phase 9)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables (see above)
4. Deploy — `vercel.json` runs `prisma migrate deploy` on build

### Required env vars on Vercel

| Variable | Required |
|----------|----------|
| `DATABASE_URL` | Yes |
| `JWT_SECRET` | Yes (32+ chars) |
| `NEXT_PUBLIC_APP_URL` | Yes |
| `SEED_ADMIN_PASSWORD` | Only for initial seed |

## Health checks

- `GET /login` → 200
- Login → redirect to `/dashboard`
- Create/edit/delete booking
- Export Excel/PDF
