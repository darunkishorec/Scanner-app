import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import styles from './CameraView.module.css';

const CameraView = forwardRef(({ onDecode, onError }, ref) => {
  const videoRef = useRef(null);
  const readerRef = useRef(null);

  // Expose stopCamera method to parent component
  useImperativeHandle(ref, () => ({
    stopCamera: () => {
      try {
        console.log('[CameraView] Stopping camera...');
        
        // First, stop all media tracks to turn off camera indicator light
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject;
          const tracks = stream.getTracks();
          console.log('[CameraView] Stopping', tracks.length, 'tracks');
          tracks.forEach(track => {
            console.log('[CameraView] Stopping track:', track.kind, track.label);
            track.stop();
          });
          videoRef.current.srcObject = null;
        }
        
        // Then call reader.reset() to clean up ZXing resources
        if (readerRef.current) {
          console.log('[CameraView] Calling reader.reset()');
          readerRef.current.reset();
        }
        
        console.log('[CameraView] Camera stopped successfully');
      } catch (err) {
        console.error('[CameraView] Error stopping camera:', err);
      }
    }
  }));

  useEffect(() => {
    // Must be inside useEffect — video element is guaranteed mounted here
    const reader = new BrowserMultiFormatReader(null, {
      delayBetweenScanAttempts: 100, // 10 decode attempts/sec
      delayBetweenScanSuccess: 500,
    });
    readerRef.current = reader;

    reader
      .decodeFromVideoDevice(
        undefined, // null deviceId → rear camera via facingMode: environment
        videoRef.current,
        (result, err) => {
          if (result) {
            console.log('[CameraView] QR decoded:', result.getText());
            onDecode(result.getText());
            return;
          }
          // Every frame without a QR fires err — that's normal, ignore it
          // Only log genuinely unexpected errors
          if (err && err?.name !== 'NotFoundException') {
            console.warn('[CameraView]', err?.name, err?.message);
          }
        }
      )
      .catch((err) => {
        console.error('[CameraView] failed to start:', err);
        onError(err?.message || 'Camera unavailable');
      });

    return () => {
      // Cleanup: stop all tracks and reset reader
      try {
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
        readerRef.current?.reset();
      } catch {}
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.wrap}>
      <video
        ref={videoRef}
        className={styles.video}
        autoPlay
        muted
        playsInline
      />
    </div>
  );
});

CameraView.displayName = 'CameraView';

export default CameraView;
