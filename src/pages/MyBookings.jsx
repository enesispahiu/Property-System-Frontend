import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { propertyImages } from "../assets/propertyImages.js";
import {
  cancelBooking,
  getCurrentUser,
  getBookingInvoice,
  getPropertyImageUrl,
  getUserBookings,
  payBooking,
} from "../services/api.js";
import styles from "./MyBookings.module.css";

const paymentMethods = ["CARD", "CASH", "BANK_TRANSFER"];

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function money(value) {
  return `$${Number(value || 0).toLocaleString()}`;
}

function getBookingImage(booking) {
  return getPropertyImageUrl(booking.property) || propertyImages.fallback;
}

function formatStatus(value) {
  if (!value) {
    return "Pending";
  }

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getBookingStatusLabel(booking) {
  return `Status: ${formatStatus(booking.status || "PENDING")}`;
}

function getPaymentStatusLabel(booking) {
  const paymentStatus = booking.paymentStatus || "UNPAID";

  if (booking.status === "CANCELLED") {
    return "Canceled";
  }

  if (paymentStatus === "CANCELLED") {
    return "Cancelled";
  }

  return formatStatus(paymentStatus);
}

function canPayBooking(booking) {
  const bookingStatus = booking.status || "PENDING";
  const paymentStatus = booking.paymentStatus || "UNPAID";
  const payableStatuses = ["PENDING", "CONFIRMED"];
  const payablePaymentStatuses = ["UNPAID", "PENDING", "FAILED", "CANCELLED", ""];

  return (
    payableStatuses.includes(bookingStatus) &&
    payablePaymentStatuses.includes(paymentStatus) &&
    paymentStatus !== "PAID"
  );
}

function canCancelBooking(booking) {
  const bookingStatus = booking.status || "PENDING";
  return bookingStatus === "PENDING" || bookingStatus === "CONFIRMED";
}

function MyBookings() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [selectedMethods, setSelectedMethods] = useState({});
  const [payingAction, setPayingAction] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [invoice, setInvoice] = useState(null);
  const invoiceRef = useRef(null);

  async function loadBookings() {
    setIsLoading(true);
    setStatus("");

    try {
      const currentUser = await getCurrentUser();
      const data = currentUser?.id ? await getUserBookings(currentUser.id) : [];
      setUser(currentUser);
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      setStatus(error.message || "Unable to load your bookings.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  const stats = useMemo(() => {
    const active = bookings.filter((booking) => booking.status !== "CANCELLED");
    const cancelled = bookings.filter((booking) => booking.status === "CANCELLED");
    const completed = bookings.filter(
      (booking) => booking.status === "CONFIRMED" && booking.paymentStatus === "PAID",
    );
    const totalSpent = completed.reduce(
      (sum, booking) => sum + Number(booking.totalPrice || 0),
      0,
    );

    return {
      active: active.length,
      cancelled: cancelled.length,
      completed: completed.length,
      totalSpent,
    };
  }, [bookings]);

  async function handleCancel(bookingId) {
    setStatus("");

    try {
      await cancelBooking(bookingId);
      await loadBookings();
      setStatus("Booking cancelled.");
    } catch (error) {
      setStatus(error.message || "Unable to cancel booking.");
    }
  }

  async function handlePay(bookingId) {
    const method = selectedMethods[bookingId] || "CARD";
    setPayingAction(`${bookingId}:${method}`);
    setStatus("");

    try {
      await payBooking(bookingId, method);
      await loadBookings();
      setStatus(`Payment completed with ${formatStatus(method)}.`);
    } catch (error) {
      setStatus(error.message || "Unable to complete payment.");
    } finally {
      setPayingAction("");
    }
  }

  async function handleViewInvoice(bookingId) {
    setStatus("");

    try {
      setInvoice(await getBookingInvoice(bookingId));
      requestAnimationFrame(() => {
        invoiceRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    } catch (error) {
      setStatus(error.message || "Unable to load invoice.");
    }
  }

  if (isLoading) {
    return <main className={styles.state}>Loading bookings...</main>;
  }

  return (
    <main className={styles.page}>
      <section className={styles.heading}>
        <p className={styles.eyebrow}>My Bookings</p>
        <h1>Your stays and reservations</h1>
        <p>
          {user?.email ? `Signed in as ${user.email}. ` : ""}
          Track upcoming, completed, and cancelled reservations.
        </p>
      </section>

      {status ? <div className={styles.status}>{status}</div> : null}

      {invoice ? (
        <section ref={invoiceRef} className={styles.invoice}>
          <div>
            <h2>Invoice {invoice.invoiceNumber}</h2>
            <p>
              {invoice.booking?.property?.title || "Property"} -{" "}
              {formatDate(invoice.booking?.startDate)} to{" "}
              {formatDate(invoice.booking?.endDate)}
            </p>
            <span>Status: {formatStatus(invoice.status)}</span>
            <span>Payment: {formatStatus(invoice.payment?.method || "-")}</span>
            <strong>{money(invoice.totalAmount)}</strong>
          </div>
          <button type="button" onClick={() => setInvoice(null)}>
            Close
          </button>
        </section>
      ) : null}

      <section className={styles.stats}>
        <article>
          <span>Active bookings</span>
          <strong>{stats.active}</strong>
        </article>
        <article>
          <span>Completed bookings</span>
          <strong>{stats.completed}</strong>
        </article>
        <article>
          <span>Cancelled bookings</span>
          <strong>{stats.cancelled}</strong>
        </article>
        <article>
          <span>Total spent</span>
          <strong>{money(stats.totalSpent)}</strong>
        </article>
      </section>

      {bookings.length === 0 ? (
        <section className={styles.empty}>
          <h2>You have no bookings yet.</h2>
          <p>Explore properties to book your next stay.</p>
          <Link to="/explore">Explore properties</Link>
        </section>
      ) : (
        <section className={styles.list}>
          {bookings.map((booking) => {
            const propertyId = booking.property?.id || booking.propertyId;
            const bookingStatus = booking.status || "PENDING";
            const canPay = canPayBooking(booking);
            const canCancel = canCancelBooking(booking);
            const hasPaidInvoice =
              Boolean(booking.invoice) || booking.paymentStatus === "PAID";
            const showPrimaryInvoice =
              bookingStatus === "CONFIRMED" && hasPaidInvoice;
            const showReceipt =
              bookingStatus === "CANCELLED" && hasPaidInvoice;

            return (
              <article
                key={booking.id}
                className={`${styles.card} ${
                  bookingStatus === "CANCELLED" ? styles.cancelledCard : ""
                }`}
              >
                <Link
                  to={propertyId ? `/properties/${propertyId}` : "/explore"}
                  className={styles.imageLink}
                >
                  <img
                    src={getBookingImage(booking)}
                    alt={booking.property?.title || "Booked property"}
                  />
                </Link>

                <div className={styles.cardBody}>
                  <div>
                    <h2>{booking.property?.title || `Property #${booking.propertyId}`}</h2>
                    <p>{booking.property?.location || "Location unavailable"}</p>
                  </div>

                  <div className={styles.meta}>
                    <span>{formatDate(booking.startDate)} to {formatDate(booking.endDate)}</span>
                    <strong>{money(booking.totalPrice)}</strong>
                  </div>

                  <div className={styles.statusBlock}>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[`status${bookingStatus}`] || ""
                      }`}
                    >
                      {getBookingStatusLabel(booking)}
                    </span>
                    <small>Payment: {getPaymentStatusLabel(booking)}</small>
                    {booking.paymentMethod ? (
                      <small>Payment Method: {formatStatus(booking.paymentMethod)}</small>
                    ) : null}
                    <small>
                      Guests:{" "}
                      {Array.isArray(booking.guests) && booking.guests.length
                        ? booking.guests
                            .map((guest) =>
                              [guest.firstName, guest.lastName]
                                .filter((part) => part && part !== "-")
                                .join(" "),
                            )
                            .join(", ")
                        : booking.guestCount || 1}
                    </small>
                  </div>

                  <div className={styles.actions}>
                    {propertyId ? (
                      <Link to={`/properties/${propertyId}`}>View property</Link>
                    ) : null}
                    {canCancel ? (
                      <button type="button" onClick={() => handleCancel(booking.id)}>
                        Cancel booking
                      </button>
                    ) : null}
                    {showPrimaryInvoice ? (
                      <button
                        type="button"
                        onClick={() => handleViewInvoice(booking.id)}
                      >
                        View invoice
                      </button>
                    ) : null}
                    {showReceipt ? (
                      <button
                        className={styles.receiptButton}
                        type="button"
                        onClick={() => handleViewInvoice(booking.id)}
                      >
                        View receipt
                      </button>
                    ) : null}
                  </div>

                  {canPay ? (
                    <div className={styles.payment}>
                      <label>
                        Payment method
                        <select
                          value={selectedMethods[booking.id] || "CARD"}
                          onChange={(event) =>
                            setSelectedMethods((current) => ({
                              ...current,
                              [booking.id]: event.target.value,
                            }))
                          }
                        >
                          {paymentMethods.map((method) => (
                            <option key={method} value={method}>
                              {method}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        type="button"
                        onClick={() => handlePay(booking.id)}
                        disabled={payingAction.startsWith(`${booking.id}:`)}
                      >
                        {payingAction.startsWith(`${booking.id}:`)
                          ? "Paying..."
                          : "Pay now"}
                      </button>
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

export default MyBookings;
