import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './Navbar.module.css';

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const role = user?.role;

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const linksByRole = {
    USER: [
      { to: '/explore', label: 'Explore' },
      { to: '/my-bookings', label: 'My Bookings' },
      { to: '/my-favorites', label: 'My Favorites' },
      { to: '/my-reviews', label: 'My Reviews' },
      { to: '/notifications', label: 'Notifications' },
    ],
    TENANT_ADMIN: [
      { to: '/dashboard', label: 'Business Dashboard' },
      { to: '/business/operations', label: 'Business Operations' },
      { to: '/business/reviews', label: 'Guest Reviews' },
      { to: '/notifications', label: 'Notifications' },
    ],
    SUPER_ADMIN: [
      { to: '/dashboard', label: 'Platform Dashboard' },
      { to: '/platform/tenant-management', label: 'Tenant Management' },
      { to: '/platform/search-analytics', label: 'Search Analytics' },
      { to: '/notifications', label: 'Notifications' },
    ],
  };

  const navLinks = isAuthenticated
    ? linksByRole[role] || [{ to: '/', label: 'Explore Stays' }]
    : [{ to: '/explore', label: 'Explore' }];

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <NavLink to="/" className={styles.brand} aria-label="StayNest home">
          <span className={styles.brandMark}>S</span>
          StayNest
        </NavLink>
        <div className={styles.links}>
          {navLinks.map((link) => (
            <NavLink
              key={`${link.to}-${link.label}`}
              to={link.to}
              className={({ isActive }) => (isActive ? styles.active : '')}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
        <div className={styles.actions}>
          {isAuthenticated ? (
            <button className={styles.logoutButton} onClick={handleLogout}>
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
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
