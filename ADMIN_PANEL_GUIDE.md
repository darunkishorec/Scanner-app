# 🎯 SmartCart AI Admin Panel - Complete Guide

## ✅ System Status: RUNNING

### 🚀 Active Services
- **FastAPI Server**: http://localhost:8000 ✓ Running
- **React Client**: http://localhost:5173 ✓ Running
- **MongoDB**: Connected ✓ Operational

---

## 📱 Access Points

### 1. Customer Scanner App
**URL**: http://localhost:5173
- Customer registration and QR scanning
- Real-time cart updates
- Mobile-optimized interface

### 2. Admin Panel
**URL**: http://localhost:5173/admin

**Login Credentials**:
```
Username: smartcart_admin
Password: admin@2025
```

### 3. API Documentation
**URL**: http://localhost:8000/docs
- Interactive Swagger UI
- Test all API endpoints
- View request/response schemas

---

## 🎮 Admin Panel Features Demo

### Current Test Data
We've created 5 test carts for you to explore:

| Cart ID  | Status  | Customer      | Items | Total  |
|----------|---------|---------------|-------|--------|
| cart-001 | Waiting | -             | 0     | ₹0.00  |
| cart-002 | Waiting | -             | 0     | ₹0.00  |
| cart-003 | Waiting | -             | 0     | ₹0.00  |
| cart-004 | Active  | John Doe      | 3     | ₹17.90 |
| cart-005 | Active  | Priya Sharma  | 1     | ₹4.98  |

### Cart-004 Details (John Doe)
- **Items**:
  - Apple × 3 = ₹5.97
  - Banana × 5 = ₹4.95
  - Orange Juice × 2 = ₹6.98
- **Subtotal**: ₹17.90
- **GST (5%)**: ₹0.90
- **Grand Total**: ₹18.80

### Cart-005 Details (Priya Sharma)
- **Items**:
  - Milk × 2 = ₹4.98
- **Subtotal**: ₹4.98
- **GST (5%)**: ₹0.25
- **Grand Total**: ₹5.23

---

## 🔍 Admin Panel Walkthrough

### Step 1: Login
1. Open http://localhost:5173/admin
2. Enter credentials:
   - Username: `smartcart_admin`
   - Password: `admin@2025`
3. Click "Sign In"

### Step 2: Dashboard Overview
You'll see:
- **Stats Cards**: 5 Total Carts, 2 Active, 3 Waiting, 0 Checked-Out
- **Action Buttons**: Refresh, Reset All, Test API, Export CSV
- **Search Bar**: Filter by cart ID or customer name
- **Status Filter**: Filter by cart status

### Step 3: View Cart Details
1. Find "cart-004" (John Doe) in the table
2. Click the **eye icon** (👁️) to view details
3. You'll see:
   - Customer information
   - Complete itemized list
   - GST calculation
   - Status history timeline
   - Manual override options

### Step 4: Test System Health
1. Click "Test API Connection" button
2. View health check modal showing:
   - ✅ FastAPI Server - Operational
   - ✅ MongoDB Connection - Operational
   - ✅ Cart Session Service - Operational
   - ✅ QR Token Generator - Operational
   - Response times for each service

### Step 5: Monitor System Logs
Scroll to the bottom to see the **System Logs** panel:
- Real-time event tracking
- Color-coded log levels (INFO/WARN/ERROR)
- Auto-scrolling terminal interface
- Shows all recent activities

### Step 6: Reset a Cart
1. Find any active cart (cart-004 or cart-005)
2. Click the **reset icon** (🔄)
3. Confirm the action
4. Watch the cart status change to "Waiting"
5. Customer data and items are cleared

### Step 7: Export Data
1. Click "Export CSV" button
2. A CSV file downloads with all cart data
3. Open in Excel or Google Sheets for analysis

### Step 8: Search and Filter
1. Type "John" in the search bar
2. Only cart-004 appears
3. Change filter to "Active" status
4. See only active carts (cart-004, cart-005)

---

## 🧪 Testing Scenarios

### Scenario 1: Complete Checkout Flow
```powershell
# Checkout cart-004
$body = @{cartId='cart-004'} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:8000/api/cart/checkout' -Method Post -Body $body -ContentType 'application/json'
```
- Watch the admin panel update
- Cart status changes to "Checked-Out"
- Daily summary updates with revenue

### Scenario 2: Reset All Carts
1. Click "Reset All Carts" button
2. Confirm the action
3. All carts reset to "Waiting" status
4. All customer data cleared
5. New tokens generated

### Scenario 3: Manual Status Override
1. Open cart-004 details
2. Use the "Manual Override" dropdown
3. Change status to "checked-out"
4. Click "Update Status"
5. Status changes immediately

### Scenario 4: Add More Items via API
```powershell
# Add bread to cart-005
$body = @{cartId='cart-005'; name='Bread'; price=1.99; qty=2} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:8000/api/cart/add-item' -Method Post -Body $body -ContentType 'application/json'
```
- Watch the admin panel update in real-time
- Total recalculates automatically

---

## 🎨 Admin Panel Features

### Real-Time Updates
- **Auto-refresh**: Every 5 seconds for carts
- **Silent updates**: No loading spinners after initial load
- **Live counters**: Uptime tracking for each cart
- **Instant feedback**: Toast notifications for all actions

### Data Management
- **Search**: Filter by cart ID or customer name
- **Status Filter**: View specific cart statuses
- **Sort**: Automatic sorting by creation time
- **Export**: CSV download for external analysis

### Cart Operations
- **View Details**: Complete cart information modal
- **Reset Single**: Reset individual carts
- **Reset All**: Bulk reset with confirmation
- **Status Override**: Manual status changes
- **Item Tracking**: Real-time item additions

### System Monitoring
- **Health Checks**: Test all system components
- **Response Times**: Monitor API performance
- **System Logs**: Real-time event tracking
- **Error Tracking**: Automatic error logging

### Analytics
- **Daily Summary**: Revenue and checkout tracking
- **Busiest Cart**: Identify most-used carts
- **Average Cart Value**: Calculate shopping patterns
- **Total Revenue**: Track daily earnings

---

## 🔧 API Testing Commands

### Create New Cart
```powershell
$body = @{cartId='cart-006'; storeId='store-01'} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:8000/api/cart/generate-qr' -Method Post -Body $body -ContentType 'application/json'
```

### Connect Customer to Cart
```powershell
$body = @{
    cartId='cart-006'
    token='SC-XXXXXXXX'  # Use token from QR generation
    customerName='Test User'
    customerPhone='9999999999'
} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:8000/api/cart/connect' -Method Post -Body $body -ContentType 'application/json'
```

### Add Item to Cart
```powershell
$body = @{cartId='cart-006'; name='Eggs'; price=4.99; qty=1} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:8000/api/cart/add-item' -Method Post -Body $body -ContentType 'application/json'
```

### Checkout Cart
```powershell
$body = @{cartId='cart-006'} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:8000/api/cart/checkout' -Method Post -Body $body -ContentType 'application/json'
```

### Get Daily Summary
```powershell
Invoke-RestMethod -Uri 'http://localhost:8000/api/admin/daily-summary' -Method Get
```

### View System Logs
```powershell
Invoke-RestMethod -Uri 'http://localhost:8000/api/admin/logs' -Method Get | Select-Object -First 10
```

---

## 🎯 Key Features Demonstrated

### ✅ Implemented Features
- [x] Admin login with session management
- [x] Real-time dashboard with live stats
- [x] Complete cart management table
- [x] Cart detail modal with full information
- [x] System health check with response times
- [x] Real-time system logs with auto-scroll
- [x] Daily analytics and revenue tracking
- [x] Search and filter functionality
- [x] CSV export capability
- [x] Reset single/all carts with confirmation
- [x] Manual status override
- [x] Status history timeline
- [x] GST calculation (5%)
- [x] Live uptime counters
- [x] Mobile-responsive design
- [x] Toast notifications
- [x] Activity logging
- [x] Secure route protection

---

## 🚀 Next Steps

### For Testing
1. **Login to Admin Panel**: http://localhost:5173/admin
2. **Explore Dashboard**: View all carts and statistics
3. **Test Operations**: Reset carts, view details, export data
4. **Monitor Logs**: Watch real-time system events
5. **Check Health**: Test API connectivity

### For Development
1. **Add More Carts**: Use API commands above
2. **Test Checkout Flow**: Complete transactions
3. **Monitor Performance**: Check response times
4. **Export Data**: Analyze cart patterns
5. **Customize**: Modify admin panel as needed

---

## 📞 Support

### Common Issues
- **Can't login**: Check credentials (case-sensitive)
- **No data showing**: Ensure MongoDB is running
- **API errors**: Check FastAPI server logs
- **Slow updates**: Check network connection

### Debug Tools
- **Browser Console**: F12 → Console tab
- **Network Tab**: F12 → Network tab
- **FastAPI Logs**: Check terminal running FastAPI
- **React Logs**: Check terminal running Vite

---

## 🎉 Success!

Your SmartCart AI Admin Panel is now fully operational with:
- ✅ 5 test carts created
- ✅ 2 active customers with items
- ✅ Real-time monitoring enabled
- ✅ All features functional
- ✅ System health verified

**Ready to explore!** Open http://localhost:5173/admin and start managing your smart carts!

---

Built with ❤️ for seamless cart management and real-time monitoring.