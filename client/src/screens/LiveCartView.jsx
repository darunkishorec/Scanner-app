import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Package, IndianRupee } from 'lucide-react';
import styles from './LiveCartView.module.css';

export default function LiveCartView({ cartId, customerName }) {
  const [cartData, setCartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    let pollInterval = null;
    let sseConnected = false;
    let sseTimeout = null;
    
    console.log('[LiveCartView] Initializing for cart:', cartId);
    
    // Polling function
    const pollCartStatus = async () => {
      try {
        console.log('[LiveCartView] Polling cart status...');
        const response = await fetch(`/api/cart/status/${cartId}`);
        if (response.ok) {
          const data = await response.json();
          console.log('[LiveCartView] Received cart data:', data);
          setCartData(data);
          setIsLoading(false);
        } else {
          console.error('[LiveCartView] Polling failed with status:', response.status);
        }
      } catch (err) {
        console.error('[LiveCartView] Polling error:', err);
      }
    };
    
    // Start with immediate polling to show data quickly
    pollCartStatus();
    
    // Try SSE connection
    const eventSource = new EventSource(`/api/sse/cart-status/${cartId}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('[LiveCartView] SSE connection opened');
      sseConnected = true;
      // Clear timeout since SSE connected successfully
      if (sseTimeout) {
        clearTimeout(sseTimeout);
      }
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[LiveCartView] SSE data received:', data);
        setCartData(data);
        setIsLoading(false);
        sseConnected = true;
      } catch (error) {
        console.error('[LiveCartView] Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('[LiveCartView] SSE error:', error);
      eventSource.close();
      
      // Only start polling if not already polling
      if (!pollInterval) {
        console.log('[LiveCartView] Starting polling fallback');
        pollInterval = setInterval(pollCartStatus, 2000);
      }
    };
    
    // Fallback: If SSE doesn't connect within 3 seconds, start polling
    sseTimeout = setTimeout(() => {
      if (!sseConnected) {
        console.log('[LiveCartView] SSE timeout, starting polling');
        if (!pollInterval) {
          pollInterval = setInterval(pollCartStatus, 2000);
        }
      }
    }, 3000);

    return () => {
      console.log('[LiveCartView] Cleanup');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      if (sseTimeout) {
        clearTimeout(sseTimeout);
      }
    };
  }, [cartId]);

  // Calculate GST and totals
  const subtotal = cartData?.total || 0;
  const gst = subtotal * 0.18;
  const grandTotal = subtotal + gst;

  // Format Indian currency
  const formatIndianCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  // Check if checked out
  if (cartData?.status === 'checked-out') {
    return (
      <div className={styles.container}>
        <div className={styles.checkedOutState}>
          <div className={styles.checkoutIcon}>✓</div>
          <h2>Thank You!</h2>
          <p>Your order has been completed</p>
          <div className={styles.finalTotal}>
            <span>Total Paid:</span>
            <span className={styles.amount}>{formatIndianCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <ShoppingCart className={styles.headerIcon} />
          <div>
            <h1 className={styles.title}>Your Cart</h1>
            <p className={styles.subtitle}>
              {customerName} • {cartData?.cartId}
            </p>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className={styles.itemsSection}>
        {!cartData?.items || cartData.items.length === 0 ? (
          <div className={styles.emptyState}>
            <Package className={styles.emptyIcon} />
            <p className={styles.emptyText}>Your cart is empty</p>
            <p className={styles.emptySubtext}>
              Items will appear here as staff scans them
            </p>
          </div>
        ) : (
          <div className={styles.itemsList}>
            {cartData.items.map((item, index) => (
              <div key={index} className={styles.item}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemQty}>× {item.qty}</span>
                </div>
                <span className={styles.itemPrice}>
                  {formatIndianCurrency(item.price * item.qty)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Totals Section */}
      <div className={styles.totalsSection}>
        <div className={styles.totalRow}>
          <span>Subtotal</span>
          <span>{formatIndianCurrency(subtotal)}</span>
        </div>
        <div className={styles.totalRow}>
          <span>GST (18%)</span>
          <span>{formatIndianCurrency(gst)}</span>
        </div>
        <div className={styles.grandTotalRow}>
          <span>Grand Total</span>
          <span className={styles.grandTotalAmount}>
            {formatIndianCurrency(grandTotal)}
          </span>
        </div>
      </div>

      {/* Live Indicator */}
      <div className={styles.liveIndicator}>
        <span className={styles.liveDot}></span>
        <span>Live Updates</span>
      </div>
    </div>
  );
}
