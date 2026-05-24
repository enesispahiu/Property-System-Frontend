import PropertyCard from "./PropertyCard.jsx";
import styles from "./PropertyGrid.module.css";

function PropertyGrid({ properties = [] }) {
  if (!properties.length) {
    return (
      <div className={styles.empty}>
        <h2>No properties found</h2>
        <p>No properties found. Admin can add properties from Admin Panel.</p>
      </div>
    );
  }

  return (
    <section className={styles.grid}>
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </section>
  );
}

export default PropertyGrid;
