# Brightloop - Frontend Architecture & Phase 1 Visual Redesign

This document outlines the foundation setup and the **Phase 1 Visual Redesign** completed for the **Brightloop** Subscription Management System.

---

## 1. Design System & Colour Tokens

Brightloop's visual identity has been redesigned following a clean commercial fintech aesthetic:

### Core Colour Palette:
- **Primary**: `#087A4B` (Emerald Green - primary buttons, active highlights, key metrics)
- **Secondary**: `#171918` (Charcoal Black - active navigation background, primary headings)
- **Background**: `#F3F5F4` (Soft Grey - application canvas)

### Additional Neutral & Functional Tokens:
- **White Content Surface**: `#FFFFFF`
- **Main Text**: `#252825`
- **Secondary Text**: `#858B87`
- **Subtle Borders**: `#E7EAE8`
- **Light Green Surface**: `#E9F3ED`

### Status Badges:
- **Success / Active**: Background `#E9F3ED`, Text `#087A4B`
- **Pending**: Background `#FEF3C7`, Text `#B45309`
- **Overdue**: Background `#FEE2E2`, Text `#B91C1C`

### Typography:
- **Font**: Inter as the sole font family.
- **Scale**:
  - Page Headings: `24–26px` (semibold)
  - Section Headings: `15–17px` (semibold)
  - Body Text: `13–14px` (regular/medium)
  - Supporting / Meta: `11–12px` (medium/semibold)

---

## 2. Component Architecture

### A. Sidebar (`src/components/Sidebar.jsx`)
- Clean white background (`#FFFFFF`) with desktop width of `245px`.
- Brightloop brand mark at top with emerald green icon badge (`#087A4B`).
- Compact in-sidebar search input (`Search menu...`) with real-time filtering.
- Grouped navigation sections with subtle uppercase section labels:
  - **MAIN MENU**: Dashboard, Products, Plans, Subscriptions
  - **FINANCE**: Quotations, Invoices, Payments, Discounts
  - **MANAGEMENT**: Customers, Reports, Settings
- Active navigation item styled in dark charcoal (`#171918`) with white text and emerald green icon.
- User profile footer with user avatar, name ("Rohith V P"), role ("Billing Admin"), and chevron.
- Mobile drawer support with off-canvas slide-in and backdrop overlay.

### B. Top Navbar (`src/components/Navbar.jsx`)
- White surface (`#FFFFFF`), `64px` height with subtle bottom border (`#E7EAE8`).
- Mobile hamburger menu toggle for viewports `<= 768px`.
- Breadcrumb navigation indicating active route (e.g. `Dashboard / Overview`).
- Centralized compact search input (`Search subscriptions, invoices, customers...`).
- Utility icon actions: Help (`HelpCircle`), Messages (`MessageSquare`), Notifications (`Bell` with emerald unread dot).
- User avatar trigger with dropdown indicator.

### C. Main Layout (`src/layouts/MainLayout.jsx`)
- Responsive shell combining Navbar, Sidebar, and the `<main className="layout-content">` container.
- Background set to soft grey (`#F3F5F4`).
- Off-canvas drawer and backdrop overlay for tablet/mobile.

### D. Dashboard Page (`src/pages/DashboardPage.jsx`)
- **Header**:
  - Title: "Overview" with description: *"Here is the summary of your subscription business."*
  - Controls: Date range dropdown (Last 7 Days, Last 30 Days, Last 90 Days, YTD) and Reset button.
- **Financial Summary (4 Compact Panels)**:
  1. *Total Revenue*: `₹1,24,580` – Highlight emerald panel (`#087A4B`) with `+14.2%` badge.
  2. *Active Subscriptions*: `248` – White card with `+18 this month` badge.
  3. *Outstanding Amount*: `₹12,430` – White card with `5 invoices pending` notice.
  4. *Overdue Invoices*: `32` – White card with `Action required` overdue tag.
- **Two-Column Layout**:
  - **Left Section**:
    - *Subscription Health*: MRR (`₹94,200`), ARPU (`₹502`), Churn Rate (`1.8%`), and visual distribution bar.
    - *Upcoming Renewals (7 Days)*: List of upcoming customer subscription renewals with auto-renew status.
    - *Recent Customer Activity*: Event log of upgrades, card updates, and quotes.
  - **Right Section**:
    - *Monthly Revenue Trajectory*: Interactive `AreaChart` with Recharts using an emerald gradient fill.
    - *Payment Collections*: Settled (`₹1,12,150`) vs Pending (`₹12,430`) progress bar and payment method distribution (UPI 52%, Cards 36%, Netbanking 12%).
- **Recent Activities Table**:
  - Real-time subscription event ledger with columns: *Activity*, *Customer*, *Reference ID*, *Date*, *Amount*, *Status*.
  - Styled with status badges (Active, Pending, Overdue).

---

## 3. Route Configuration (`src/App.jsx`)

All navigation routes are wired to prevent broken links:
- `/` -> `DashboardPage`
- `/products`, `/plans`, `/subscriptions` -> Product & plan placeholders
- `/quotations`, `/invoices`, `/payments`, `/discounts` -> Finance placeholders
- `/customers`, `/reports`, `/settings` -> Management placeholders

---

## 4. Verification

- Production build test: `npm run build` completed with 0 errors.
- Dev server test: `npm run dev` starts cleanly at `http://localhost:5173`.
