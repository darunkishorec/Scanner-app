import styles from './CheckmarkIcon.module.css';

export default function CheckmarkIcon() {
  return (
    <div className={styles.wrap}>
      <svg
        className={styles.svg}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer ring */}
        <circle cx="40" cy="40" r="36" stroke="#F59E0B" strokeWidth="2" opacity="0.3" />
        {/* Inner ring */}
        <circle cx="40" cy="40" r="28" stroke="#F59E0B" strokeWidth="1.5" opacity="0.15" />
        {/* Checkmark */}
        <path
          d="M24 40 L35 51 L56 29"
          stroke="#F59E0B"
          strokeWidth="3"
          strokeLinecap="square"
          strokeLinejoin="miter"
          className={styles.check}
        />
      </svg>
    </div>
  );
}
