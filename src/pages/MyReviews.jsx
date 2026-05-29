import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { propertyImages } from "../assets/propertyImages.js";
import { getCurrentUser, getProperties, getPropertyReviews } from "../services/api.js";
import styles from "./MyReviews.module.css";

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

function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function loadReviews() {
      setIsLoading(true);
      setStatus("");

      try {
        const user = await getCurrentUser();
        const properties = await getProperties({ page: 1, limit: 500 }).catch(
          () => [],
        );
        const reviewGroups = await Promise.all(
          properties.map((property) =>
            getPropertyReviews(property.id)
              .then((items) =>
                Array.isArray(items)
                  ? items.map((review) => ({
                      ...review,
                      propertyId: review.propertyId || property.id,
                      property: {
                        ...property,
                        ...(review.property || {}),
                      },
                    }))
                  : [],
              )
              .catch(() => []),
          ),
        );

        setReviews(
          reviewGroups
            .flat()
            .filter((review) => review.userId === user.id)
            .sort(
              (left, right) =>
                new Date(right.createdAt || 0) - new Date(left.createdAt || 0),
            ),
        );
      } catch (error) {
        setStatus(error.message || "Unable to load your reviews.");
      } finally {
        setIsLoading(false);
      }
    }

    loadReviews();
  }, []);

  if (isLoading) {
    return <main className={styles.state}>Loading reviews...</main>;
  }

  return (
    <main className={styles.page}>
      <section className={styles.heading}>
        <p className={styles.eyebrow}>Customer reviews</p>
        <h1>My Reviews</h1>
        <p>Reviews you have written for properties you visited or reserved.</p>
      </section>

      {status ? <div className={styles.status}>{status}</div> : null}

      {reviews.length === 0 ? (
        <section className={styles.empty}>
          <h2>You have not written any reviews yet.</h2>
          <p>Open a property page after your stay and share your feedback.</p>
          <Link to="/explore">Explore properties</Link>
        </section>
      ) : (
        <section className={styles.list}>
          {reviews.map((review) => {
            const image =
              review.property?.imageUrl ||
              review.property?.images?.[0]?.url ||
              review.property?.images?.[0]?.imageUrl ||
              review.property?.image ||
              propertyImages.fallback;

            return (
              <article key={review.id} className={styles.card}>
                <Link
                  to={review.propertyId ? `/properties/${review.propertyId}` : "/explore"}
                  className={styles.imageLink}
                >
                  <img
                    src={image}
                    alt={review.property?.title || "Reviewed property"}
                  />
                </Link>

                <div className={styles.cardBody}>
                  <div className={styles.cardHeader}>
                    <div>
                      <h2>{review.property?.title || `Property #${review.propertyId}`}</h2>
                      <p>{review.property?.location || "Location unavailable"}</p>
                    </div>
                    <span className={styles.rating}>{review.rating}/5</span>
                  </div>

                  <p className={styles.comment}>{review.comment}</p>
                  <span className={styles.date}>{formatDate(review.createdAt)}</span>

                  {review.propertyId ? (
                    <Link to={`/properties/${review.propertyId}`}>View property</Link>
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

export default MyReviews;
