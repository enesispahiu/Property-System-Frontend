import { useEffect, useState } from 'react';
import Filters from '../components/Filters.jsx';
import HeroSearch from '../components/HeroSearch.jsx';
import PropertyGrid from '../components/PropertyGrid.jsx';
import { getProperties, isAuthenticated, searchProperties } from '../services/api.js';
import styles from './Home.module.css';

function Home() {
  const [filters, setFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '1000',
    minRating: '0',
  });
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    async function loadProperties() {
      setIsLoading(true);
      setError('');

      try {
        const query = {
          ...filters,
          page: 1,
          limit: 10,
        };
        const data = isAuthenticated()
          ? await getProperties(query)
          : await searchProperties(query);

        if (isCurrent) {
          setProperties(data);
        }
      } catch (requestError) {
        if (isCurrent) {
          setProperties([]);
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
          {error ? (
            <div className={styles.state}>{error}</div>
          ) : isLoading ? (
            <div className={styles.state}>Loading properties...</div>
          ) : (
            <PropertyGrid properties={properties} />
          )}
          <Filters filters={filters} onChange={setFilters} />
        </div>
      </main>
    </>
  );
}

export default Home;
