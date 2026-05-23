import React, { useState } from 'react';
import styles from './HeroSearch.module.css';

function HeroSearch({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ location: searchQuery });
    }
  };

  const handleQuickSearch = (location) => {
    setSearchQuery(location);
    if (onSearch) {
      onSearch({ location });
    }
  };

  return (
    <div className={styles.heroSection}>
      <div className={styles.heroBackground}>
        <div className={styles.heroOverlay} />
      </div>

      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>Find Your Perfect Home</h1>
        <p className={styles.heroSubtitle}>
          Discover the best properties in your desired location
        </p>

        <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
          <div className={styles.searchInputWrapper}>
            <input
              type="text"
              placeholder="Search by location or property type..."
              value={searchQuery}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchButton}>
              <span>Search</span>
            </button>
          </div>
        </form>

        <div className={styles.quickSearch}>
          <p className={styles.quickSearchLabel}>Popular locations:</p>
          <div className={styles.quickSearchTags}>
            <button
              type="button"
              className={styles.quickSearchTag}
              onClick={() => handleQuickSearch('New York')}
            >
              New York
            </button>
            <button
              type="button"
              className={styles.quickSearchTag}
              onClick={() => handleQuickSearch('Los Angeles')}
            >
              Los Angeles
            </button>
            <button
              type="button"
              className={styles.quickSearchTag}
              onClick={() => handleQuickSearch('Chicago')}
            >
              Chicago
            </button>
            <button
              type="button"
              className={styles.quickSearchTag}
              onClick={() => handleQuickSearch('San Francisco')}
            >
              San Francisco
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroSearch;
