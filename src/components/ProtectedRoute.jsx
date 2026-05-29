import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import styles from "./ProtectedRoute.module.css";

function ProtectedRoute({ allowedRoles = [], children }) {
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <main className={styles.state}>Checking access...</main>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <main className={styles.state}>
        <section className={styles.card}>
          <p className={styles.eyebrow}>Access denied</p>
          <h1>This page is not available for your role.</h1>
          <p>Return to your dashboard to continue with the tools assigned to you.</p>
          <Link to="/dashboard">Go to dashboard</Link>
        </section>
      </main>
    );
  }

  return children;
}

export default ProtectedRoute;
