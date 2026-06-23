# CODEX_HANDOFF.md — Mauri-E App

## Current State

This project is a Next.js multi-role platform for Mauri-E Group Pty Ltd. It began as an internal
admin/client portal foundation and is now being redirected into a public self-service MVP with
authenticated role dashboards and admin governance.

The app currently has:

- Seeded-user authentication
- HttpOnly signed sessions
- Role-based access control and dashboard routing
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
- CRUD validation and Server Action response foundations
- Admin business listing create and edit controls
- Public business listing pages
- Public creative profile and vCard pages
- Creative portfolio and booking record viewers
- Collaborator campaign-room and legacy EOI record viewers

Public registration, email verification, password reset, role onboarding, self-service profile
editing, public booking requests, approval workflows, and subscription records are not yet
implemented.

## Corrected Product Direction

Mauri-E must become a public self-service platform where:

- Public visitors can access a landing page and published profiles.
- Users can register themselves as creators, businesses, or collaborators.
- Creators can manage a vCard, public portfolio, and booking profile.
- Businesses register as `CLIENT` users and manage a listing, service requests, and non-binding
  campaign interest or EOI submissions.
- Non-profits and collaborators register as `COLLABORATOR` users, submit partnership EOIs, and
  access campaign collaboration rooms only after admin approval.
- Admins retain governance over users, approvals, listings, creators, bookings, campaigns, EOIs,
  settings, audit logs, and later subscription status.

The existing admin listing CRUD remains a useful governance capability, but further admin-only CRUD
expansion is paused until public registration, onboarding, ownership, and approval architecture is
defined.

## Role and User Model

- `ADMIN`: Mauri-E operators only. Never publicly registrable. Full governance remains protected by
  `requireRole("ADMIN")` and audited writes.
- `CREATIVE`: Self-registering creator accounts. Planned self-service features are public profile,
  vCard, portfolio, and booking profile management.
- `CLIENT`: Self-registering business accounts. Planned self-service features are business listing,
  service requests, and campaign interest or EOI management.
- `COLLABORATOR`: Self-registering non-profit or collaboration accounts. Planned access begins with
  partnership EOI and remains approval-gated before campaign-room access.

Public registration must never accept `ADMIN` as an input role. Protected mutations must enforce
both role and record ownership. Existing users must remain compatible during future additive schema
migrations.

## Safety and Compliance Warning

Do not build real campaign investment payments or financial product functionality for the MVP.
Campaign-related submissions are non-binding interest or EOI only. Do not provide financial advice,
promise a return, solicit funds, or collect payment for campaign investment.

Do not build real subscription payments yet. Subscription work is limited to a later non-billing
foundation. Payment integration may begin only after terms, privacy policy, pricing disclosure,
cancellation flow, refund position, and support process are ready and approved.

The current legacy EOI schema and interface contain investment-oriented fields and wording. They
must not be expanded or exposed as a new public submission flow. A later phase must replace them
with a safe non-binding campaign/partnership interest model while preserving existing records.

## Next Recommended Phases

1. **Phase 36A — Product Direction Reset:** Align developer instructions, handoff context, scope,
   safety boundaries, and roadmap.
2. **Phase 36B — Public Registration Architecture Plan:** Define registration, verification,
   onboarding, approval, consent, ownership, abuse controls, and additive database migration
   strategy before implementation.
3. **Phase 37 — Public Registration Foundation:** Implement secure self-registration, email
   verification, password recovery, role selection, consent capture, and onboarding gates. Public
   registration must exclude `ADMIN`.
4. **Phase 38 — Public Landing Page:** Rework the public landing experience, role pathways, public
   navigation, and safe product copy.
5. **Phase 39 — Creator Self-Service MVP:** Add creator-owned vCard, portfolio, public profile, and
   booking-profile management.
6. **Phase 40 — Business Self-Service MVP:** Add business-owned listing management, service
   booking/request workflows, and non-binding campaign interest.
7. **Phase 41 — Collaborator / Campaign EOI MVP:** Add partnership EOI, admin approval, and
   approval-gated campaign rooms using non-financial, non-binding language and data.
8. **Phase 42 — Subscription Foundation:** Add plans, entitlement records, and subscription status
   only. Do not add payment processing.

See `PRODUCT_ROADMAP.md` for the consolidated product and implementation roadmap.

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

Before handing off a completed implementation phase, run:

```bash
pnpm format
pnpm quality
```
