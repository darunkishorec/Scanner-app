import styles from './ScanReticle.module.css';

export default function ScanReticle({ state }) {
  const isLoading = state === 'loading';
  const isError = state === 'error';

  return (
    <div className={styles.overlay}>
      <div className={`${styles.reticle} ${isError ? styles.reticleError : ''}`}>
        {/* Corner brackets */}
        <svg className={styles.corners} viewBox="0 0 260 260" fill="none">
          {/* Top-left */}
          <path d="M0 40 L0 0 L40 0" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
          {/* Top-right */}
          <path d="M220 0 L260 0 L260 40" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
          {/* Bottom-left */}
          <path d="M0 220 L0 260 L40 260" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
          {/* Bottom-right */}
          <path d="M220 260 L260 260 L260 220" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
        </svg>

        {/* Pulse ring */}
        {!isLoading && !isError && (
          <div className={styles.pulseRing} />
        )}

        {/* Loading arc */}
        {isLoading && (
          <svg className={styles.loadingArc} viewBox="0 0 260 260">
            <circle
              cx="130" cy="130" r="110"
              stroke="#F59E0B"
              strokeWidth="2"
              strokeDasharray="120 572"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
