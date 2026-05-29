import { useEffect, useState } from 'react';
import Filters from '../components/Filters.jsx';
import HeroSearch from '../components/HeroSearch.jsx';
import PropertyGrid from '../components/PropertyGrid.jsx';
import { searchProperties } from '../services/api.js';
import styles from './Home.module.css';

const PAGE_LIMIT = 6;

function getRating(property) {
  const averageFromReviews = Array.isArray(property.reviews) && property.reviews.length
    ? property.reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
      property.reviews.length
    : 0;

  return Number(property.averageRating || property.rating || averageFromReviews || 0);
}

function applyClientFilterAndSort(propertyList, filters) {
  const minRating = Number(filters.minRating || 0);
  const minPrice = filters.minPrice === "" ? null : Number(filters.minPrice);
  const maxPrice = filters.maxPrice === "" ? null : Number(filters.maxPrice);
  const category = (filters.category || "").toLowerCase();

  const filtered = propertyList.filter((property) => {
    const price = Number(property.price || 0);
    const propertyCategory = (
      property.category?.name ||
      property.category ||
      property.propertyType ||
      property.type ||
      ""
    ).toLowerCase();

    if (minRating > 0 && getRating(property) < minRating) {
      return false;
    }

    if (minPrice !== null && price < minPrice) {
      return false;
    }

    if (maxPrice !== null && price > maxPrice) {
      return false;
    }

    if (category && !propertyCategory.includes(category)) {
      return false;
    }

    return true;
  });

  return [...filtered].sort((left, right) => {
    if (filters.sort === "price_asc") {
      return Number(left.price || 0) - Number(right.price || 0);
    }

    if (filters.sort === "price_desc") {
      return Number(right.price || 0) - Number(left.price || 0);
    }

    if (filters.sort === "rating_desc") {
      return getRating(right) - getRating(left);
    }

    return 0;
  });
}

function Home() {
  const [filters, setFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    minRating: '0',
    category: '',
    sort: 'recommended',
  });
  const [properties, setProperties] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    total: 0,
    totalPages: 1,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    async function loadProperties() {
      setIsLoading(true);
      setError('');

      try {
        const query = {
          ...filters,
          page: 1,
          limit: PAGE_LIMIT,
        };
        const result = await searchProperties(query, { includeMeta: true });

        if (isCurrent) {
          setProperties(result.data);
          setMeta(result.meta);
        }
      } catch (requestError) {
        if (isCurrent) {
          setProperties([]);
          setMeta({
            page: 1,
            limit: PAGE_LIMIT,
            total: 0,
            totalPages: 1,
          });
          setError(requestError.message || 'Unable to load properties.');
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadProperties();

    return () => {
      isCurrent = false;
    };
  }, [filters]);

  function handleHeroSearch(search) {
    setFilters((current) => ({
      ...current,
      location: search.location,
      category: search.category,
      minPrice: search.minPrice,
      maxPrice: search.maxPrice,
    }));
  }

  async function handleLoadMore() {
    if (isLoadingMore || meta.page >= meta.totalPages) {
      return;
    }

    setIsLoadingMore(true);
    setError('');

    try {
      const result = await searchProperties(
        {
          ...filters,
          page: meta.page + 1,
          limit: PAGE_LIMIT,
        },
        { includeMeta: true },
      );

      setProperties((current) => {
        const existingIds = new Set(current.map((property) => property.id));
        const nextProperties = result.data.filter(
          (property) => !existingIds.has(property.id),
        );

        return [...current, ...nextProperties];
      });
      setMeta(result.meta);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load more properties.');
    } finally {
      setIsLoadingMore(false);
    }
  }

  const hasMore = meta.page < meta.totalPages;
  const visibleProperties = applyClientFilterAndSort(properties, filters);
  const showingCount = Math.min(
    visibleProperties.length,
    meta.total || visibleProperties.length,
  );

  return (
    <>
      <HeroSearch onSearch={handleHeroSearch} />
      <main className={`page ${styles.main}`}>
        <section className={styles.intro}>
          <div>
            <p className="pill">Featured stays</p>
            <h2 className="section-title">Homes with polished spaces and practical details</h2>
          </div>
          <p className="muted">
            Filter live property listings by destination, nightly budget, and guest rating.
          </p>
        </section>
        <div className="layout-grid">
          <div className={styles.results}>
            {error ? <div className={styles.state}>{error}</div> : null}
            {isLoading ? (
              <div className={styles.state}>Loading properties...</div>
            ) : error && !properties.length ? null : (
              <>
                <div className={styles.summary}>
                  {visibleProperties.length > 0
                    ? `Showing ${showingCount} of ${meta.total} stays`
                    : 'No properties found. Try adjusting your filters.'}
                </div>
                <PropertyGrid properties={visibleProperties} />
                {hasMore ? (
                  <button
                    type="button"
                    className={styles.loadMore}
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? 'Loading...' : 'Load more'}
                  </button>
                ) : null}
              </>
            )}
          </div>
          <Filters filters={filters} onChange={setFilters} />
        </div>
      </main>
    </>
  );
}

export default Home;
