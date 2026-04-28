import { useState } from 'react';
import styles from './ManualEntryDrawer.module.css';

export default function ManualEntryDrawer({ open, onToggle, onSubmit, disabled }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = value.trim().toUpperCase();
    if (!/^CART-\d{3}$/.test(id)) {
      setError('Format: CART-001');
      return;
    }
    setError('');
    setValue('');
    onSubmit(id);
  };

  return (
    <div className={styles.drawer}>
      <button className={styles.toggle} onClick={onToggle}>
        <span className={styles.toggleIcon}>{open ? '▾' : '▸'}</span>
        Can't scan? Enter cart ID
      </button>

      {open && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <input
              className={`${styles.input} ${error ? styles.inputError : ''}`}
              type="text"
              placeholder="CART-001"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError('');
              }}
              autoCapitalize="characters"
              spellCheck={false}
              disabled={disabled}
            />
            <button
              type="submit"
              className={styles.submit}
              disabled={disabled || !value.trim()}
            >
              Go
            </button>
          </div>
          {error && <span className={styles.errorMsg}>{error}</span>}
        </form>
      )}
    </div>
  );
}
