import styles from './UserBar.module.css';

export default function UserBar({ name, onExit }) {
  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        <span className={styles.dot} />
        <span className={styles.name}>{name}</span>
      </div>
      <button className={styles.exit} onClick={onExit} aria-label="Exit scanner">
        ✕
      </button>
    </div>
  );
}
