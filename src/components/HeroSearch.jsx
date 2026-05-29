import { useState } from 'react';
import styles from './HeroSearch.module.css';

function HeroSearch({ onSearch }) {
  const [form, setForm] = useState({
    location: '',
    category: '',
    minPrice: '',
    maxPrice: '',
  });

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSearch?.(form);
  }

  return (
    <section className={styles.hero}>
      <div className={styles.copy}>
        <span className="pill">Curated homes in 120+ cities</span>
        <h1>Book stays that feel designed around the way you travel.</h1>
        <p>
          Search refined apartments, villas, cabins, and beach homes with clear
          pricing and a simple booking flow.
        </p>
      </div>
      <form className={styles.search} onSubmit={handleSubmit}>
        <label>
          Location
          <input
            name="location"
            placeholder="Where do you want to stay?"
            value={form.location}
            onChange={updateField}
          />
        </label>
        <label>
          Category
          <select name="category" value={form.category} onChange={updateField}>
            <option value="">Any category</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="Studio">Studio</option>
            <option value="House">House</option>
            <option value="Hotel Room">Hotel Room</option>
          </select>
        </label>
        <label>
          Min price
          <input
            name="minPrice"
            type="number"
            min="0"
            placeholder="No min"
            value={form.minPrice}
            onChange={updateField}
          />
        </label>
        <label>
          Max price
          <input
            name="maxPrice"
            type="number"
            min="0"
            placeholder="No max"
            value={form.maxPrice}
            onChange={updateField}
          />
        </label>
        <button className="primary-button" type="submit">
          Search
        </button>
      </form>
    </section>
  );
}

export default HeroSearch;
