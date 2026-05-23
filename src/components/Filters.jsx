import React, { useState } from 'react';
import styles from './Filters.module.css';

function Filters({ onFilterChange, onClear }) {
  const [filters, setFilters] = useState({
    location: '',
    priceMin: '',
    priceMax: '',
    rating: '',
  });

  const [showFilters, setShowFilters] = useState(true);

  const handleLocationChange = (e) => {
    const newFilters = { ...filters, location: e.target.value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceMinChange = (e) => {
    const newFilters = { ...filters, priceMin: e.target.value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceMaxChange = (e) => {
    const newFilters = { ...filters, priceMax: e.target.value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRatingChange = (e) => {
    const newFilters = { ...filters, rating: e.target.value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      location: '',
      priceMin: '',
      priceMax: '',
      rating: '',
    });
    if (onClear) {
      onClear();
    }
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.filtersHeader}>
        <button
          className={styles.toggleButton}
          onClick={() => setShowFilters(!showFilters)}
        >
          <span className={styles.toggleIcon}>
            {showFilters ? '✕' : '☰'}
          </span>
          Filters
        </button>
        {hasActiveFilters && (
          <button
            className={styles.clearButton}
            onClick={handleClearFilters}
          >
            Clear All
          </button>
        )}
      </div>

      {showFilters && (
        <div className={styles.filtersContent}>
          {/* Location Filter */}
          <div className={styles.filterGroup}>
            <label htmlFor="location" className={styles.filterLabel}>
              Location
            </label>
            <select
              id="location"
              value={filters.location}
              onChange={handleLocationChange}
              className={styles.filterSelect}
            >
              <option value="">All Locations</option>
              <option value="new-york">New York</option>
              <option value="los-angeles">Los Angeles</option>
              <option value="chicago">Chicago</option>
              <option value="san-francisco">San Francisco</option>
              <option value="boston">Boston</option>
              <option value="miami">Miami</option>
              <option value="seattle">Seattle</option>
              <option value="denver">Denver</option>
            </select>
          </div>

          {/* Price Range Filter */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Price Range</label>
            <div className={styles.priceInputs}>
              <div className={styles.priceInputWrapper}>
                <label htmlFor="priceMin" className={styles.priceLabel}>Min</label>
                <input
                  id="priceMin"
                  type="number"
                  placeholder="Min price"
                  value={filters.priceMin}
                  onChange={handlePriceMinChange}
                  className={styles.priceInput}
                  min="0"
                  step="100"
                />
              </div>
              <span className={styles.priceSeparator}>-</span>
              <div className={styles.priceInputWrapper}>
                <label htmlFor="priceMax" className={styles.priceLabel}>Max</label>
                <input
                  id="priceMax"
                  type="number"
                  placeholder="Max price"
                  value={filters.priceMax}
                  onChange={handlePriceMaxChange}
                  className={styles.priceInput}
                  min="0"
                  step="100"
                />
              </div>
            </div>
          </div>

          {/* Rating Filter */}
          <div className={styles.filterGroup}>
            <label htmlFor="rating" className={styles.filterLabel}>
              Minimum Rating
            </label>
            <select
              id="rating"
              value={filters.rating}
              onChange={handleRatingChange}
              className={styles.filterSelect}
            >
              <option value="">Any Rating</option>
              <option value="4">★★★★★ 4.0+</option>
              <option value="3.5">★★★★☆ 3.5+</option>
              <option value="3">★★★☆☆ 3.0+</option>
              <option value="2.5">★★☆☆☆ 2.5+</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

export default Filters;
