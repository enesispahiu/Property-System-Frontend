import styles from './Filters.module.css';

function Filters({ filters, onChange }) {
  function updateFilter(event) {
    onChange({ ...filters, [event.target.name]: event.target.value });
  }

  function clearFilters() {
    onChange({
      location: "",
      minPrice: "",
      maxPrice: "",
      minRating: "0",
      category: "",
      sort: "recommended",
    });
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
        Category
        <select name="category" value={filters.category} onChange={updateFilter}>
          <option value="">Any category</option>
          <option value="Apartment">Apartment</option>
          <option value="Villa">Villa</option>
          <option value="Studio">Studio</option>
          <option value="House">House</option>
          <option value="Hotel Room">Hotel Room</option>
        </select>
      </label>
      <label>
        Max price
        <input
          name="maxPrice"
          type="number"
          min="0"
          placeholder="No maximum"
          value={filters.maxPrice}
          onChange={updateFilter}
        />
      </label>
      <label>
        Minimum rating
        <select name="minRating" value={filters.minRating} onChange={updateFilter}>
          <option value="0">Any rating</option>
          <option value="5">5 stars</option>
          <option value="4">4+ stars</option>
          <option value="3">3+ stars</option>
        </select>
      </label>
      <label>
        Sort by
        <select name="sort" value={filters.sort} onChange={updateFilter}>
          <option value="recommended">Recommended</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating_desc">Rating: High to Low</option>
        </select>
      </label>
      <button type="button" className={styles.clearButton} onClick={clearFilters}>
        Clear filters
      </button>
    </aside>
  );
}

export default Filters;
