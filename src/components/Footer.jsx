import { Link, useLocation } from "react-router-dom";
import styles from "./Footer.module.css";

const columns = [
  {
    title: "Company",
    links: ["About us", "How it works", "Careers", "Blog"],
  },
  {
    title: "Support",
    links: ["Help center", "Contact", "Safety information", "Cancellation options"],
  },
  {
    title: "Hosting",
    links: ["List your property", "Host resources", "Responsible hosting", "Tenant dashboard"],
  },
  {
    title: "Legal",
    links: ["Terms", "Privacy", "Cookies", "Accessibility"],
  },
];

function Footer() {
  const location = useLocation();
  const isAdminPage = location.pathname === "/admin" || location.pathname === "/platform";

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
              {column.links.map((link) => (
                <a key={link} href="#">
                  {link}
                </a>
              ))}
            </nav>
          ))}
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
