import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BookingForm from "../components/BookingForm.jsx";
import { getPropertyById } from "../services/api.js";
import styles from "./PropertyDetails.module.css";

function PropertyDetails() {
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProperty() {
      setLoading(true);
      setError("");

      try {
        const data = await getPropertyById(id);
        setProperty(data);
      } catch (err) {
        setError(err.message || "Failed to load property");
      } finally {
        setLoading(false);
      }
    }

    loadProperty();
  }, [id]);

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href);
    alert("Property link copied.");
  }

  if (loading) {
    return <div className={styles.state}>Loading property...</div>;
  }

  if (error) {
    return <div className={styles.state}>{error}</div>;
  }

  if (!property) {
    return <div className={styles.state}>Property not found</div>;
  }

  return (
    <main className={styles.container}>
      <Link to="/" className={styles.backLink}>
        Back to properties
      </Link>

      <section className={styles.hero}>
        <img
          src={property.image}
          alt={property.title}
          className={styles.image}
        />

        <div className={styles.summaryCard}>
          <span className={styles.status}>{property.status || "ACTIVE"}</span>
          <h1>{property.title}</h1>
          <p className={styles.location}>{property.location}</p>

          <div className={styles.priceRow}>
            <span className={styles.price}>${property.price}</span>
            <span className={styles.perNight}>/ night</span>
          </div>

          <div className={styles.metaGrid}>
            <div>
              <strong>{property.rating || "4.8"}</strong>
              <span>Rating</span>
            </div>
            <div>
              <strong>{property.reviews || 0}</strong>
              <span>Reviews</span>
            </div>
            <div>
              <strong>{property.guests || "-"}</strong>
              <span>Guests</span>
            </div>
            <div>
              <strong>{property.bedrooms || "-"}</strong>
              <span>Bedrooms</span>
            </div>
          </div>

          <button className={styles.shareButton} onClick={handleCopyLink}>
            Share property
          </button>
        </div>
      </section>

      <section className={styles.section}>
        <h2>About this property</h2>
        <p>{property.description}</p>
      </section>

      <section className={styles.section}>
        <h2>Amenities</h2>

        {property.amenities?.length ? (
          <ul className={styles.amenities}>
            {property.amenities.map((amenity, index) => (
              <li key={index}>{amenity}</li>
            ))}
          </ul>
        ) : (
          <p>No amenities listed for this property.</p>
        )}
      </section>

      <section className={styles.bookingSection}>
        <div>
          <h2>Reserve this stay</h2>
          <p>Choose dates and submit a booking with your signed-in account.</p>
        </div>
        <BookingForm property={property} />
      </section>
    </main>
  );
}

export default PropertyDetails;
