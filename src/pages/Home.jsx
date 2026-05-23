import React, { useState, useEffect } from 'react';
import HeroSearch from '../components/HeroSearch';
import Filters from '../components/Filters';
import styles from './Home.module.css';
import { api } from '../services/api';

function Home() {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    location: '',
    priceMin: '',
    priceMax: '',
    rating: '',
  });

  // Fetch properties on component mount
  useEffect(() => {
    fetchProperties();
  }, []);

  // Apply filters whenever active filters change
  useEffect(() => {
    applyFilters();
  }, [activeFilters, properties]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getProperties();
      setProperties(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setError('Failed to load properties. Please try again later.');
      console.error(err);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (searchParams) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.searchProperties(searchParams);
      setProperties(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setError('Failed to search properties. Please try again.');
      console.error(err);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
  };

  const handleClearFilters = () => {
    setActiveFilters({
      location: '',
      priceMin: '',
      priceMax: '',
      rating: '',
    });
  };

  const applyFilters = () => {
    let filtered = [...properties];

    // Apply location filter
    if (activeFilters.location) {
      filtered = filtered.filter(prop =>
        prop.location?.toLowerCase().includes(activeFilters.location.toLowerCase()) ||
        prop.city?.toLowerCase().includes(activeFilters.location.toLowerCase())
      );
    }

    // Apply price filter
    if (activeFilters.priceMin) {
      filtered = filtered.filter(prop => prop.price >= parseFloat(activeFilters.priceMin));
    }

    if (activeFilters.priceMax) {
      filtered = filtered.filter(prop => prop.price <= parseFloat(activeFilters.priceMax));
    }

    // Apply rating filter
    if (activeFilters.rating) {
      filtered = filtered.filter(prop => {
        const rating = prop.rating || 0;
        return rating >= parseFloat(activeFilters.rating);
      });
    }

    setFilteredProperties(filtered);
  };

  const renderStarRating = (rating) => {
    const stars = Math.round(rating || 0);
    return '★'.repeat(stars) + '☆'.repeat(5 - stars);
  };

  return (
    <div className={styles.homePage}>
      {/* Hero Section with Search */}
      <HeroSearch onSearch={handleSearch} />

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Filters */}
        <Filters
          onFilterChange={handleFilterChange}
          onClear={handleClearFilters}
        />

        {/* Error Message */}
        {error && (
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>{error}</p>
            <button
              className={styles.retryButton}
              onClick={fetchProperties}
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner} />
            <p className={styles.loadingText}>Loading properties...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProperties.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🏠</div>
            <h2 className={styles.emptyTitle}>No Properties Found</h2>
            <p className={styles.emptyDescription}>
              {properties.length === 0
                ? 'No properties available at the moment. Please check back later!'
                : 'No properties match your filters. Try adjusting your search criteria.'}
            </p>
            {properties.length > 0 && (
              <button
                className={styles.resetButton}
                onClick={handleClearFilters}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Properties Grid */}
        {!loading && !error && filteredProperties.length > 0 && (
          <div className={styles.propertiesSection}>
            <div className={styles.resultsHeader}>
              <h2 className={styles.resultsTitle}>
                Available Properties
              </h2>
              <p className={styles.resultsCount}>
                {filteredProperties.length} result{filteredProperties.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className={styles.propertiesGrid}>
              {filteredProperties.map(property => (
                <div key={property.id} className={styles.propertyCard}>
                  {property.image && (
                    <div className={styles.propertyImage}>
                      <img
                        src={property.image}
                        alt={property.title || 'Property'}
                        className={styles.image}
                      />
                    </div>
                  )}

                  <div className={styles.propertyDetails}>
                    <h3 className={styles.propertyTitle}>
                      {property.title || 'Property'}
                    </h3>

                    <p className={styles.propertyLocation}>
                      📍 {property.location || property.city || 'Location not specified'}
                    </p>

                    <div className={styles.propertyMeta}>
                      {property.bedrooms && (
                        <span className={styles.metaItem}>
                          🛏️ {property.bedrooms} Bed{property.bedrooms !== 1 ? 's' : ''}
                        </span>
                      )}
                      {property.bathrooms && (
                        <span className={styles.metaItem}>
                          🚿 {property.bathrooms} Bath{property.bathrooms !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    <p className={styles.propertyDescription}>
                      {property.description || 'No description available'}
                    </p>

                    <div className={styles.propertyFooter}>
                      <div className={styles.priceSection}>
                        <span className={styles.price}>
                          ${property.price?.toLocaleString() || 'N/A'}
                        </span>
                        {property.priceUnit && (
                          <span className={styles.priceUnit}>
                            / {property.priceUnit}
                          </span>
                        )}
                      </div>

                      {property.rating && (
                        <div className={styles.ratingSection}>
                          <span className={styles.stars}>
                            {renderStarRating(property.rating)}
                          </span>
                          <span className={styles.ratingValue}>
                            {property.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    <button className={styles.viewButton}>
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
