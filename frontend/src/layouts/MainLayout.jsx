import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../auth/AuthContext';
import { UI_ROLES } from '../auth/uiUser';

export default function MainLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { uiUser } = useAuth();

  useEffect(() => {
    if (!uiUser) {
      navigate('/login');
    } else if (uiUser.role === UI_ROLES.CUSTOMER) {
      // Customers never see the admin and staff console.
      navigate('/portal');
    }
  }, [navigate, uiUser]);

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
