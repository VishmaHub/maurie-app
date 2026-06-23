# AGENTS.md — Mauri-E App Developer Instructions

## Project Overview

This is the Mauri-E internal multi-role platform built with:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Server Components
- Server Actions
- Role-based access control
- Audit logging

The platform supports four roles:

- ADMIN
- CLIENT
- CREATIVE
- COLLABORATOR

## Brand Context

Mauri-E Group Pty Ltd is a Sydney-based creative media, production, and digital services company.

Official core values:

- Creativity
- Culture
- Collaboration
- Community

Brand colours:

- Mauri-E Yellow: `#fdc324`
- Mauri-E Orange: `#ea6d30`
- Mauri-E Brown: `#593732`
- Mauri-E Cream: `#f7f3ef`
- Mauri-E Black: `#131313`
- Mauri-E Grey: `#7f7f7f`

The UI should feel warm, premium, culturally grounded, cinematic, and operationally clear.

## Architecture Rules

Use the existing root-based structure:

- `app/`
- `components/`
- `lib/`
- `types/`
- `prisma/`

Do not create a `src/` folder.

Use `@/` imports.

Do not bypass role checks.

Protected pages must use:

```ts
const session = await requireRole("ADMIN");
```
