import styles from './Filters.module.css';

function Filters({ filters, onChange }) {
  function updateFilter(event) {
    onChange({ ...filters, [event.target.name]: event.target.value });
  }

  return (
    <aside className={styles.filters}>
      <div>
        <h2>Filters</h2>
        <p className="muted">Tune the homes shown below.</p>
      </div>
      <label>
        Location
        <input
          name="location"
          placeholder="Try London or Tokyo"
          value={filters.location}
          onChange={updateFilter}
        />
      </label>
      <label>
        Min price
        <input
          name="minPrice"
          type="number"
          min="0"
          placeholder="No minimum"
          value={filters.minPrice}
          onChange={updateFilter}
        />
      </label>
      <label>
        Max price: ${filters.maxPrice}
        <input
          name="maxPrice"
          type="range"
          min="100"
          max="1000"
          step="25"
          value={filters.maxPrice}
          onChange={updateFilter}
        />
      </label>
      <label>
        Minimum rating
        <select name="minRating" value={filters.minRating} onChange={updateFilter}>
          <option value="0">Any rating</option>
          <option value="4.7">4.7+</option>
          <option value="4.8">4.8+</option>
          <option value="4.9">4.9+</option>
        </select>
      </label>
    </aside>
  );
}

export default Filters;
