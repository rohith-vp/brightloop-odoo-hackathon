# Brightloop - Frontend Architecture & Phase 2 Authentication UI

This document details the foundation setup, Phase 1 visual redesign, and **Phase 2 Authentication UI** for the **Brightloop** Subscription Management System.

---

## 1. Authentication Screens Overview

All authentication screens are wrapped inside [`src/layouts/AuthLayout.jsx`](file:///c:/Users/Rithujith/OneDrive/Desktop/maketon/frontend/src/layouts/AuthLayout.jsx) adhering to Brightloop's fintech design system (`#087A4B` Emerald Green, `#171918` Charcoal, `#F3F5F4` Soft Grey).

### Routes:
- **`/login`**: Sign-in portal with email validation, password show/hide, remember me checkbox, loading state, demo credentials auto-fill, and mock redirect to dashboard.
- **`/signup`**: Account creation with real-time password criteria checklist (8+ chars, uppercase, lowercase, special char), password matching, and simulated registration.
- **`/forgot-password`**: Password recovery with email validation, simulated link dispatch, and dedicated check-email success view with resend option.

---

## 2. Component Structure

```
frontend/src/
├── components/
│   ├── Navbar.jsx           # Compact header with breadcrumbs and user trigger
│   ├── Sidebar.jsx          # White sidebar with grouped navigation & sign-out button
│   └── PasswordInput.jsx    # Reusable input with toggleable show/hide eye icons
├── layouts/
│   ├── AuthLayout.jsx       # Centered card layout with Brightloop branding & security badge
│   └── MainLayout.jsx       # Protected shell with Sidebar, Navbar, and content container
├── pages/
│   ├── DashboardPage.jsx    # Subscription dashboard with vertical bar chart & metrics
│   ├── LoginPage.jsx        # Login page with mock authentication
│   ├── SignupPage.jsx       # Signup page with live criteria checklist
│   └── ForgotPasswordPage.jsx # Password reset page with success view
├── styles/
│   └── tokens.css           # Centralized design tokens
├── App.jsx                  # Route definitions
└── index.css                # Base styles & spin-loader keyframe
```

---

## 3. Verification & Local Testing

- **Production Build**: `npm run build` completed with 0 errors.
- **Local Dev Server**:
  ```bash
  cd frontend
  npm run dev
  ```
  - Access Dashboard: `http://localhost:5173/`
  - Access Sign In: `http://localhost:5173/login`
  - Access Sign Up: `http://localhost:5173/signup`
  - Access Forgot Password: `http://localhost:5173/forgot-password`
