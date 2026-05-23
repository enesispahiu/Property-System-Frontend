import { useState } from 'react';
import styles from './HeroSearch.module.css';

function HeroSearch({ onSearch }) {
  const [form, setForm] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: '2',
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
            placeholder="City, country, or neighborhood"
            value={form.location}
            onChange={updateField}
          />
        </label>
        <label>
          Check in
          <input name="checkIn" type="date" value={form.checkIn} onChange={updateField} />
        </label>
        <label>
          Check out
          <input name="checkOut" type="date" value={form.checkOut} onChange={updateField} />
        </label>
        <label>
          Guests
          <select name="guests" value={form.guests} onChange={updateField}>
            <option value="1">1 guest</option>
            <option value="2">2 guests</option>
            <option value="4">4 guests</option>
            <option value="6">6 guests</option>
          </select>
        </label>
        <button className="primary-button" type="submit">
          Search
        </button>
      </form>
    </section>
  );
}

export default HeroSearch;
