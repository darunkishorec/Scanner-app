import { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle } from 'lucide-react';
import styles from './QueueScreen.module.css';

export default function QueueScreen({ queueId, customerName, onCartReady }) {
  const [queueData, setQueueData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Poll queue status every 3 seconds
    const checkQueueStatus = async () => {
      try {
        const response = await fetch(`/api/queue/status/${queueId}`);
        if (response.ok) {
          const data = await response.json();
          setQueueData(data);
          setIsLoading(false);

          // If cart is ready, notify parent
          if (data.cartAvailable && !data.inQueue) {
            onCartReady(data.cartId);
          }
        }
      } catch (error) {
        console.error('[QueueScreen] Error checking queue status:', error);
      }
    };

    checkQueueStatus();
    const interval = setInterval(checkQueueStatus, 3000);

    return () => clearInterval(interval);
  }, [queueId, onCartReady]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Checking queue status...</p>
        </div>
      </div>
    );
  }

  if (queueData?.cartAvailable) {
    return (
      <div className={styles.container}>
        <div className={styles.readyState}>
          <div className={styles.readyIcon}>
            <CheckCircle size={64} />
          </div>
          <h2>Your Cart is Ready!</h2>
          <p className={styles.cartId}>Cart {queueData.cartId}</p>
          <p className={styles.message}>Please proceed to collect your cart</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <Users className={styles.headerIcon} />
          <h1 className={styles.title}>You're in the Queue</h1>
          <p className={styles.subtitle}>
            Hi {customerName}, all carts are currently in use
          </p>
        </div>

        {/* Position Card */}
        <div className={styles.positionCard}>
          <div className={styles.positionNumber}>
            {queueData?.position || 0}
          </div>
          <p className={styles.positionLabel}>Your Position</p>
        </div>

        {/* Info Cards */}
        <div className={styles.infoCards}>
          <div className={styles.infoCard}>
            <Clock className={styles.infoIcon} />
            <div>
              <p className={styles.infoValue}>
                ~{queueData?.estimatedWaitMinutes || 0} min
              </p>
              <p className={styles.infoLabel}>Estimated Wait</p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <Users className={styles.infoIcon} />
            <div>
              <p className={styles.infoValue}>
                {queueData?.queueLength || 0}
              </p>
              <p className={styles.infoLabel}>People in Queue</p>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className={styles.statusMessage}>
          <div className={styles.statusDot}></div>
          <p>We'll notify you when a cart becomes available</p>
        </div>

        {/* Queue ID */}
        <div className={styles.queueId}>
          <p className={styles.queueIdLabel}>Queue ID</p>
          <p className={styles.queueIdValue}>{queueId}</p>
        </div>
      </div>
    </div>
  );
}
