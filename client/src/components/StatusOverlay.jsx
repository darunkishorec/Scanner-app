import styles from './StatusOverlay.module.css';

export default function StatusOverlay({ state, errorMsg }) {
  if (state !== 'error') return null;

  return (
    <div className={styles.toast}>
      <span className={styles.msg}>{errorMsg}</span>
    </div>
  );
}
