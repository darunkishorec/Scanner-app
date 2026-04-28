import { useState } from 'react';
import styles from './RegistrationScreen.module.css';

function validate(name, phone) {
  const errors = {};
  if (!name.trim()) errors.name = 'Name is required';
  else if (name.trim().length < 2) errors.name = 'Enter a valid name';
  if (!phone.trim()) errors.phone = 'Phone number is required';
  else if (!/^\d{10}$/.test(phone.trim())) errors.phone = 'Enter a 10-digit number';
  return errors;
}

export default function RegistrationScreen({ onSubmit }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleBlur = (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    const errs = validate(name, phone);
    setErrors(errs);
  };

  const handleChange = (field, value) => {
    if (field === 'name') setName(value);
    if (field === 'phone') setPhone(value.replace(/\D/g, '').slice(0, 10));
    if (touched[field]) {
      const errs = validate(
        field === 'name' ? value : name,
        field === 'phone' ? value : phone
      );
      setErrors(errs);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(name, phone);
    setErrors(errs);
    setTouched({ name: true, phone: true });
    if (Object.keys(errs).length === 0) {
      onSubmit(name.trim(), phone.trim());
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>▣</span>
          <span className={styles.brandName}>CARTLINK</span>
        </div>

        <div className={styles.heading}>
          <h1 className={styles.title}>Identify yourself</h1>
          <p className={styles.subtitle}>You'll be connected to a cart in seconds</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">Full Name</label>
            <input
              id="name"
              className={`${styles.input} ${touched.name && errors.name ? styles.inputError : ''}`}
              type="text"
              placeholder="e.g. Priya Sharma"
              value={name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              autoComplete="name"
            />
            {touched.name && errors.name && (
              <span className={styles.errorMsg}>{errors.name}</span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              className={`${styles.input} ${touched.phone && errors.phone ? styles.inputError : ''}`}
              type="tel"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
              autoComplete="tel"
              inputMode="numeric"
            />
            {touched.phone && errors.phone && (
              <span className={styles.errorMsg}>{errors.phone}</span>
            )}
          </div>

          <button type="submit" className={styles.cta}>
            Open Scanner
          </button>
        </form>
      </div>
    </div>
  );
}
