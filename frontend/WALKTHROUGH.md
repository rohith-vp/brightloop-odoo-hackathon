# Brightloop Frontend Foundation - Setup Walkthrough

This document outlines the foundation setup completed for the **Brightloop** Subscription Management System frontend.

---

## 1. Project Initialization & Dependencies

A fresh React + Vite application using JavaScript (JSX) was initialized in the `frontend` directory.

### Installed Dependencies:
- **`react-router-dom` (`^7.18.5`)**: Client-side routing with nested layouts.
- **`lucide-react` (`^1.65.0`)**: Consistent, lightweight SVG icon set.
- **`recharts` (`^3.10.1`)**: Charting library prepared for future analytics/metrics.
- **`react` & `react-dom` (`^19.2.8`)**: Core React library.

---

## 2. Design Tokens & Styling Architecture

All design variables are centralized in `src/styles/tokens.css` (aliased at `src/tokens.css`).

### Core Colour Palette:
- **Primary**: `#243B64` (Used for sidebar, brand accents, and primary headings)
- **Secondary**: `#4F46E5` (Used for active navigation indicators and badges)
- **Background**: `#F8FAFC` (Used for root page background)

### Typography:
- **Font**: **Inter** is the exclusive font family configured across the application.
- Loaded in `index.html` via Google Fonts (`weights: 400, 500, 600, 700`).

### Spacing Scale:
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
```

### Responsive Breakpoints:
- **Mobile**: `640px`
- **Tablet**: `768px`
- **Desktop**: `1024px`
- **Large Desktop**: `1280px`

---

## 3. Folder Structure

The project structure was organized cleanly for maintainability and scalability:

```
frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/              # Static assets (images, logos)
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx       # Top navigation bar with mobile toggle
│   │   └── Sidebar.jsx      # Navigation sidebar with brand & links
│   ├── layouts/             # App-level layout wrappers
│   │   └── MainLayout.jsx   # Shell layout integrating Navbar, Sidebar, and Outlet
│   ├── pages/               # Route view components
│   │   └── DashboardPage.jsx# Initial overview landing page
│   ├── services/            # API services and business logic
│   │   └── api.js           # Base client configuration
│   ├── styles/              # Global CSS & tokens
│   │   └── tokens.css       # Centralized design tokens
│   ├── App.jsx              # React Router route configuration
│   ├── index.css            # Base styles, resets, and layout media queries
│   ├── main.jsx             # React DOM entrypoint
│   └── tokens.css           # Root-level token re-export
├── index.html               # HTML template with Inter font preconnect
├── package.json             # Scripts & dependency definitions
└── vite.config.js           # Vite build configuration
```

---

## 4. Layout Architecture

### `MainLayout.jsx`
- Manages sidebar toggle state (`sidebarOpen`).
- Provides a click-away backdrop overlay on mobile and tablet screens.
- Houses the `<Navbar />`, `<Sidebar />`, and `<main className="layout-content"><Outlet /></main>`.

### `Sidebar.jsx`
- Fixed on desktop with a fixed width of `260px` and primary `#243B64` background.
- Transforms into an off-canvas drawer on screens `<= 768px`.
- Navigation items styled with `#4F46E5` when active.

### `Navbar.jsx`
- Sticky top header at `64px` height with subtle bottom border.
- Features mobile hamburger button (`Menu` icon) that automatically hides on desktop screens.

---

## 5. Verification & Running the Project

1. **Production Build Test**:
   ```bash
   npm run build
   ```
   *Result:* Successfully transformed modules and generated production bundle in `dist/` with 0 errors.

2. **Development Server Execution**:
   ```bash
   cd frontend
   npm run dev
   ```
   Access the local preview at: `http://localhost:5173`

