import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { authService, USER_ROLES } from '../services/authService.js';

export default function MainLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login');
    } else if (user.role === USER_ROLES.CUSTOMER) {
      // Strictly prevent customers from accessing admin / staff console
      navigate('/portal');
    }
  }, [navigate]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="app-layout">
      {/* Mobile sidebar overlay */}
      <div
        className={`layout-sidebar-backdrop ${sidebarOpen ? 'active' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Navigation Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main Content Area */}
      <div className="layout-main-wrapper">
        <Navbar onToggleSidebar={toggleSidebar} />
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
