import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBooking } from "../services/api.js";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  }

  async function handleSubmit(event) {
    event.preventDefault();

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

      setStatus(`Booking ${booking.status || "created"} successfully.`);
      setForm(initialForm);
      navigate("/dashboard");
    } catch (error) {
      setStatus(`Booking failed: ${error.message || "Booking could not be created."}`);
    } finally {
      setIsSubmitting(false);
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

      <button className={styles.submit} type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Reserve"}
      </button>

      {status ? <p className={styles.status}>{status}</p> : null}
    </form>
  );
}

export default BookingForm;
