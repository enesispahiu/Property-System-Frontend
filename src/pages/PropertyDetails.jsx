import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import BookingForm from "../components/BookingForm.jsx";
import { propertyImages } from "../assets/propertyImages.js";
import { useAuth } from "../context/AuthContext.jsx";
import {
  addFavorite,
  createReview,
  getMyFavorites,
  getPropertyAverageRating,
  getPropertyById,
  getPropertyReviews,
  isAuthenticated,
  removeFavorite,
} from "../services/api.js";
import styles from "./PropertyDetails.module.css";

function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [favoriteStatus, setFavoriteStatus] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: "5", comment: "" });
  const [reviewStatus, setReviewStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProperty() {
      setLoading(true);
      setError("");

      try {
        const shouldLoadFavorites = isAuthenticated() && user?.role === "USER";
        const [propertyData, reviewData, averageData, favoriteData] = await Promise.all([
          getPropertyById(id),
          getPropertyReviews(id).catch(() => []),
          getPropertyAverageRating(id).catch(() => null),
          shouldLoadFavorites ? getMyFavorites().catch(() => []) : Promise.resolve([]),
        ]);

        if (!propertyData) {
          setError("Property not found.");
          return;
        }

        setProperty(propertyData);
        setReviews(Array.isArray(reviewData) ? reviewData : []);
        setRatingSummary(averageData);
        setIsSaved(
          Array.isArray(favoriteData) &&
            favoriteData.some(
              (favorite) => String(favorite.property?.id) === String(propertyData.id),
            ),
        );
      } catch (err) {
        setError(err.message || "Failed to load property");
      } finally {
        setLoading(false);
      }
    }

    loadProperty();
  }, [id, user?.role]);

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href);
    alert("Property link copied.");
  }

  async function handleFavoriteToggle() {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    if (user?.role !== "USER") {
      setFavoriteStatus("Favorites are available only for customer accounts.");
      return;
    }

    setIsSaving(true);
    setFavoriteStatus("");

    try {
      if (isSaved) {
        await removeFavorite(property.id);
        setIsSaved(false);
        setFavoriteStatus("Removed from saved properties.");
      } else {
        await addFavorite(property.id);
        setIsSaved(true);
        setFavoriteStatus("Saved.");
      }
    } catch (favoriteError) {
      setFavoriteStatus(
        favoriteError.message || "Saved property could not be updated.",
      );
    } finally {
      setIsSaving(false);
    }
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

  const propertyReviews = Array.isArray(property.reviews) ? property.reviews : [];
  const pageReviews = Array.isArray(reviews) ? reviews : [];
  const propertyAmenities = Array.isArray(property.amenities)
    ? property.amenities
    : [];
  const image =
    property.imageUrl ||
    property.images?.[0]?.url ||
    property.images?.[0]?.imageUrl ||
    property.image ||
    propertyImages.fallback;
  const reviewCount =
    ratingSummary?.totalReviews ||
    property.totalReviews ||
    propertyReviews.length ||
    pageReviews.length;
  const rating =
    ratingSummary?.averageRating ||
    property.averageRating ||
    property.rating ||
    (pageReviews.length
      ? (
          pageReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
          pageReviews.length
        ).toFixed(1)
      : "No ratings");
  const role = user?.role;
  const canUseCustomerActions = role === "USER";
  const isAdminPreview = role === "TENANT_ADMIN" || role === "SUPER_ADMIN";
  const canManageProperty =
    role === "TENANT_ADMIN" && String(property.tenantId) === String(user?.tenantId);

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
          {canUseCustomerActions ? (
            <>
              <button
                className={isSaved ? styles.savedButton : styles.saveButton}
                onClick={handleFavoriteToggle}
                disabled={isSaving}
                type="button"
              >
                {isSaving ? "Saving..." : isSaved ? "Saved" : "Save"}
              </button>
              {favoriteStatus ? (
                <p className={styles.favoriteStatus}>{favoriteStatus}</p>
              ) : null}
            </>
          ) : null}
          {!user ? (
            <Link to="/login" className={styles.saveButton}>
              Login to save or book
            </Link>
          ) : null}
          {isAdminPreview ? (
            <p className={styles.previewNotice}>
              Preview mode: customer booking and favorite actions are hidden.
            </p>
          ) : null}
          {canManageProperty ? (
            <Link to="/admin" className={styles.manageLink}>
              Manage this listing
            </Link>
          ) : null}
        </div>
      </section>

      <section className={styles.section}>
        <h2>About this property</h2>
        <p>{property.description || "No description available for this property."}</p>
      </section>

      <section className={styles.section}>
        <h2>Amenities</h2>

        {propertyAmenities.length ? (
          <ul className={styles.amenities}>
            {propertyAmenities.map((amenity, index) => {
              const amenityLabel =
                amenity?.name || amenity?.amenity?.name || "Amenity";

              return (
                <li key={amenity?.id || amenityLabel || index}>
                  {amenityLabel}
                </li>
              );
            })}
          </ul>
        ) : (
          <p>No amenities listed for this property.</p>
        )}
      </section>

      <section className={styles.section}>
        <h2>Reserve this stay</h2>
        {canUseCustomerActions ? (
          <BookingForm property={property} />
        ) : !user ? (
          <p>
            Please <Link to="/login">login</Link> with a customer account to reserve
            this stay.
          </p>
        ) : (
          <p>Booking is available only for customer accounts.</p>
        )}
      </section>

      <section className={styles.section}>
        <h2>Reviews</h2>

        {pageReviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <div className={styles.reviews}>
            {pageReviews.map((review) => (
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

        {canUseCustomerActions ? (
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
        ) : !user ? (
          <p>
            Please <Link to="/login">login</Link> with a customer account to leave a
            review.
          </p>
        ) : (
          <p>Reviews can be posted only from customer accounts.</p>
        )}
      </section>
    </main>
  );
}

export default PropertyDetails;
