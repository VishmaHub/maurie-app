# Mauri-E Product Roadmap

## Product Vision

Mauri-E is a public self-service MVP platform for culturally grounded creative work, purpose-led
businesses, non-profits, and campaign collaborators. Public users can discover published profiles,
register for an appropriate role, and manage their own presence and requests through authenticated
dashboards. Mauri-E administrators retain governance over access, approvals, public records,
campaign spaces, operational settings, and audit history.

The product combines a public-facing platform with a controlled administrative backend. Public
self-service must not weaken role checks, ownership enforcement, approval gates, record retention,
or audit requirements.

## MVP Scope

The MVP is intended to provide:

- A public landing page with clear creator, business, and collaborator pathways.
- Secure self-registration for creators, businesses, non-profits, and collaborators.
- Email verification, password recovery, legal-consent capture, and role-specific onboarding.
- Published creator profiles, downloadable vCards, portfolios, and booking profiles.
- Published business listings and authenticated service booking/request workflows.
- Non-binding business campaign interest and collaborator partnership EOI submissions.
- Admin-approved access to confidential campaign collaboration rooms.
- Admin governance, audit logs, account controls, approvals, and operational reporting.
- A future-ready subscription entitlement foundation without payment processing.

## User Roles

### Public Visitor

- View the landing page.
- View published creator profiles and portfolios.
- Download published creator vCards.
- View published business listings.
- Begin registration or sign in.

### Creative (`CREATIVE`)

- Register and verify an account.
- Complete creator onboarding.
- Manage a public profile and vCard details.
- Manage portfolio items and publication status.
- Configure a booking profile.
- Review booking requests and existing assigned work.

### Business (`CLIENT`)

- Register and verify a business account.
- Complete business onboarding.
- Manage an owned business listing and publication status.
- Submit and review service booking/requests.
- Submit non-binding campaign interest or EOI records.
- Review existing projects and business invoices where applicable.

### Non-profit or Collaborator (`COLLABORATOR`)

- Register and verify an account.
- Complete collaborator onboarding.
- Submit a partnership EOI.
- View approval status.
- Access assigned campaign collaboration rooms only after admin approval.

### Administrator (`ADMIN`)

- Created only through controlled administrative processes.
- Manage users, approvals, public records, bookings, campaigns, EOIs, settings, and audit logs.
- Activate or deactivate accounts without hard deletion.
- Review subscription status after the subscription foundation exists.
- Retain the existing admin listing create/edit capability.

## Planned Public Routes

These routes are planned and are not all implemented yet:

- `/` — public landing page
- `/login` — sign in
- `/register` — role selection and registration entry
- `/register/creator` — creator registration
- `/register/business` — business registration
- `/register/collaborator` — non-profit/collaborator registration
- `/verify-email` — email verification result
- `/forgot-password` — password recovery request
- `/reset-password` — password reset
- `/creators` — published creator discovery
- `/c/[publicHandle]` — published creator profile
- `/c/[publicHandle]/vcard` — published creator vCard
- `/c/[publicHandle]/book` — creator booking/request entry
- `/l/[publicSlug]` — published business listing
- `/privacy` — privacy policy
- `/terms` — platform terms
- `/pricing` — future pricing disclosure
- `/support` — support and contact process

## Planned Authenticated Dashboard Routes

Existing dashboard route prefixes remain stable.

### Shared account routes

- `/dashboard/account`
- `/dashboard/account/subscription`

### Creator routes

- `/dashboard/creative`
- `/dashboard/creative/onboarding`
- `/dashboard/creative/profile`
- `/dashboard/creative/portfolio`
- `/dashboard/creative/portfolio/new`
- `/dashboard/creative/portfolio/[itemId]/edit`
- `/dashboard/creative/booking-profile`
- `/dashboard/creative/bookings`

### Business routes

- `/dashboard/client`
- `/dashboard/client/onboarding`
- `/dashboard/client/listing`
- `/dashboard/client/listing/edit`
- `/dashboard/client/requests`
- `/dashboard/client/requests/new`
- `/dashboard/client/interests`
- `/dashboard/client/interests/new`
- Existing project and financial record routes

### Collaborator routes

- `/dashboard/collaborator`
- `/dashboard/collaborator/onboarding`
- `/dashboard/collaborator/approval`
- `/dashboard/collaborator/partnership-eoi/new`
- `/dashboard/collaborator/campaigns`
- `/dashboard/collaborator/campaigns/[campaignId]`

## Admin Governance Modules

Admin routes and Server Actions must remain protected by `requireRole("ADMIN")`. Planned governance
coverage includes:

- Users and account status
- Registration and collaborator approvals
- Clients, creators, and collaborators
- Business listings and publication status
- Creator profiles and publication status
- Service requests and bookings
- Campaign interest and partnership EOIs
- Campaign rooms and confidential assets
- Projects and operational invoices
- Platform settings
- Subscription status and entitlement assignments later
- Data integrity review
- Platform search
- Immutable audit history

Admin writes must be audited. Important records must use status transitions, deactivation, or
archival rather than hard deletion.

## Subscription Foundation Plan

Phase 42 may introduce a non-billing subscription foundation containing:

- Plan identifiers and descriptions
- Capability or entitlement metadata
- User subscription status
- Start, end, pause, cancellation-request, and cancellation timestamps
- Administrative assignment and audit history
- Server-side entitlement checks

The initial plan should be free or administratively assigned. The foundation must not include:

- Checkout
- Card or bank-detail collection
- Payment-provider customer records
- Charges or automatic renewals
- Billing webhooks
- Claims that a paid plan is available

Payment integration is blocked until terms, privacy policy, pricing disclosure, cancellation flow,
refund position, and support process are complete and approved.

## Campaign EOI Safety Model

Campaign and partnership submissions are non-binding expressions of interest only.

The safe MVP model must:

- Describe the submission as interest, an application, or an EOI.
- State that submission creates no obligation for either party.
- Avoid expected returns, investment performance, securities language, or financial advice.
- Avoid collecting investment payments, bank details, card details, or payment instructions.
- Avoid promises of acceptance, allocation, participation, or financial return.
- Capture the submitter's acknowledgement of the non-binding nature of the submission.
- Support admin review statuses and audit history.
- Limit collection to information necessary for campaign or partnership assessment.

The existing legacy investment-oriented EOI schema must not become a public creation flow. It should
remain isolated until a later additive migration safely replaces it while preserving historical
records.

## Compliance and Security Principles

- Public registration must never create an `ADMIN` account.
- Enforce authorization and record ownership on the server for every protected read and write.
- Require email verification before full dashboard access.
- Use approval gates before collaborator access to confidential campaign rooms.
- Apply rate limiting and abuse controls to registration, login, password reset, EOI, and booking
  submissions.
- Hash passwords and one-time tokens; never store or log plaintext credentials or verification
  tokens.
- Keep public profiles unpublished until the owner deliberately publishes them.
- Minimise personal and sensitive information in forms, logs, analytics, and audit metadata.
- Record versioned acceptance of privacy and terms documents.
- Use secure session cookies and re-check active/approval state for protected access.
- Do not treat placeholder encryption as production-ready protection.
- Preserve audit records and important business records.
- Test role isolation, ownership boundaries, approval gates, redirects, and migration backfills.

## Implementation Phases

### Phase 36A — Product Direction Reset

Align developer instructions, handoff context, product scope, safety boundaries, and roadmap. No
feature implementation.

### Phase 36B — Public Registration Architecture Plan

Design registration, verification, password recovery, onboarding, approval, consent, abuse
controls, ownership, session validation, and additive database migrations.

### Phase 37 — Public Registration Foundation

Implement secure public registration for `CREATIVE`, `CLIENT`, and `COLLABORATOR`, excluding
`ADMIN`. Add verification, recovery, consent, onboarding state, and approval state.

### Phase 38 — Public Landing Page

Replace internal-product language with a public product experience and safe creator, business, and
collaborator entry paths.

### Phase 39 — Creator Self-Service MVP

Add creator-owned profile, vCard, portfolio, publication, and booking-profile mutations.

### Phase 40 — Business Self-Service MVP

Add business-owned listing management, service booking/request workflows, and non-binding campaign
interest.

### Phase 41 — Collaborator / Campaign EOI MVP

Add partnership EOI, admin approval, approval-status views, and approval-gated campaign-room access.
Replace investment-oriented language and fields in active workflows.

### Phase 42 — Subscription Foundation

Add non-billing plans, subscription statuses, and entitlement checks. Do not integrate payments.

## Explicitly Out of Scope for the MVP

- Campaign investment payments
- Investment checkout or fund collection
- Securities, managed-investment, or financial-product functionality
- Financial advice or expected-return calculations
- Promises of campaign participation or financial return
- Real subscription payments or automatic renewals
- Card, bank, or payment-credential storage
- Payment-provider integration and billing webhooks
- Public registration for administrators
- Ungoverned access to confidential campaign rooms
- Hard deletion of important business, user, EOI, subscription, campaign, or audit records
- Listing Offer CRUD until separately prioritised
