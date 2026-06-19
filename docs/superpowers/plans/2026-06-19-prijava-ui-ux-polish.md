# Prijava and UI/UX Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify role-aware login, improve public form readability, add a practical mobile admin navigation, and send complete booking confirmation emails.

**Architecture:** Keep `/prijava` as the sole OAuth entry and perform session-role redirects on the server. Extend the existing admin shell rather than introducing a second navigation system, and isolate email rendering in a pure formatter so its output can be tested without sending mail.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Drizzle ORM, Tailwind/legacy CSS, Lucide React, Node test runner with tsx.

---

### Task 1: Role-aware `/prijava` and public navigation

**Files:**
- Modify: `app/(javni-sajt)/prijava/page.tsx`
- Modify: `components/PrijavaPageClient.tsx`
- Modify: `components/site/SiteChrome.tsx`

- [ ] Read the verified session in the server page and redirect clients to `/dashboard` and staff/admin users to `/admin/kalendar`.
- [ ] Keep guests on the same OAuth page and rewrite the page copy in clear Serbian without exposing an employee-only entry.
- [ ] Replace duplicate public menu entries with one `/prijava` entry labelled `Moj nalog`.
- [ ] Run `npx tsc --noEmit` and confirm exit code 0.

### Task 2: Public UI contrast and interaction polish

**Files:**
- Modify: `app/client-site.css`

- [ ] Introduce semantic client color tokens and raise card, body, label, placeholder, border and field contrast.
- [ ] Add native select option colors, minimum 44px controls, visible `focus-visible`, hover/pressed/disabled states, mobile spacing, and reduced-motion handling.
- [ ] Run `npx tsc --noEmit` and confirm exit code 0.

### Task 3: Mobile admin navigation

**Files:**
- Modify: `components/admin/AdminShellAutoDelic.tsx`
- Modify: `app/admin/admin-template.css`

- [ ] Add a mobile-only bottom navigation with Lucide icons for Kalendar, Termini, Javni sajt and Meni.
- [ ] Reuse `menuOpen` for the full role-filtered sidebar and expose active state with `aria-current`.
- [ ] Add safe-area-aware fixed positioning and content padding so the bar never covers content.
- [ ] Run `npx tsc --noEmit` and confirm exit code 0.

### Task 4: Complete booking confirmation email

**Files:**
- Create: `lib/email/booking-confirmation.ts`
- Create: `lib/email/booking-confirmation.test.ts`
- Modify: `lib/auth/email.ts`
- Modify: `app/api/bookings/route.ts`

- [ ] Write a formatter test covering name, localized date/time, vehicle, plate, address, contact, ten-minute reminder and HTML escaping.
- [ ] Run `node --import tsx --test lib/email/booking-confirmation.test.ts` and confirm the formatter test fails before implementation.
- [ ] Implement a pure text/HTML formatter and update `sendBookingConfirmationEmail` to accept the complete booking data.
- [ ] Load the user profile and pass the existing vehicle data plus configured business contact values from environment fallbacks.
- [ ] Run the formatter test and confirm all tests pass.

### Task 5: Final verification

**Files:**
- Modify only if verification finds a scoped defect.

- [ ] Run `git diff --check`.
- [ ] Run `node --import tsx --test lib/email/booking-confirmation.test.ts`.
- [ ] Run `npx tsc --noEmit`.
- [ ] Run `npm run build` and confirm the production build exits successfully.
- [ ] Review the final diff against every design requirement and report any limitation explicitly.
