import { useEffect, useMemo, useState } from "react";
import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/api.js";
import styles from "./Notifications.module.css";

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getCategory(type = "") {
  if (type.includes("PAYMENT")) {
    return "Payment";
  }

  if (type.includes("REVIEW")) {
    return "Review";
  }

  if (type.includes("BOOKING")) {
    return "Booking";
  }

  if (type.includes("PROPERTY") || type.includes("AVAILABILITY")) {
    return "Property";
  }

  if (type.includes("PLATFORM") || type.includes("TENANT")) {
    return "Platform";
  }

  return type || "Update";
}

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadNotifications() {
    setIsLoading(true);
    setStatus("");

    try {
      const data = await getMyNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      setStatus(error.message || "Unable to load notifications.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.readAt).length,
    [notifications],
  );

  async function handleMarkRead(id) {
    try {
      await markNotificationRead(id);
      await loadNotifications();
    } catch (error) {
      setStatus(error.message || "Unable to mark notification as read.");
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead();
      await loadNotifications();
    } catch (error) {
      setStatus(error.message || "Unable to mark notifications as read.");
    }
  }

  if (isLoading) {
    return <main className={styles.state}>Loading notifications...</main>;
  }

  return (
    <main className={styles.page}>
      <section className={styles.heading}>
        <p className={styles.eyebrow}>Notifications</p>
        <h1>Activity updates</h1>
        <p>{unreadCount} unread notifications.</p>
      </section>

      {status ? <div className={styles.status}>{status}</div> : null}

      <div className={styles.actions}>
        <button
          type="button"
          onClick={handleMarkAllRead}
          disabled={!unreadCount}
        >
          Mark all as read
        </button>
        <button type="button" onClick={loadNotifications}>
          Refresh
        </button>
      </div>

      {notifications.length === 0 ? (
        <section className={styles.empty}>No notifications yet.</section>
      ) : (
        <section className={styles.list}>
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={`${styles.card} ${
                notification.readAt ? styles.read : styles.unread
              }`}
            >
              <div>
                <div className={styles.meta}>
                  <span className={styles.category}>
                    {getCategory(notification.type)}
                  </span>
                  <span>{formatDate(notification.createdAt)}</span>
                </div>
                <strong>{notification.title}</strong>
                <p>{notification.message}</p>
              </div>
              {!notification.readAt ? (
                <button
                  type="button"
                  onClick={() => handleMarkRead(notification.id)}
                >
                  Mark read
                </button>
              ) : (
                <span className={styles.readLabel}>Read</span>
              )}
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default Notifications;
