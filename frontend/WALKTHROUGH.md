# Brightloop - Frontend Architecture & Global Typography Scale

This document outlines the foundation setup, visual redesign, authentication UI, Products module, and **Global Typography Scale Improvements** for the **Brightloop** Subscription Management System.

---

## 1. Global Typography Scale

The typography scale across all Brightloop pages has been improved to ensure optimal legibility, comfortable reading, and clear visual hierarchy without crowding the layout:

| Element | Font Size | Weight | CSS Variable |
| :--- | :--- | :--- | :--- |
| **Main page headings** | `28–30px` | `600` | `--font-size-heading-main` |
| **Section headings** | `21–23px` | `600` | `--font-size-heading-section` |
| **Card headings** | `17–19px` | `600` | `--font-size-heading-card` |
| **Body text** | `15–16px` | `400` | `--font-size-body` |
| **Table content** | `15px` | `400` | `--font-size-table-content` |
| **Table headers** | `14px` | `600` | `--font-size-table-header` |
| **Form labels** | `15px` | `500` | `--font-size-form-label` |
| **Input text** | `16px` | `400` | `--font-size-input` |
| **Buttons** | `15–16px` | `500` | `--font-size-button` |
| **Sidebar navigation** | `15–16px` | `500` | `--font-size-nav` |
| **Navbar text** | `15px` | `500` | `--font-size-navbar` |
| **Helper / Subtitle text** | `13–14px` | `400` | `--font-size-helper` |
| **Small status badges** | `13px` | `500` | `--font-size-badge` |
| **Dashboard metric values** | `28–30px` | `700` | `--font-size-metric-value` |
| **Dashboard metric labels** | `14–15px` | `500` | `--font-size-metric-label` |
| **Sidebar section labels** | `13px` | `600` | `--font-size-section-label` |

---

## 2. Page & Component Harmonization

1. **Dashboard ([`DashboardPage.jsx`](file:///c:/Users/Rithujith/OneDrive/Desktop/maketon/frontend/src/pages/DashboardPage.jsx))**:
   - Header title scaled to `28–30px` (`var(--font-size-heading-main)`), subtitle to `15px`.
   - Financial metric numbers increased to `28–30px` with labels at `14–15px`.
   - Card headers styled at `18px`, inner metric numbers at `18px`, and activity items at `14–15px`.
   - Bar chart X/Y axis labels, tooltip text, and filter buttons scaled to `12–14px`.
   - Recent Activities table updated with `14px` headers and `15px` row text.

2. **Products Catalog & Modals ([`ProductsPage.jsx`](file:///c:/Users/Rithujith/OneDrive/Desktop/maketon/frontend/src/pages/ProductsPage.jsx), [`ProductModal.jsx`](file:///c:/Users/Rithujith/OneDrive/Desktop/maketon/frontend/src/components/ProductModal.jsx))**:
   - Page title `28–30px`, description `15px`.
   - Catalog table rows set to `15px` with generous cell padding (`14px 18px`).
   - Modal headers `22px`, form labels `15px`, inputs `16px` with comfortable `46px` height.
   - Variant rows and details tables styled with `14–15px` text and `13px` badges.

3. **Authentication Screens ([`LoginPage.jsx`](file:///c:/Users/Rithujith/OneDrive/Desktop/maketon/frontend/src/pages/LoginPage.jsx), [`SignupPage.jsx`](file:///c:/Users/Rithujith/OneDrive/Desktop/maketon/frontend/src/pages/SignupPage.jsx), [`ForgotPasswordPage.jsx`](file:///c:/Users/Rithujith/OneDrive/Desktop/maketon/frontend/src/pages/ForgotPasswordPage.jsx))**:
   - Auth screen titles set to `28–30px`, supporting text `15px`.
   - Form field labels at `15px`, inputs at `16px` (`46px` height).
   - Password criteria list items set to `13–14px`.
   - Submit buttons at `15–16px` (`46px` height).

4. **Navigation Shell ([`Sidebar.jsx`](file:///c:/Users/Rithujith/OneDrive/Desktop/maketon/frontend/src/components/Sidebar.jsx), [`Navbar.jsx`](file:///c:/Users/Rithujith/OneDrive/Desktop/maketon/frontend/src/components/Navbar.jsx))**:
   - Sidebar navigation links set to `15px` with proportionate `18px` Lucide icons.
   - Sidebar section group headers set to `13px` (`--font-size-section-label`).
   - Top navbar breadcrumbs and profile trigger set to `15px`.

5. **Plans Module ([`PlansPage.jsx`](file:///c:/Users/Rithujith/OneDrive/Desktop/maketon/frontend/src/pages/PlansPage.jsx), [`PlanModal.jsx`](file:///c:/Users/Rithujith/OneDrive/Desktop/maketon/frontend/src/components/PlanModal.jsx), [`PlanViewModal.jsx`](file:///c:/Users/Rithujith/OneDrive/Desktop/maketon/frontend/src/components/PlanViewModal.jsx))**:
   - Plans overview cards for Total Plans, Active Plans, Monthly Plans, and Expired Plans.
   - Comprehensive plans table with Plan Name, Product association, Billing Cycle, Price (₹), Min Quantity, Availability period, Status, and Actions (View, Edit, Delete).
   - Real-time search by plan name, frequency filter (Daily, Weekly, Monthly, Yearly), and status filter (Active, Inactive, Expired).
   - Create/Edit Plan Form supporting:
     - Basic Information (Plan Name, Description, Associated Product dropdown dynamically fed from Product catalog).
     - Billing Frequency (Daily, Weekly, Monthly, Yearly).
     - Pricing & Minimum Quantity (with non-negative validation).
     - Availability dates (Start Date, End Date with end date >= start date validation).
     - Full Lifecycle Configuration: Closure (immediately vs end of period), Allow early closure toggle, Allow pause toggle, Renewal policy (automatic vs manual, and enable/disable toggle).
   - Mock data service ([`planService.js`](file:///c:/Users/Rithujith/OneDrive/Desktop/maketon/frontend/src/services/planService.js)) with `localStorage` persistence.

---

## 3. Verification

- Production build test: `npm run build` completed with **0 errors**.
- Local dev server tested with `npm run dev`.
- All changes kept local in the working tree (no git commit or push performed per user instruction).
