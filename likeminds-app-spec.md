# LikeMinds Age Grade 80-86 — Finance Records App

## Stack
Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui + Framer Motion + next-themes + Convex (DB). Font: Google **Nunito** only, set in `layout.tsx`. Mobile-first, dark/light theme, smooth micro-animations throughout.

## Brand
- Logo colors: emerald, amber, pink → build theme palette around these (emerald primary, amber accent, pink highlight).
- Links footer/header: website `https://www.likemindsofficial.org`, email `info@likemindsofficial.org`.

## Auth Flow
- **Home page (`/`)**: LikeMinds logo + app name, 6-digit PIN input (segmented, auto-advance, animated).
- Each member has a unique PIN but on success **all** members' data is visible (shared visibility, not per-user scoped).
- On success → redirect to `/members`.

## `/members` Page
- Header: "Welcome back, {member name}" animated greeting.
- **Birthday notice banner** at top: shows if any member's birthday is today ("🎉 Happy Birthday to {name}!").
- Member's own **main account details** + **social account details** (name, umunna, DOB, contact/social links etc.).
- Tabs:
  1. **Monthly Dues** — years as sub-tabs starting 2023 (admin can add future years). Each year → Jan–Dec grid. Click a member → expand to show which months paid/unpaid for selected year. Unpaid/behind → red flag. Include **payment history with dates** (timestamped log per member).
  2. **Project Levy** — annual, min ₦50,000/year, list starts 2026 (admin can add years). Members list per year; unpaid → red flag.
  3. **Birthdays** — grouped by month (Jan→Dec), ordered by day within month. Logic:
     - Day before birthday → "Next to be celebrated"
     - On birthday → "Celebrating today"
     - Day after → "Celebrated"

## `/dashboard` (Admin)
- PIN/auth-gated (admin role).
- CRUD member profiles: name, PIN, DOB, umunna, social/contact info.
- Update monthly dues (mark month paid/unpaid per member per year), add new years.
- Update project levy status/amount per member per year, add new years.
- View/edit payment history log.

## Data Model (Convex, suggested tables)
- `members`: id, name, pin (hashed), dob, umunna, socialLinks, mainAccountDetails, role
- `duesYears`: year
- `monthlyDues`: memberId, year, month, paid(bool), datePaid, amount
- `levyYears`: year, minAmount
- `projectLevy`: memberId, year, paid(bool), amount, datePaid
- `paymentHistory`: memberId, type(dues/levy), year, month?, amount, date

## Extra Features (recommended additions)
- Dashboard summary cards: total collected this year, % members up-to-date, upcoming birthdays this week.
- Search/filter members list.
- Export payment history (CSV/PDF).
- Toast notifications on PIN success/fail, dark/light toggle animated.
- Skeleton loaders + Framer Motion page transitions.
- Audit log of admin edits (who changed what, when).

## Design Notes
- Mobile-first layout, large tap targets, bottom nav on mobile.
- Smooth transitions: PIN entry → dashboard reveal, tab switches, red-flag pulse animation for overdue members.
- Empty/error states styled, not default browser alerts.
