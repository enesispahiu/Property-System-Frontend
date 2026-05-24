import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './Signup.module.css';

const initialForm = {
  tenantName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

function validate(form) {
  const errors = {};

  if (!form.tenantName.trim()) {
    errors.tenantName = 'Tenant name is required.';
  }

  if (!form.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!form.password) {
    errors.password = 'Password is required.';
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Confirm your password.';
  } else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}

function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setServerError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    try {
      await register({
        tenantName: form.tenantName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate('/dashboard');
    } catch (error) {
      setServerError(error.message || 'Unable to create your account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={`page ${styles.page}`}>
      <section className={styles.panel}>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {serverError ? <div className={styles.errorBanner}>{serverError}</div> : null}

          <label className={styles.field}>
            <span>Tenant name</span>
            <input
              name="tenantName"
              type="text"
              autoComplete="organization"
              value={form.tenantName}
              onChange={handleChange}
              aria-invalid={Boolean(errors.tenantName)}
            />
            {errors.tenantName ? <small>{errors.tenantName}</small> : null}
          </label>

          <label className={styles.field}>
            <span>Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email ? <small>{errors.email}</small> : null}
          </label>

          <label className={styles.field}>
            <span>Password</span>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              aria-invalid={Boolean(errors.password)}
            />
            {errors.password ? <small>{errors.password}</small> : null}
          </label>

          <label className={styles.field}>
            <span>Confirm password</span>
            <input
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange}
              aria-invalid={Boolean(errors.confirmPassword)}
            />
            {errors.confirmPassword ? <small>{errors.confirmPassword}</small> : null}
          </label>

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Signup'}
          </button>

          <p className={styles.switchText}>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>

        <div className={styles.copy}>
          <p className="pill">Join StayNest</p>
          <h1>Create an account for faster bookings</h1>
          <p>
            Save homes, manage upcoming trips, and keep your rental activity organized from one
            dashboard.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Signup;
