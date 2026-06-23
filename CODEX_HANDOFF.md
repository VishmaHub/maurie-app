# CODEX_HANDOFF.md — Mauri-E App

## Current State

This project is a Next.js multi-role platform for Mauri-E Group Pty Ltd.

The app currently has:

- Authentication
- Role-based access control
- Admin dashboard
- Client dashboard
- Creative dashboard
- Collaborator dashboard
- Admin record viewers
- Audit logging
- Admin search
- Data integrity review
- Platform settings
- Settings editing
- User status controls

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma 7
- PostgreSQL
- pnpm
- Docker Compose

## Local Setup

```bash
pnpm install
docker compose up -d
pnpm exec prisma generate
pnpm exec prisma migrate dev
pnpm db:seed
pnpm dev
```
