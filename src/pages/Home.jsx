import { useEffect, useState } from 'react';
import Filters from '../components/Filters.jsx';
import HeroSearch from '../components/HeroSearch.jsx';
import PropertyGrid from '../components/PropertyGrid.jsx';
import { searchProperties } from '../services/api.js';
import styles from './Home.module.css';

const PAGE_LIMIT = 6;

function Home() {
  const [filters, setFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '1000',
    minRating: '0',
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
    setFilters((current) => ({ ...current, location: search.location }));
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
  const showingCount = Math.min(properties.length, meta.total || properties.length);

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
                  {meta.total > 0
                    ? `Showing ${showingCount} of ${meta.total} stays`
                    : 'No stays available'}
                </div>
                <PropertyGrid properties={properties} />
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
