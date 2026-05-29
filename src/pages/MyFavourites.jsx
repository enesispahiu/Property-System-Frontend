import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMyFavorites, removeFavorite } from "../services/api.js";
import styles from "./MyFavourites.module.css";

function money(value) {
  return `$${Number(value || 0).toLocaleString()}`;
}

function MyFavourites() {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");

  async function loadFavorites() {
    setIsLoading(true);
    setStatus("");

    try {
      const data = await getMyFavorites();
      setFavorites(Array.isArray(data) ? data : []);
    } catch (error) {
      setStatus(error.message || "Unable to load favourites.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadFavorites();
  }, []);

  async function handleRemove(propertyId) {
    setStatus("");

    try {
      await removeFavorite(propertyId);
      await loadFavorites();
      setStatus("Property removed from favourites.");
    } catch (error) {
      setStatus(error.message || "Unable to remove favourite.");
    }
  }

  if (isLoading) {
    return <main className={styles.state}>Loading favourites...</main>;
  }

  return (
    <main className={styles.page}>
      <section className={styles.heading}>
        <p className={styles.eyebrow}>Saved stays</p>
        <h1>My Favorites</h1>
        <p>Saved properties you like, ready to revisit when you plan your next stay.</p>
      </section>

      {status ? <div className={styles.status}>{status}</div> : null}

      {favorites.length === 0 ? (
        <section className={styles.empty}>
          <h2>You have no saved properties yet.</h2>
          <Link to="/explore">Explore properties</Link>
        </section>
      ) : (
        <section className={styles.grid}>
          {favorites.map((favorite) => {
            const property = favorite.property;

            return (
              <article key={favorite.id || property?.id} className={styles.card}>
                <Link to={`/properties/${property?.id}`} className={styles.imageLink}>
                  {property?.imageUrl ? (
                    <img src={property.imageUrl} alt={property.title || "Property"} />
                  ) : null}
                </Link>

                <div className={styles.cardBody}>
                  <div>
                    <h2>{property?.title || `Property #${favorite.propertyId}`}</h2>
                    <p>{property?.location || "Location unavailable"}</p>
                  </div>
                  <div className={styles.meta}>
                    <strong>{money(property?.price)} / night</strong>
                    <span>Rating {property?.averageRating || property?.rating || "4.8"}</span>
                  </div>
                  <div className={styles.actions}>
                    {property?.id ? <Link to={`/properties/${property.id}`}>View stay</Link> : null}
                    <button
                      type="button"
                      onClick={() => property?.id && handleRemove(property.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

export default MyFavourites;
