# 🚀 SmartCart AI - Quick Start Guide

## ✅ System is Running!

### 🌐 Access URLs

| Application | URL | Credentials |
|-------------|-----|-------------|
| **Customer Scanner** | http://localhost:5173 | No login required |
| **Admin Panel** | http://localhost:5173/admin | `smartcart_admin` / `admin@2025` |
| **API Docs** | http://localhost:8000/docs | No login required |

---

## 🎯 Quick Actions

### 1. Access Admin Panel
```
1. Open: http://localhost:5173/admin
2. Username: smartcart_admin
3. Password: admin@2025
4. Click "Sign In"
```

### 2. View Test Data
You have **5 test carts** ready:
- **cart-001, 002, 003**: Waiting (empty)
- **cart-004**: Active - John Doe (₹17.90)
- **cart-005**: Active - Priya Sharma (₹4.98)

### 3. Test Features
- ✅ Click **eye icon** to view cart details
- ✅ Click **Test API Connection** for health check
- ✅ Scroll down to see **System Logs**
- ✅ Click **Export CSV** to download data
- ✅ Use **Search** to filter carts

---

## 🔧 Quick Commands

### Add Item to Cart
```powershell
$body = @{cartId='cart-004'; name='Coffee'; price=2.99; qty=1} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:8000/api/cart/add-item' -Method Post -Body $body -ContentType 'application/json'
```

### Checkout Cart
```powershell
$body = @{cartId='cart-004'} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:8000/api/cart/checkout' -Method Post -Body $body -ContentType 'application/json'
```

### View All Carts
```powershell
Invoke-RestMethod -Uri 'http://localhost:8000/api/admin/carts' -Method Get
```

---

## 📊 Current Test Data

### Cart-004 (John Doe - ₹17.90)
- Apple × 3 = ₹5.97
- Banana × 5 = ₹4.95
- Orange Juice × 2 = ₹6.98

### Cart-005 (Priya Sharma - ₹4.98)
- Milk × 2 = ₹4.98

---

## 🎮 Try These Now!

1. **Login**: http://localhost:5173/admin
2. **View cart-004 details**: Click eye icon
3. **Test health**: Click "Test API Connection"
4. **Reset a cart**: Click reset icon on cart-001
5. **Export data**: Click "Export CSV"

---

## 🆘 Need Help?

- **Full Guide**: See `ADMIN_PANEL_GUIDE.md`
- **README**: See `README.md`
- **API Docs**: http://localhost:8000/docs

---

**🎉 Everything is ready! Start exploring the admin panel now!**