import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './Navbar.module.css';

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();

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
          {user?.role === 'SUPER_ADMIN' || user?.role === 'TENANT_ADMIN' ? (
            <NavLink
              to={user?.role === 'SUPER_ADMIN' ? '/platform' : '/admin'}
              className={({ isActive }) => (isActive ? styles.active : '')}
            >
              {user?.role === 'SUPER_ADMIN' ? 'Platform Admin' : 'Business Admin'}
            </NavLink>
          ) : null}
        </div>
        <div className={styles.actions}>
          {isAuthenticated ? (
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
