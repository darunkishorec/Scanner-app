# SmartCart AI — QR Scanner & Admin Dashboard

A complete smart shopping cart system with QR code scanning, real-time cart management, and comprehensive admin dashboard. Built with React, FastAPI, and MongoDB.

---

## � Hosting and Deployment

### Local Development Setup

1. **Configure Environment Variables**
   - Create a `.env` file in the `client` folder
   - Add the following line:
     ```
     VITE_API_URL=http://localhost:8000
     ```

2. **Start the System**
   - Run `start-system.bat` (Windows) or follow manual start instructions below
   - Frontend will be available at `http://localhost:5173`
   - Backend API will be available at `http://localhost:8000`

### Production/Demo Hosting on Vercel

#### Step 1: Deploy Frontend to Vercel

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/smartcart-scanner.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project"
   - Import your GitHub repository
   - Set the **Root Directory** to `client`
   - Vercel will auto-detect Vite configuration
   - Click "Deploy"

3. **Configure Environment Variables in Vercel**
   - Go to your project settings in Vercel
   - Navigate to "Environment Variables"
   - Add: `VITE_API_URL` = `https://your-ngrok-url.ngrok.io` (see Step 2)
   - Redeploy the project after adding the variable

#### Step 2: Expose Backend API with ngrok (Demo Day)

Since the FastAPI backend runs on your local PC, you need to expose it to the internet for the Vercel-hosted frontend to access it:

1. **Install ngrok**
   - Download from [ngrok.com](https://ngrok.com/download)
   - Extract and add to your PATH

2. **Start your FastAPI backend**
   ```bash
   cd fastapi-server
   python start.py
   ```

3. **Run ngrok to create HTTPS tunnel**
   ```bash
   ngrok http 8000
   ```

4. **Copy the HTTPS URL**
   - ngrok will display a URL like: `https://abc123.ngrok.io`
   - This URL changes every time you restart ngrok

5. **Update Vercel Environment Variable**
   - Go to Vercel project settings → Environment Variables
   - Update `VITE_API_URL` to your new ngrok URL
   - Redeploy the project (or wait for auto-deploy)

#### Demo Day Checklist

Before your presentation:

- [ ] Start MongoDB on your PC
- [ ] Start FastAPI backend: `cd fastapi-server && python start.py`
- [ ] Start ngrok: `ngrok http 8000`
- [ ] Copy the ngrok HTTPS URL (e.g., `https://abc123.ngrok.io`)
- [ ] Update `VITE_API_URL` in Vercel environment variables with the ngrok URL
- [ ] Redeploy Vercel project or wait for auto-deploy
- [ ] Test the live Vercel URL to ensure scanner app connects to your backend
- [ ] Keep your PC running with backend and ngrok active during the demo

#### Important Notes

- **ngrok URL changes** every time you restart it (unless you have a paid plan)
- **Free ngrok** has a 2-hour session limit - restart if needed
- **CORS is configured** to allow all origins - the backend will accept requests from your Vercel domain
- **MongoDB** must be running on your PC for the backend to work
- For **permanent production deployment**, consider hosting the backend on a cloud service (Railway, Render, AWS, etc.)

---

## �🎯 Overview

SmartCart AI is a modern shopping cart management system that allows customers to scan QR codes to connect to physical shopping carts, while store staff can monitor and manage all carts in real-time through a powerful admin dashboard.

### Key Features

- 📱 **Mobile QR Scanner** - Camera-based QR code scanning for instant cart connection
- 🎵 **Success Audio Feedback** - Plays sound when cart is successfully connected
- 👨‍💼 **Admin Dashboard** - Real-time cart monitoring and management
- 📍 **Dynamic Location Detection** - Auto-detects store location using GPS
- 🔄 **Live Updates** - Real-time cart status updates every 5 seconds
- 📊 **Analytics Dashboard** - Daily revenue, checkout counts, and performance metrics
- 🔒 **Secure Admin Access** - Password-protected admin panel
- 📝 **System Logging** - Complete audit trail of all system events
- 💾 **MongoDB Backend** - Reliable data persistence and session management

---

## 🏗️ System Architecture

### Frontend (React + Vite)
- **Scanner App** - Customer-facing QR scanner interface
- **Admin Dashboard** - Staff management interface
- **Responsive Design** - Works on mobile, tablet, and desktop

### Backend (FastAPI + Python)
- **REST API** - Cart validation, session management, admin operations
- **MongoDB Integration** - Async database operations with Motor
- **Real-time Logging** - System event tracking and monitoring

### Database (MongoDB)
- **Cart Sessions** - Active cart connections and customer data
- **System Logs** - Complete audit trail with timestamps
- **TTL Indexes** - Automatic cleanup of expired sessions

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (running on localhost:27017)

### Installation

1. **Clone the repository**
```bash
cd "C:\Users\darun\Desktop\scanner app"
```

2. **Install Frontend Dependencies**
```bash
cd client
npm install
```

3. **Install Backend Dependencies**
```bash
cd fastapi-server
pip install -r requirements.txt
```

4. **Ensure MongoDB is Running**
```bash
# Check if MongoDB is running
Get-Process -Name mongod

# If not running, start MongoDB service
# (MongoDB should already be installed on your system)
```

### Running the System

**Option 1: Automatic Start (Windows)**
```bash
start-system.bat
```

**Option 2: Manual Start**

Terminal 1 - FastAPI Backend:
```bash
cd fastapi-server
python start.py
```

Terminal 2 - React Frontend:
```bash
cd client
npm run dev
```

---

## 📱 Application Access

### Customer Scanner App
- **URL**: http://localhost:5174
- **Purpose**: Customer-facing QR scanner
- **Features**:
  - Customer registration (name + phone)
  - Camera-based QR code scanning
  - Real-time cart connection
  - Success audio feedback
  - Manual cart ID entry (fallback)

### Admin Dashboard
- **URL**: http://localhost:5174/admin
- **Credentials**:
  - Username: `smartcart_admin`
  - Password: `admin@2025`
- **Features**:
  - Real-time cart monitoring
  - Cart management operations
  - System health checks
  - Analytics and reporting
  - System logs viewer

### API Documentation
- **URL**: http://localhost:8000/docs
- **Interactive Swagger UI** for testing API endpoints

---

## 🎮 Customer Flow

### 1. Registration Screen
- Customer enters their name and phone number
- Simple, clean interface with validation
- "Start Shopping" button to proceed

### 2. Scanner Screen
- Camera activates automatically
- Scan QR code on shopping cart
- Visual scanning reticle for guidance
- Real-time feedback during scan

### 3. Connection Process
- QR code decoded instantly
- Backend validates cart availability
- Success sound plays on connection
- Camera turns off immediately
- White flash animation for feedback

### 4. Success Screen
- Shows connected cart ID
- Displays customer name
- Animated checkmark icon
- Ready to shop!

---

## 👨‍💼 Admin Dashboard Features

### Dashboard Overview

**Header Section**
- SmartCart AI branding
- Dynamic location display (e.g., "Vadapalani, Chennai")
- Live IST time with date
- Logout button

**Statistics Cards** (4-column grid)
- Total Carts - All carts in system
- Active Carts - Currently in use
- Waiting Carts - Available for customers
- Checked-Out Today - Daily checkout count

**Action Buttons**
- Refresh Status - Manual data refresh
- Reset All Carts - Bulk cart reset
- Test API Connection - System health check
- Export CSV - Download cart data

### Cart Management

**Carts Table**
- Cart ID - Unique identifier (CART-001 to CART-005)
- Status - Color-coded badges (Active/Waiting/Checked-Out)
- Customer - Name of connected customer
- Phone - Customer contact number
- Items - Number of items in cart
- Total - Cart value in ₹
- Connected At - Connection timestamp
- Uptime - Live counter since last update
- Actions - View details, Reset cart

**Search & Filter**
- Search by cart ID or customer name
- Filter by status (All/Waiting/Active/Checked-Out)
- Real-time filtering

### Cart Details Modal
- Complete cart information
- Itemized product list with quantities
- Subtotal, GST (18%), and Grand Total
- Status history timeline
- Manual status override
- Reset cart option

### System Monitoring

**Health Check Modal**
- FastAPI server status
- MongoDB connection status
- Cart service status
- Token generator status
- Response times in milliseconds
- Overall system health indicator

**System Logs Panel**
- Terminal-style log viewer
- Color-coded log levels (INFO/WARN/ERROR)
- Real-time updates every 4 seconds
- Auto-scroll with manual override
- Cart ID and admin action tags
- Clear logs functionality
- Fixed height with internal scroll

### Analytics

**Daily Summary Bar**
- Total Checkouts Today
- Total Revenue Today (₹)
- Average Cart Value (₹)
- Busiest Cart ID

**Data Export**
- CSV export with all cart data
- Includes customer info, items, totals
- Timestamped filename

---

## 🔧 Technical Features

### Frontend Technologies
- **React 18** - Modern UI framework
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first styling
- **React Router** - Client-side routing
- **ZXing** - QR code scanning library
- **Lucide React** - Beautiful icons
- **Sonner** - Toast notifications

### Backend Technologies
- **FastAPI** - High-performance Python framework
- **Motor** - Async MongoDB driver
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **Python-dotenv** - Environment configuration

### Database Schema

**Cart Sessions Collection**
```javascript
{
  cartId: "CART-001",
  token: "SC-xK9mP2qR",
  storeId: "store-01",
  status: "active", // waiting | active | checked-out
  customerName: "John Doe",
  customerPhone: "9876543210",
  items: [
    { name: "Apple", price: 1.99, qty: 2 }
  ],
  total: 3.98,
  createdAt: ISODate("2026-04-27T14:30:00Z"),
  connectedAt: ISODate("2026-04-27T14:31:00Z"),
  lastUpdated: ISODate("2026-04-27T14:35:00Z"),
  expiresAt: ISODate("2026-04-27T14:40:00Z"),
  statusHistory: [
    { status: "waiting", timestamp: ISODate("...") },
    { status: "active", timestamp: ISODate("...") }
  ]
}
```

**System Logs Collection**
```javascript
{
  timestamp: ISODate("2026-04-27T14:31:00Z"),
  level: "INFO", // INFO | WARN | ERROR
  message: "Customer John Doe connected to CART-001",
  cartId: "CART-001",
  adminAction: false
}
```

---

## 🔌 API Endpoints

### Customer Endpoints

**POST /api/validate-cart**
- Validates cart ID and connects customer
- Request: `{ cartId, name, phone }`
- Response: `{ success, cartId, assignedTo }`
- Errors: CART_NOT_FOUND, CART_IN_USE, INVALID_FORMAT

**POST /api/cart/generate-qr**
- Generates QR code token for cart
- Request: `{ cartId, storeId }`
- Response: `{ qrData, token, expiresAt, cartId }`

**POST /api/cart/connect**
- Connects customer to cart via token
- Request: `{ cartId, token, customerName, customerPhone }`
- Response: `{ success, cartId, customerName }`

**GET /api/cart/status/{cartId}**
- Gets current cart status
- Response: Complete cart session object

**POST /api/cart/add-item**
- Adds item to active cart
- Request: `{ cartId, name, price, qty }`
- Response: `{ success, items, total }`

**POST /api/cart/checkout**
- Completes cart checkout
- Request: `{ cartId }`
- Response: `{ success, cartId }`

### Admin Endpoints

**GET /api/admin/carts**
- Lists all cart sessions
- Response: Array of cart objects

**POST /api/admin/reset-all-carts**
- Resets all carts to waiting status
- Response: `{ success, message, cartsReset, responseTime }`

**POST /api/admin/reset-cart/{cartId}**
- Resets specific cart
- Response: `{ success, message, responseTime }`

**GET /api/health**
- System health check
- Response: `{ status, totalResponseTime, services, timestamp }`

**GET /api/admin/logs**
- Gets recent system logs (last 50)
- Response: Array of log objects

**POST /api/admin/logs**
- Adds new log entry
- Request: `{ level, message, cartId, adminAction }`

**DELETE /api/admin/logs/clear**
- Clears all system logs
- Response: `{ success, deletedCount }`

**POST /api/admin/override-cart-status**
- Manually changes cart status
- Request: `{ cartId, newStatus }`
- Response: `{ success, message }`

**GET /api/admin/daily-summary**
- Gets daily analytics
- Response: `{ totalCheckouts, totalRevenue, avgCartValue, busiestCart }`

---

## 🎨 UI/UX Features

### Scanner App
- **Mobile-First Design** - Optimized for phone screens
- **Camera Reticle** - Visual guide for QR scanning
- **Status Overlay** - Loading, success, and error states
- **Flash Animations** - White flash on success, red on error
- **Success Sound** - Audio feedback (Connection_Success.mp3)
- **Manual Entry** - Drawer for typing cart ID manually
- **Error Messages** - User-friendly error descriptions

### Admin Dashboard
- **Clean Layout** - Professional business interface
- **Color-Coded Status** - Green (Active), Yellow (Waiting), Gray (Checked-Out)
- **Live Time Display** - Real-time IST clock
- **Dynamic Location** - GPS-based store location
- **Responsive Grid** - 4-column stats, flexible table
- **Hover Effects** - Interactive buttons and rows
- **Modal Dialogs** - Cart details, health check, confirmations
- **Toast Notifications** - Success/error feedback
- **Auto-Refresh** - Background updates without flicker

---

## 🔒 Security Features

### Admin Authentication
- Password-protected admin panel
- Session management (24-hour expiry)
- localStorage-based sessions
- Automatic logout on expiry
- Login activity logging

### Data Validation
- Cart ID format validation (CART-XXX)
- Phone number validation
- Input sanitization
- Request body validation with Pydantic

### Access Control
- Admin routes protected
- Customer routes public
- CORS configuration
- API rate limiting ready

---

## 📊 Data Integrity Features

### Cart ID Normalization
- All cart IDs stored as uppercase (CART-001 to CART-005)
- Automatic case conversion on all endpoints
- Prevents duplicate entries (CART-001 vs cart-001)
- Fixed set of 5 carts as single source of truth

### Reset Logic
- Deletes ALL existing sessions
- Creates exactly 5 fresh waiting sessions
- No duplicate accumulation
- Consistent state after reset

### Session Management
- TTL indexes for automatic cleanup
- Expired session removal (1 hour)
- Status history tracking
- Timestamp tracking (created, connected, updated)

---

## 🎵 Audio Features

### Success Sound
- **File**: Connection_Success.mp3
- **Location**: client/src/assets/
- **Trigger**: Successful cart connection
- **Volume**: 70%
- **Behavior**: Plays immediately on success response
- **Fallback**: Silent if audio blocked by browser

---

## 📍 Location Features

### Dynamic Location Detection
- **API**: OpenStreetMap Nominatim
- **Method**: Browser Geolocation API
- **Accuracy**: High accuracy GPS enabled
- **Format**: "Area, City" (e.g., "Vadapalani, Chennai")
- **Fallback**: "SmartCart Store" if detection fails
- **Cache**: 5 minutes to reduce API calls
- **Filtering**: Removes technical names (divisions, wards, zones)

---

## 🐛 Debugging Features

### Console Logging
- Scanner QR decode events
- Cart submission tracking
- API request/response logging
- Camera control events
- Location detection steps
- Error tracking with context

### Browser DevTools
- Network tab for API monitoring
- Console for event tracking
- Application tab for localStorage
- Performance monitoring

### Backend Logging
- Uvicorn access logs
- MongoDB connection status
- API endpoint hits
- Error stack traces
- Admin action tracking

---

## 🔧 Configuration

### Environment Variables (.env)
```bash
MONGODB_URL=mongodb://localhost:27017
DB_NAME=smartcart
STORE_ID=store-01
TOKEN_EXPIRE_MINUTES=10
```

### Admin Credentials
- Username: `smartcart_admin`
- Password: `admin@2025`
- Session: 24 hours
- Storage: localStorage

### Cart Configuration
- Fixed cart IDs: CART-001 to CART-005
- Token format: SC-XXXXXXXX (8 random chars)
- Token expiry: 10 minutes
- Session expiry: 1 hour (auto-cleanup)

---

## 📦 Project Structure

```
scanner-app/
├── client/                      # React frontend
│   ├── src/
│   │   ├── admin/              # Admin dashboard
│   │   │   ├── components/     # Admin UI components
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   └── admin.css
│   │   ├── assets/             # Static assets
│   │   │   ├── Connection_Success.mp3
│   │   │   └── hero.png
│   │   ├── components/         # Scanner components
│   │   │   ├── CameraView.jsx
│   │   │   ├── ScanReticle.jsx
│   │   │   ├── StatusOverlay.jsx
│   │   │   └── UserBar.jsx
│   │   ├── screens/            # Main screens
│   │   │   ├── RegistrationScreen.jsx
│   │   │   ├── ScannerScreen.jsx
│   │   │   └── SuccessScreen.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── fastapi-server/             # Python backend
│   ├── main.py                 # FastAPI application
│   ├── start.py                # Server startup script
│   └── requirements.txt
├── qr-codes/                   # Generated QR codes
│   ├── CART-001.png
│   ├── CART-002.png
│   └── ...
├── generate-qr.js              # QR code generator
├── start-system.bat            # Windows startup script
└── README.md
```

---

## 🚨 Troubleshooting

### Common Issues

**Camera Not Working**
- Allow camera permissions in browser
- Use HTTPS (required on mobile)
- Check if another app is using camera
- Try manual entry as fallback

**MongoDB Connection Failed**
- Ensure MongoDB is running: `Get-Process -Name mongod`
- Check connection string in .env
- Verify port 27017 is not blocked

**Admin Login Not Working**
- Use exact credentials (case-sensitive)
- Clear browser cache and localStorage
- Check browser console for errors

**Location Not Showing**
- Allow location permissions in browser
- Check browser console for geolocation errors
- Fallback to "SmartCart Store" is normal

**QR Scan Shows "Something Went Wrong"**
- Check browser console for detailed error
- Verify backend is running on port 8000
- Check cart ID format in QR code
- Ensure cart is not already in use

**Port Already in Use**
- Frontend: Vite will auto-select next port (5174, 5175, etc.)
- Backend: Stop other FastAPI instances
- Check with: `netstat -ano | findstr :8000`

---

## 🎯 Usage Scenarios

### For Store Staff
1. **Morning Setup**: Open admin panel, verify all carts are waiting
2. **Monitor Operations**: Watch real-time cart connections and status
3. **Handle Issues**: Reset stuck carts, override statuses manually
4. **End of Day**: Review daily summary, export data for records

### For Customers
1. **Register**: Enter name and phone at kiosk/app
2. **Scan QR**: Point camera at cart QR code
3. **Shop**: Items auto-added as staff scans them
4. **Checkout**: Staff completes checkout, customer sees thank you

### For Developers
1. **Test APIs**: Use Swagger UI at /docs
2. **Monitor Logs**: Watch system logs in admin panel
3. **Debug Issues**: Check browser console and backend logs
4. **Export Data**: Download CSV for analysis

---

## 🔄 System Workflow

### Cart Connection Flow
1. Customer registers with name and phone
2. Customer scans QR code on cart
3. Scanner decodes QR and extracts cart ID
4. Frontend calls /api/validate-cart
5. Backend validates cart availability
6. Backend creates active session
7. Success sound plays
8. Camera turns off
9. Success screen displays
10. Customer can start shopping

### Admin Reset Flow
1. Admin clicks "Reset All Carts"
2. Confirmation dialog appears
3. Admin confirms action
4. Backend deletes all sessions
5. Backend creates 5 fresh waiting sessions
6. Admin panel refreshes
7. All carts show "Waiting" status
8. System logs the admin action

---

## 📈 Performance Optimizations

### Frontend
- Vite for fast builds and HMR
- React.memo for component optimization
- useCallback for stable function references
- Debouncing for QR scan events
- Lazy loading for admin components

### Backend
- Async/await for non-blocking operations
- Motor for async MongoDB operations
- Connection pooling
- TTL indexes for auto-cleanup
- Efficient query patterns

### Database
- Indexed fields (cartId, token, timestamp)
- TTL index for expired sessions
- Optimized query projections
- Batch operations where possible

---

## 🌟 Future Enhancements

- [ ] Real-time WebSocket updates
- [ ] Multi-store support
- [ ] Advanced analytics dashboard
- [ ] Customer mobile app
- [ ] Payment integration
- [ ] Inventory management
- [ ] Staff management system
- [ ] Email/SMS notifications
- [ ] Barcode scanning for items
- [ ] Receipt generation

---

## 📝 License

This project is proprietary software developed for SmartCart AI.

---

## 👥 Support

For issues, questions, or feature requests, contact the development team.

---

**Built with ❤️ for seamless shopping experiences**

Version: 2.0.0  
Last Updated: April 27, 2026