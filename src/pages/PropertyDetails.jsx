import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BookingForm from "../components/BookingForm.jsx";
import { propertyImages } from "../assets/propertyImages.js";
import {
  createReview,
  getPropertyAverageRating,
  getPropertyById,
  getPropertyReviews,
} from "../services/api.js";
import styles from "./PropertyDetails.module.css";

function PropertyDetails() {
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: "5", comment: "" });
  const [reviewStatus, setReviewStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProperty() {
      setLoading(true);
      setError("");

      try {
        const [propertyData, reviewData, averageData] = await Promise.all([
          getPropertyById(id),
          getPropertyReviews(id).catch(() => []),
          getPropertyAverageRating(id).catch(() => null),
        ]);

        setProperty(propertyData);
        setReviews(Array.isArray(reviewData) ? reviewData : []);
        setRatingSummary(averageData);
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

  function updateReviewField(event) {
    const { name, value } = event.target;
    setReviewForm((current) => ({ ...current, [name]: value }));
    setReviewStatus("");
  }

  async function handleReviewSubmit(event) {
    event.preventDefault();
    setReviewStatus("");

    if (!reviewForm.comment.trim()) {
      setReviewStatus("Please add a short comment before posting your review.");
      return;
    }

    try {
      const review = await createReview({
        propertyId: Number(property.id),
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim(),
      });

      const [nextReviews, nextAverage] = await Promise.all([
        getPropertyReviews(property.id).catch(() => [review, ...reviews]),
        getPropertyAverageRating(property.id).catch(() => null),
      ]);

      setReviews(Array.isArray(nextReviews) ? nextReviews : [review, ...reviews]);
      setRatingSummary(nextAverage);
      setReviewForm({ rating: "5", comment: "" });
      setReviewStatus("Review posted successfully.");
    } catch (reviewError) {
      setReviewStatus(reviewError.message || "Review could not be posted.");
    }
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

  const image = property.image || property.images?.[0]?.url || propertyImages.fallback;
  const reviewCount =
    ratingSummary?.totalReviews ||
    property.totalReviews ||
    (Array.isArray(property.reviews) ? property.reviews.length : reviews.length);
  const rating =
    ratingSummary?.averageRating ||
    property.averageRating ||
    property.rating ||
    (reviews.length
      ? (
          reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
          reviews.length
        ).toFixed(1)
      : "No ratings");

  return (
    <main className={styles.container}>
      <Link to="/" className={styles.backLink}>
        Back to properties
      </Link>

      <section className={styles.hero}>
        <img
          src={image}
          alt={property.title || "Property image"}
          className={styles.image}
        />

        <div className={styles.summaryCard}>
          <span className={styles.status}>ACTIVE</span>
          <h1>{property.title || "Untitled property"}</h1>
          <p className={styles.location}>{property.location}</p>

          <div className={styles.priceRow}>
            <span className={styles.price}>${property.price}</span>
            <span className={styles.perNight}>/ night</span>
          </div>

          <div className={styles.metaGrid}>
            <div>
              <strong>{rating}</strong>
              <span>Rating</span>
            </div>
            <div>
              <strong>{reviewCount}</strong>
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
        <p>{property.description || "No description available for this property."}</p>
      </section>

      <section className={styles.section}>
        <h2>Amenities</h2>

        {property.amenities?.length ? (
          <ul className={styles.amenities}>
            {property.amenities.map((amenity, index) => (
              <li key={amenity.id || amenity.name || index}>
                {amenity.name || amenity.amenity?.name || amenity}
              </li>
            ))}
          </ul>
        ) : (
          <p>No amenities listed for this property.</p>
        )}
      </section>

      <section className={styles.section}>
        <h2>Reserve this stay</h2>
        <BookingForm property={property} />
      </section>

      <section className={styles.section}>
        <h2>Reviews</h2>

        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <div className={styles.reviews}>
            {reviews.map((review) => (
              <article
                key={review.id || `${review.rating}-${review.comment}`}
                className={styles.review}
              >
                <strong>{review.rating}/5</strong>
                <p>{review.comment}</p>
              </article>
            ))}
          </div>
        )}

        <form className={styles.reviewForm} onSubmit={handleReviewSubmit}>
          <label>
            Rating
            <select
              name="rating"
              value={reviewForm.rating}
              onChange={updateReviewField}
            >
              <option value="5">5</option>
              <option value="4">4</option>
              <option value="3">3</option>
              <option value="2">2</option>
              <option value="1">1</option>
            </select>
          </label>
          <label>
            Comment
            <textarea
              name="comment"
              value={reviewForm.comment}
              onChange={updateReviewField}
              required
            />
          </label>
          <button className={styles.shareButton} type="submit">
            Post review
          </button>
          {reviewStatus ? <p className={styles.reviewStatus}>{reviewStatus}</p> : null}
        </form>
      </section>
    </main>
  );
}

export default PropertyDetails;
