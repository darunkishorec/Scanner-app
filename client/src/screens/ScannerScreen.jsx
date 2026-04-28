import { useState, useRef, useCallback, useEffect } from 'react';
import CameraView from '../components/CameraView';
import ScanReticle from '../components/ScanReticle';
import UserBar from '../components/UserBar';
import ManualEntryDrawer from '../components/ManualEntryDrawer';
import StatusOverlay from '../components/StatusOverlay';
import styles from './ScannerScreen.module.css';
import successSound from '../assets/Connection_Success.mp3';

const ERROR_MESSAGES = {
  CART_NOT_FOUND: "This QR code isn't a valid cart",
  CART_IN_USE: (id) => `Cart ${id} is already occupied`,
  INVALID_FORMAT: "QR code doesn't match cart format",
  NETWORK: 'Server not running. Start the backend on port 3001.',
};

export default function ScannerScreen({ user, onSuccess, onQueue, onExit }) {
  const [scanState, setScanState] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [flashType, setFlashType] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // All mutable state that callbacks need — read via refs to avoid stale closures
  const scanStateRef = useRef('idle');
  const lastScannedRef = useRef(null);
  const resumeTimerRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const userRef = useRef(user);
  const onSuccessRef = useRef(onSuccess);
  const cameraViewRef = useRef(null);
  const audioRef = useRef(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio(successSound);
    audioRef.current.volume = 0.7; // Set volume to 70%
  }, []);

  // Keep refs in sync
  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { onSuccessRef.current = onSuccess; }, [onSuccess]);

  const setIdle = useCallback(() => {
    scanStateRef.current = 'idle';
    setScanState('idle');
    setFlashType(null);
    setErrorMsg('');
    lastScannedRef.current = null;
  }, []);

  const handleError = useCallback((errorCode, cartId) => {
    clearTimeout(resumeTimerRef.current);

    const msg =
      errorCode === 'CART_IN_USE'
        ? ERROR_MESSAGES.CART_IN_USE(cartId)
        : ERROR_MESSAGES[errorCode] || 'Something went wrong';

    scanStateRef.current = 'error';
    setScanState('error');
    setFlashType('red');
    setErrorMsg(msg);

    resumeTimerRef.current = setTimeout(setIdle, 2500);
  }, [setIdle]);

  const submitCart = useCallback(async (cartId) => {
    scanStateRef.current = 'loading';
    setScanState('loading');

    try {
      const { name, phone } = userRef.current;
      const res = await fetch('/api/validate-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId, name, phone }),
      });
      
      // Check if response is ok before parsing JSON
      if (!res.ok) {
        const data = await res.json();
        
        // Check if all carts are occupied - trigger queue
        if (data.detail?.error === 'ALL_CARTS_OCCUPIED' && data.detail?.shouldQueue) {
          console.log('[Scanner] All carts occupied, joining queue');
          
          // Join queue
          const queueRes = await fetch('/api/queue/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerName: name, customerPhone: phone }),
          });
          
          if (queueRes.ok) {
            const queueData = await queueRes.json();
            if (queueData.success && onQueue) {
              onQueue(queueData);
              return;
            }
          }
        }
        
        console.error('[Scanner] HTTP error:', res.status, res.statusText);
        handleError(data.detail?.error || 'NETWORK', cartId);
        return;
      }
      
      const data = await res.json();

      if (data.success) {
        // Play success sound
        if (audioRef.current) {
          audioRef.current.currentTime = 0; // Reset to start
          audioRef.current.play().catch(err => {
            console.warn('[Scanner] Could not play success sound:', err);
          });
        }
        
        // Stop camera immediately on success - turn off green indicator light
        if (cameraViewRef.current) {
          cameraViewRef.current.stopCamera();
        }
        
        scanStateRef.current = 'frozen';
        setScanState('frozen');
        setFlashType('white');
        setTimeout(() => {
          onSuccessRef.current({ cartId: data.cartId, assignedTo: data.assignedTo });
        }, 350);
      } else {
        handleError(data.error, cartId);
      }
    } catch (err) {
      console.error('[Scanner] fetch failed:', err);
      handleError('NETWORK', cartId);
    }
  }, [handleError, onQueue]);

  // Stable decode handler — CameraView captures this once at mount.
  // It must NEVER be recreated, so it reads everything via refs.
  // We use a ref to point at the latest version of the function.
  const handleDecodeImpl = useCallback((decodedText) => {
    console.log('[Scanner] QR decoded:', decodedText, 'State:', scanStateRef.current);
    
    if (scanStateRef.current !== 'idle') {
      console.log('[Scanner] Ignoring scan - not idle');
      return;
    }

    // Debounce: ignore same QR within 3s
    if (lastScannedRef.current === decodedText) {
      console.log('[Scanner] Ignoring scan - duplicate within 3s');
      return;
    }
    clearTimeout(debounceTimerRef.current);
    lastScannedRef.current = decodedText;
    debounceTimerRef.current = setTimeout(() => {
      lastScannedRef.current = null;
    }, 3000);

    // Parse QR code - expect format like "https://yourdomain.com/cart/CART-001"
    const match = decodedText.match(/\/cart\/(CART-\d+)/i);
    console.log('[Scanner] Regex match:', match);
    
    if (!match) {
      console.error('[Scanner] Invalid QR format:', decodedText);
      handleError('INVALID_FORMAT', null);
      return;
    }

    const cartId = match[1].toUpperCase();
    console.log('[Scanner] Submitting cart:', cartId);
    submitCart(cartId);
  }, [handleError, submitCart]);

  // Stable ref that always points to latest handleDecodeImpl
  const handleDecodeRef = useRef(handleDecodeImpl);
  useEffect(() => {
    handleDecodeRef.current = handleDecodeImpl;
  }, [handleDecodeImpl]);

  // This is the STABLE callback passed to CameraView — never changes identity
  // CameraView's useEffect captures this once and it always delegates to the latest impl
  const stableOnDecode = useRef((text) => handleDecodeRef.current(text));

  const handleManualSubmit = useCallback((cartId) => {
    if (scanStateRef.current !== 'idle') return;
    setDrawerOpen(false);
    submitCart(cartId);
  }, [submitCart]);

  const handleCameraError = useCallback((err) => {
    console.warn('[Scanner] camera error:', err);
    setCameraError(err);
    setDrawerOpen(true);
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(resumeTimerRef.current);
      clearTimeout(debounceTimerRef.current);
    };
  }, []);

  return (
    <div className={styles.container}>
      {flashType === 'white' && <div className={styles.flashWhite} />}
      {flashType === 'red' && <div className={styles.flashRed} />}

      <UserBar name={user.name} onExit={onExit} />

      <div className={styles.cameraWrap}>
        {cameraError ? (
          <div className={styles.cameraErrorBox}>
            <svg
              className={styles.cameraErrorIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              width="48"
              height="48"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
            <p className={styles.cameraErrorTitle}>Camera unavailable</p>
            <p className={styles.cameraErrorSub}>
              Allow camera access in your browser settings, or use manual entry below.
            </p>
          </div>
        ) : (
          <CameraView
            ref={cameraViewRef}
            onDecode={stableOnDecode.current}
            onError={handleCameraError}
          />
        )}

        <ScanReticle state={scanState} />
      </div>

      <StatusOverlay state={scanState} errorMsg={errorMsg} />

      <ManualEntryDrawer
        open={drawerOpen}
        onToggle={() => setDrawerOpen((o) => !o)}
        onSubmit={handleManualSubmit}
        disabled={scanState !== 'idle'}
      />
    </div>
  );
}
