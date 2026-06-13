# Dry Touch Workshop — Project Plan

## 1. Overview

Automotive workshop booking management for staff to manage customer reservations. Arabic RTL default, English optional, admin-only auth.

## 2. Database Schema

```
User
├── id (cuid)
├── username (unique)
├── password (bcrypt)
└── createdAt

Booking
├── id (cuid)
├── bookingNumber (unique, auto: DT-YYYYMMDD-###)
├── customerName, phone, plateNumber
├── vehicleMake, vehicleModel, vehicleYear
├── serviceCategory (enum)
├── serviceDescription
├── bookingDate (date), bookingTime (HH:mm)
├── estimatedDuration (minutes)
├── status (enum)
├── notes (optional)
├── createdAt, updatedAt
```

**Enums:** `BookingStatus`, `ServiceCategory` (8 categories per requirements).

## 3. Folder Structure

```
src/
├── actions/          # Server Actions
├── app/              # App Router pages
├── components/       # UI + feature components
├── i18n/             # ar.json, en.json
├── lib/              # prisma, auth, session, validations, export
└── types/
prisma/               # schema, migrations, seed
docs/                 # This plan
```

## 4. UI Wireframe (ASCII)

```
┌─────────────────────────────────────────────────────────────┐
│ [≡]  Dashboard Title                    [AR|EN]  admin  Logout│
├──────────┬──────────────────────────────────────────────────┤
│ Sidebar  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐         │
│          │  │Total│ │Today│ │Upcom│ │Done │ │Cancel│ Stats   │
│ Dashboard│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘         │
│ Bookings │  ┌──────────────────┐ ┌──────────────────┐       │
│ New      │  │ Today's Schedule │ │ Upcoming Alerts  │       │
│ Calendar │  └──────────────────┘ └──────────────────┘       │
│ Reports  │  [Filters] [Search] [Export] [+ New Booking]      │
│          │  ┌────────────────────────────────────────────┐  │
│          │  │ Data Table (sort, paginate)                │  │
│          │  └────────────────────────────────────────────┘  │
└──────────┴──────────────────────────────────────────────────┘

Calendar: Monthly grid (badge = count) | Daily list panel
Login: Split hero + form (username/password)
```

## 5. Implementation Roadmap

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 1 | Scaffold Next.js 15 + Tailwind + Prisma | Done |
| 2 | Schema, migrations, seed | Done |
| 3 | Auth (JWT cookie) + middleware | Done |
| 4 | i18n AR/EN + RTL layout | Done |
| 5 | Dashboard + stats | Done |
| 6 | Bookings CRUD + filters + export | Done |
| 7 | Calendar + slot conflict check | Done |
| 8 | Reports | Done |
| 9 | README, .env.example, build verify | Done |

## 6. Architecture

- **Presentation:** React Server Components + Client islands (forms, calendar, exports)
- **Application:** Server Actions in `src/actions/`
- **Domain:** Validations (Zod), booking slot logic in `src/lib/booking-utils.ts`
- **Infrastructure:** Prisma + PostgreSQL, session via `jose`

## 7. Security Notes

- Passwords hashed with bcrypt (12 rounds)
- HTTP-only session cookies
- All dashboard routes protected by middleware
- Change `JWT_SECRET` and default admin password in production
