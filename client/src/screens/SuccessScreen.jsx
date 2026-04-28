import { useState } from 'react';
import CheckmarkIcon from '../components/CheckmarkIcon';
import styles from './SuccessScreen.module.css';

export default function SuccessScreen({ result, user }) {
  const [shopping, setShopping] = useState(false);

  if (shopping) {
    return (
      <div className={styles.container}>
        <div className={styles.grid} aria-hidden="true" />
        <div className={styles.panel}>
          <div className={styles.sessionBadge}>
            <span className={styles.sessionDot} />
            <span className={styles.sessionLabel}>Session Active</span>
          </div>
          <div className={styles.info}>
            <div className={styles.cartId}>{result?.cartId}</div>
            <p className={styles.detail}>{user.name} · {user.phone}</p>
            <p className={styles.sessionNote}>
              This cart is locked to you for your visit.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.panel}>
        <div className={styles.iconWrap}>
          <CheckmarkIcon />
        </div>

        <div className={styles.info}>
          <h1 className={styles.headline}>Connected</h1>
          <div className={styles.cartId}>{result?.cartId}</div>
          <p className={styles.detail}>{user.name} · {user.phone}</p>
        </div>

        <button className={styles.btnPrimary} onClick={() => setShopping(true)}>
          Start Shopping
        </button>
      </div>
    </div>
  );
}
