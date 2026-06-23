# AGENTS.md — Mauri-E App Developer Instructions

## Project Overview

This is the Mauri-E public self-service MVP platform with authenticated role dashboards and an
admin governance backend. The product is being developed for public visitors, self-registering
creators, businesses, non-profits, collaborators, and Mauri-E administrators.

The platform is built with:

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

Public registration is part of the product direction. Registration must never allow a public user
to create an `ADMIN` account. Role-specific onboarding, ownership checks, approval gates, and
admin governance must be designed before public registration is enabled.

## Product Direction

The MVP must support:

- Public visitors accessing the landing page and published public profiles.
- Creators registering and managing a vCard, public portfolio, and booking profile.
- Businesses registering as clients and managing a business listing, service requests, and
  non-binding campaign interest or EOI submissions.
- Non-profits and collaborators registering, submitting partnership EOIs, and accessing campaign
  collaboration rooms only after admin approval.
- Admins governing users, approvals, listings, creators, bookings, campaigns, EOIs, settings,
  audit logs, and future subscription status.

Admin-only CRUD expansion is paused until the public registration, onboarding, ownership, and
approval architecture is defined. Existing admin controls remain valid and must be preserved.

## MVP Safety Rules

- Do not implement campaign investment payments or financial product functionality.
- Campaign-related submissions must be framed as non-binding interest or EOI only.
- Do not provide financial advice, promise returns, solicit investment funds, or collect campaign
  investment payments.
- Do not implement real subscription payments yet.
- Subscription work must remain a non-billing foundation until terms, privacy policy, pricing
  disclosure, cancellation flow, refund position, and support process are ready.
- Do not add checkout, card collection, payment-provider customer records, or billing webhooks
  without an explicitly approved later phase.

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

Protected admin pages must use:

```ts
const session = await requireRole("ADMIN");
```

Protected non-admin pages and Server Actions must use the matching role check and enforce record
ownership. Public routes must never rely on client-side checks for authorization.

Use Server Components by default and Server Actions for mutations.

Admin writes must include audit logs.

Do not hard delete important business, user, campaign, EOI, subscription, or audit records.
