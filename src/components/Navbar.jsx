import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  getCurrentUser,
  isAuthenticated,
  logout,
  onAuthChange,
} from '../services/api.js';
import styles from './Navbar.module.css';

function Navbar() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(isAuthenticated);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function syncAuth() {
      const authenticated = isAuthenticated();
      setLoggedIn(authenticated);

      if (!authenticated) {
        setUser(null);
        return;
      }

      try {
        setUser(await getCurrentUser());
      } catch {
        setUser(null);
      }
    }

    syncAuth();
    return onAuthChange(syncAuth);
  }, []);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <NavLink to="/" className={styles.brand} aria-label="StayNest home">
          <span className={styles.brandMark}>S</span>
          StayNest
        </NavLink>
        <div className={styles.links}>
          <NavLink to="/" className={({ isActive }) => (isActive ? styles.active : '')}>
            Explore
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? styles.active : '')}
          >
            Dashboard
          </NavLink>
          {user?.role === 'ADMIN' ? (
            <NavLink
              to="/admin"
              className={({ isActive }) => (isActive ? styles.active : '')}
            >
              Admin Panel
            </NavLink>
          ) : null}
        </div>
        <div className={styles.actions}>
          {loggedIn ? (
            <button className={styles.hostButton} onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `${styles.authLink} ${isActive ? styles.activeAuthLink : ''}`
                }
              >
                Login
              </NavLink>
              <NavLink to="/signup" className={styles.hostButton}>
                Signup
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
