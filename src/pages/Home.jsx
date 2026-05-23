import { useEffect, useState } from 'react';
import Filters from '../components/Filters.jsx';
import HeroSearch from '../components/HeroSearch.jsx';
import PropertyGrid from '../components/PropertyGrid.jsx';
import { getProperties } from '../services/api.js';
import styles from './Home.module.css';

function Home() {
  const [filters, setFilters] = useState({ location: '', maxPrice: '300', minRating: '0' });
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    getProperties(filters).then(setProperties);
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
            Filter by destination, nightly budget, and guest rating. Property data is ready to
            connect to your backend when endpoints are available.
          </p>
        </section>
        <div className="layout-grid">
          <PropertyGrid properties={properties} />
          <Filters filters={filters} onChange={setFilters} />
        </div>
      </main>
    </>
  );
}

export default Home;
