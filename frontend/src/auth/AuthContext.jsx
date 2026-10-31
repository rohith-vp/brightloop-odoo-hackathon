import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authApi, tokenStore, SESSION_EXPIRED_EVENT } from '../services/api';
import { toUiUser } from './uiUser';
import { session } from '../services/session';

// Roles that may change products, variants, and plans. Matches the backend's WRITE_ROLES.
const CATALOG_WRITE_ROLES = ['ADMIN', 'STAFF'];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(() => (tokenStore.get() ? 'loading' : 'signed-out'));

  // On page load, check that the stored token still belongs to a valid account.
  useEffect(() => {
    if (!tokenStore.get()) return undefined;
    let active = true;
    authApi
      .me()
      .then((me) => {
        if (!active) return;
        setUser(me);
        setStatus('signed-in');
      })
      .catch(() => {
        if (!active) return;
        tokenStore.clear();
        setStatus('signed-out');
      });
    return () => {
      active = false;
    };
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    setStatus('signed-out');
  }, []);

  // Any request that gets a rejected token signs the user out.
  useEffect(() => {
    window.addEventListener(SESSION_EXPIRED_EVENT, logout);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, logout);
  }, [logout]);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password });
    tokenStore.set(data.access_token);
    setUser(data.user);
    setStatus('signed-in');
    return data.user;
  }, []);

  const uiUser = useMemo(() => toUiUser(user), [user]);
  // Set during render, so child pages that load data on mount already see the user.
  session.set(uiUser);

  const value = useMemo(
    () => ({
      user,
      uiUser,
      status,
      login,
      logout,
      canManageCatalog: CATALOG_WRITE_ROLES.includes(user?.role),
    }),
    [user, uiUser, status, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

// Sends signed-out visitors to /login, and remembers where they were going.
export function RequireAuth({ children }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div style={{ padding: 'var(--space-8)', color: 'var(--color-text-secondary)' }}>Checking your session…</div>
    );
  }
  if (status === 'signed-out') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
