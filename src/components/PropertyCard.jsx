import { Link } from "react-router-dom";
import { propertyImages } from "../assets/propertyImages.js";
import { useAuth } from "../context/AuthContext.jsx";
import styles from "./PropertyCard.module.css";

function PropertyCard({ property }) {
  const { user } = useAuth();

  if (!property) {
    return null;
  }

  const image =
    property.imageUrl ||
    property.images?.[0]?.url ||
    property.images?.[0]?.imageUrl ||
    property.image ||
    propertyImages.fallback;
  const rating = property.averageRating || property.rating || "4.8";
  const price = property.price ? `$${property.price}` : "Price on request";
  const location = property.location || "Location not specified";
  const description =
    property.description || "No description available for this property.";
  const canUseCustomerActions = !user || user.role === "USER";

  return (
    <article className={styles.card}>
      <Link
        to={`/properties/${property.id}`}
        className={styles.imageLink}
        aria-label={`View details for ${property.title || "property"}`}
      >
        <img
          src={image}
          alt={property.title || "Property image"}
          className={styles.image}
          loading="lazy"
        />
      </Link>

      <div className={styles.content}>
        <div className={styles.header}>
          <h3>{property.title || "Untitled property"}</h3>
          <span className={styles.rating}>Rating {rating}</span>
        </div>

        <p className={styles.location}>{location}</p>
        <p className={styles.description}>{description}</p>

        <div className={styles.footer}>
          <span className={styles.price}>{price}/night</span>

          <div className={styles.actions}>
            <Link to={`/properties/${property.id}`} className={styles.details}>
              View details
            </Link>
            {canUseCustomerActions ? (
              <Link to={`/properties/${property.id}`} className={styles.book}>
                Book now
              </Link>
            ) : (
              <span className={styles.preview}>Preview mode</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default PropertyCard;
