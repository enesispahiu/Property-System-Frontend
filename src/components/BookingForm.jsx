import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBooking, payBooking } from "../services/api.js";
import styles from "./BookingForm.module.css";

const initialForm = {
  startDate: "",
  endDate: "",
  guests: "1",
};

function getNights(startDate, endDate) {
  if (!startDate || !endDate) {
    return 0;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const difference = end.getTime() - start.getTime();

  return difference > 0 ? Math.ceil(difference / (1000 * 60 * 60 * 24)) : 0;
}

function validateBooking(form) {
  const errors = {};

  if (!form.startDate) {
    errors.startDate = "Check-in date is required.";
  }

  if (!form.endDate) {
    errors.endDate = "Check-out date is required.";
  }

  if (
    form.startDate &&
    form.endDate &&
    getNights(form.startDate, form.endDate) < 1
  ) {
    errors.endDate = "Check-out must be after check-in.";
  }

  if (Number(form.guests) < 1) {
    errors.guests = "At least one guest is required.";
  }

  return errors;
}

function BookingForm({ property }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [createdBooking, setCreatedBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const isDemoProperty = Boolean(property?.isMock);
  const pricePerNight = Number(property?.price || 0);
  const nights = useMemo(
    () => getNights(form.startDate, form.endDate),
    [form.startDate, form.endDate],
  );
  const totalPrice = nights * pricePerNight;

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setStatus("");
    setPaymentStatus("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isDemoProperty) {
      setStatus(
        "This demo property cannot be booked because it does not exist in the backend.",
      );
      return;
    }

    const nextErrors = validateBooking(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setStatus("");

    try {
      const propertyId = Number(property.id);

      if (Number.isNaN(propertyId)) {
        setStatus(
          "This property cannot be booked because it does not have a valid database ID.",
        );
        return;
      }

      const booking = await createBooking({
        propertyId,
        startDate: form.startDate,
        endDate: form.endDate,
      });

      setCreatedBooking(booking);
      setStatus("Reservation created. Complete payment to confirm your booking.");
      setForm(initialForm);
    } catch (error) {
      setStatus(`Booking failed: ${error.message || "Booking could not be created."}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePay() {
    if (!createdBooking?.id) {
      return;
    }

    setIsPaying(true);
    setPaymentStatus("");

    try {
      const result = await payBooking(createdBooking.id, paymentMethod);
      setCreatedBooking(result.booking || createdBooking);
      setPaymentStatus("Payment completed. Your booking is confirmed.");
    } catch (error) {
      setPaymentStatus(
        `Payment failed: ${error.message || "Payment could not be completed."}`,
      );
    } finally {
      setIsPaying(false);
    }
  }

  if (!property) {
    return null;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.price}>
        <strong>${pricePerNight}</strong>
        <span>/ night</span>
      </div>

      <div className={styles.dates}>
        <label>
          <span>Check in</span>
          <input
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={updateField}
            aria-invalid={Boolean(errors.startDate)}
          />
          {errors.startDate ? <small>{errors.startDate}</small> : null}
        </label>

        <label>
          <span>Check out</span>
          <input
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={updateField}
            aria-invalid={Boolean(errors.endDate)}
          />
          {errors.endDate ? <small>{errors.endDate}</small> : null}
        </label>
      </div>

      <label>
        <span>Guests</span>
        <input
          name="guests"
          type="number"
          min="1"
          value={form.guests}
          onChange={updateField}
          aria-invalid={Boolean(errors.guests)}
        />
        {errors.guests ? <small>{errors.guests}</small> : null}
      </label>

      <div className={styles.summary}>
        <span>{nights || 0} nights</span>
        <strong>${totalPrice.toFixed(2)}</strong>
      </div>

      <button
        className={styles.submit}
        type="submit"
        disabled={isSubmitting || isDemoProperty}
      >
        {isSubmitting ? "Submitting..." : "Reserve"}
      </button>

      <p className={styles.paymentNote}>
        Reservation will be pending until payment is completed.
      </p>

      {isDemoProperty ? (
        <p className={styles.status}>
          This demo property cannot be booked because it does not exist in the backend.
        </p>
      ) : status ? (
        <p className={styles.status}>{status}</p>
      ) : null}

      {createdBooking ? (
        <section className={styles.paymentBox} aria-label="Complete payment">
          <div>
            <h3>Complete payment</h3>
            <p>
              {createdBooking.property?.title || property.title} -{" "}
              <strong>${Number(createdBooking.totalPrice || totalPrice).toFixed(2)}</strong>
            </p>
            <span>Status: {createdBooking.status || "PENDING"}</span>
          </div>

          {createdBooking.status === "CONFIRMED" ? null : (
            <>
              <label>
                <span>Payment method</span>
                <select
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                >
                  <option value="CARD">CARD</option>
                  <option value="CASH">CASH</option>
                  <option value="BANK_TRANSFER">BANK_TRANSFER</option>
                </select>
              </label>

              <button
                className={styles.payButton}
                type="button"
                onClick={handlePay}
                disabled={isPaying}
              >
                {isPaying ? "Processing..." : "Pay"}
              </button>
            </>
          )}

          {paymentStatus ? (
            <p className={styles.paymentSuccess}>{paymentStatus}</p>
          ) : null}

          {createdBooking.status === "CONFIRMED" ? (
            <button
              className={styles.dashboardButton}
              type="button"
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard
            </button>
          ) : null}
        </section>
      ) : null}
    </form>
  );
}

export default BookingForm;
