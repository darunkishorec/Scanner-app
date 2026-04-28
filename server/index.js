import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

// In-memory cart store
const carts = {
  'CART-001': { status: 'available' },
  'CART-002': { status: 'in_use', assignedTo: 'Someone' },
  'CART-003': { status: 'available' },
  'CART-004': { status: 'available' },
  'CART-005': { status: 'available' },
};

// POST /api/validate-cart
app.post('/api/validate-cart', (req, res) => {
  const { cartId, name, phone } = req.body;

  // Validate format
  if (!cartId || !/^CART-\d{3}$/.test(cartId)) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_FORMAT',
      message: "QR code doesn't match cart format",
    });
  }

  const cart = carts[cartId];

  // Cart not found
  if (!cart) {
    return res.status(404).json({
      success: false,
      error: 'CART_NOT_FOUND',
      message: "This QR code isn't a valid cart",
    });
  }

  // Cart in use
  if (cart.status === 'in_use') {
    return res.status(409).json({
      success: false,
      error: 'CART_IN_USE',
      message: `Cart ${cartId} is already occupied`,
    });
  }

  // Assign cart
  carts[cartId] = { status: 'in_use', assignedTo: name, phone };

  return res.json({
    success: true,
    cartId,
    assignedTo: name,
  });
});

// GET /api/carts — admin/debug
app.get('/api/carts', (req, res) => {
  res.json(carts);
});

// GET /api/admin — simple admin panel
app.get('/api/admin', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>CartLink Admin</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; margin-bottom: 30px; }
        .cart { display: flex; justify-content: space-between; align-items: center; padding: 15px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; }
        .available { background: #e8f5e8; border-color: #4caf50; }
        .in_use { background: #ffe8e8; border-color: #f44336; }
        .status { font-weight: bold; padding: 5px 10px; border-radius: 3px; color: white; }
        .status.available { background: #4caf50; }
        .status.in_use { background: #f44336; }
        button { background: #2196f3; color: white; border: none; padding: 8px 15px; border-radius: 3px; cursor: pointer; }
        button:hover { background: #1976d2; }
        button:disabled { background: #ccc; cursor: not-allowed; }
        .actions { margin-top: 20px; }
        .reset-all { background: #ff9800; margin-right: 10px; }
        .reset-all:hover { background: #f57c00; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🛒 CartLink Admin Panel</h1>
        
        <div id="carts"></div>
        
        <div class="actions">
          <button class="reset-all" onclick="resetAll()">Reset All Carts</button>
          <button onclick="refresh()">Refresh Status</button>
        </div>
      </div>

      <script>
        async function loadCarts() {
          const response = await fetch('/api/carts');
          const carts = await response.json();
          
          const container = document.getElementById('carts');
          container.innerHTML = '';
          
          Object.entries(carts).forEach(([cartId, cart]) => {
            const div = document.createElement('div');
            div.className = \`cart \${cart.status}\`;
            div.innerHTML = \`
              <div>
                <strong>\${cartId}</strong>
                \${cart.assignedTo ? \`<br><small>Assigned to: \${cart.assignedTo}</small>\` : ''}
              </div>
              <div>
                <span class="status \${cart.status}">\${cart.status.toUpperCase()}</span>
                <button onclick="resetCart('\${cartId}')" \${cart.status === 'available' ? 'disabled' : ''}>
                  Reset
                </button>
              </div>
            \`;
            container.appendChild(div);
          });
        }
        
        async function resetCart(cartId) {
          await fetch('/api/free-cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cartId })
          });
          loadCarts();
        }
        
        async function resetAll() {
          const carts = ['CART-001', 'CART-002', 'CART-003', 'CART-004', 'CART-005'];
          for (const cartId of carts) {
            await resetCart(cartId);
          }
        }
        
        function refresh() {
          loadCarts();
        }
        
        // Load carts on page load
        loadCarts();
        
        // Auto-refresh every 5 seconds
        setInterval(loadCarts, 5000);
      </script>
    </body>
    </html>
  `;
  res.send(html);
});

// POST /api/free-cart — release a cart back to available
app.post('/api/free-cart', (req, res) => {
  const { cartId } = req.body;
  if (carts[cartId]) {
    carts[cartId] = { status: 'available' };
  }
  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
