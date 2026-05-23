import { useEffect, useState } from "react";
import { cancelBooking, getDashboardSummary } from "../services/api.js";
import styles from "./Dashboard.module.css";

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setIsLoading(true);
    setError("");

    try {
      const data = await getDashboardSummary();
      setSummary(data);
    } catch (requestError) {
      setError(requestError.message || "Unable to load dashboard.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleCancel(bookingId) {
    try {
      await cancelBooking(bookingId);
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.message || "Unable to cancel booking.");
    }
  }

  if (isLoading) {
    return <main className={styles.state}>Loading dashboard...</main>;
  }

  if (error) {
    return <main className={styles.state}>{error}</main>;
  }

  const bookings = summary?.bookings || [];
  const cancelledBookings = bookings.filter(
    (booking) => booking.status === "CANCELLED",
  ).length;

  return (
    <main className={styles.page}>
      <section className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>Traveler dashboard</p>
          <h1>Your profile and bookings</h1>
          <p>
            Signed in as <strong>{summary.user?.email}</strong>
            {summary.user?.role ? ` (${summary.user.role})` : ""}
          </p>
        </div>
        <div className={styles.tenantBadge}>
          Tenant #{summary.user?.tenantId || "-"}
        </div>
      </section>

      <section className={styles.stats}>
        <article>
          <span>Active bookings</span>
          <strong>{summary.upcomingTrips}</strong>
        </article>
        <article>
          <span>Cancelled</span>
          <strong>{cancelledBookings}</strong>
        </article>
        <article>
          <span>Total spent</span>
          <strong>${Number(summary.totalSpent || 0).toLocaleString()}</strong>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>User bookings</h2>
            <p>{bookings.length} booking records</p>
          </div>
          <button type="button" onClick={loadDashboard}>
            Refresh
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className={styles.empty}>No bookings yet.</div>
        ) : (
          <div className={styles.bookings}>
            {bookings.map((booking) => (
              <article key={booking.id} className={styles.booking}>
                <div>
                  <h3>{booking.property?.title || `Booking #${booking.id}`}</h3>
                  <p>
                    {formatDate(booking.startDate)} -{" "}
                    {formatDate(booking.endDate)}
                  </p>
                </div>

                <div className={styles.bookingMeta}>
                  <strong>${Number(booking.totalPrice || 0).toFixed(2)}</strong>
                  <span>{booking.status}</span>
                </div>

                {booking.status !== "CANCELLED" ? (
                  <button
                    type="button"
                    onClick={() => handleCancel(booking.id)}
                  >
                    Cancel
                  </button>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Dashboard;
