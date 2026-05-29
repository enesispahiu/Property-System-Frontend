import { Link, useLocation } from "react-router-dom";
import styles from "./Footer.module.css";

const columns = [
  {
    title: "Quick Links",
    links: [
      { label: "Explore", to: "/explore" },
      { label: "My Bookings", to: "/my-bookings" },
      { label: "My Favorites", to: "/my-favorites" },
      { label: "My Reviews", to: "/my-reviews" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help center" },
      { label: "Safety information" },
      { label: "Cancellation options" },
    ],
  },
  {
    title: "Hosting",
    links: [
      { label: "List your property" },
      { label: "Host resources" },
      { label: "Responsible hosting" },
    ],
  },
];

function Footer() {
  const location = useLocation();
  const isAdminPage =
    location.pathname === "/admin" ||
    location.pathname === "/platform" ||
    location.pathname.startsWith("/business") ||
    location.pathname.startsWith("/platform/");

  return (
    <footer className={`${styles.footer} ${isAdminPage ? styles.compact : ""}`}>
      <div className={styles.inner}>
        <div className={styles.brandBlock}>
          <Link to="/" className={styles.brand}>
            <span>S</span>
            StayNest
          </Link>
          <p>Find stays, cabins, villas, and city apartments across Kosovo and beyond.</p>
          <small>Demo platform for Distributed Systems 2025/26.</small>
        </div>

        <div className={styles.columns}>
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2>{column.title}</h2>
              {column.links.map((link) =>
                link.to ? (
                  <Link key={link.label} to={link.to}>
                    {link.label}
                  </Link>
                ) : (
                  <span key={link.label}>{link.label}</span>
                ),
              )}
            </nav>
          ))}
          <address className={styles.contact}>
            <h2>Contact Us</h2>
            <a href="mailto:support@staynest.com">support@staynest.com</a>
            <a href="tel:+38344123456">+383 44 123 456</a>
            <span>Prishtina, Kosovo</span>
          </address>
        </div>

        <div className={styles.bottom}>
          <span>© 2026 Property Rental System</span>
          <span>Language: English</span>
          <span>Currency: EUR</span>
          <span>Instagram · Facebook · LinkedIn</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
