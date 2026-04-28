import os
import random
import string
import time
import asyncio
from datetime import datetime, timedelta, timezone
from typing import Optional, List
from collections import deque

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
import json

load_dotenv()

# ── Config ────────────────────────────────────────────────────────────────────
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "smartcart")
STORE_ID = os.getenv("STORE_ID", "store-01")
TOKEN_EXPIRE_MINUTES = int(os.getenv("TOKEN_EXPIRE_MINUTES", "10"))
ABANDONMENT_THRESHOLD_MINUTES = 15  # Flag carts inactive for 15+ minutes

# Fixed set of cart IDs - single source of truth (always uppercase)
CART_IDS = ["CART-001", "CART-002", "CART-003", "CART-004", "CART-005"]

# Queue system
waiting_queue = deque()  # Queue of customers waiting for carts

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="SmartCart API")

# CORS Configuration
# For production: Add your Vercel domain to allow_origins list
# Example: allow_origins=["https://your-app-name.vercel.app", "http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins - restrict in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── DB ────────────────────────────────────────────────────────────────────────
client: AsyncIOMotorClient = None
db = None


@app.on_event("startup")
async def startup():
    global client, db
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    # TTL index — auto-delete expired sessions after 1 hour
    await db.cart_sessions.create_index("expiresAt", expireAfterSeconds=3600)
    await db.cart_sessions.create_index("cartId")
    await db.cart_sessions.create_index("token", unique=True, sparse=True)
    
    # Create logs collection indexes
    await db.logs.create_index("timestamp")
    await db.logs.create_index([("timestamp", -1)])
    
    print(f"Connected to MongoDB: {DB_NAME}")


@app.on_event("shutdown")
async def shutdown():
    client.close()


# ── Logging Utility ───────────────────────────────────────────────────────────
async def log_event(level: str, message: str, cart_id: Optional[str] = None, admin_action: bool = False):
    """Write log entry to MongoDB logs collection"""
    try:
        log_entry = {
            "timestamp": now_utc(),
            "level": level.upper(),
            "message": message,
            "cartId": cart_id,
            "adminAction": admin_action
        }
        await db.logs.insert_one(log_entry)
    except Exception as e:
        print(f"Failed to write log: {e}")


# ── Helpers ───────────────────────────────────────────────────────────────────
def generate_token() -> str:
    chars = string.ascii_letters + string.digits
    return "SC-" + "".join(random.choices(chars, k=8))


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def session_to_dict(doc: dict) -> dict:
    """Strip MongoDB _id and convert datetime to ISO string."""
    if doc is None:
        return None
    doc = doc.copy()
    doc.pop("_id", None)
    for key in ("expiresAt", "createdAt", "connectedAt", "lastUpdated"):
        if isinstance(doc.get(key), datetime):
            doc[key] = doc[key].isoformat()
    return doc


def log_to_dict(doc: dict) -> dict:
    """Convert log document for API response"""
    if doc is None:
        return None
    doc = doc.copy()
    doc.pop("_id", None)
    if isinstance(doc.get("timestamp"), datetime):
        doc["timestamp"] = doc["timestamp"].isoformat()
    return doc


# ── Request / Response models ─────────────────────────────────────────────────
class GenerateQRRequest(BaseModel):
    cartId: str
    storeId: str = STORE_ID


class ConnectRequest(BaseModel):
    cartId: str
    token: str
    customerName: str
    customerPhone: str


class AddItemRequest(BaseModel):
    cartId: str
    name: str
    price: float
    qty: int = 1


class CheckoutRequest(BaseModel):
    cartId: str


class ValidateCartRequest(BaseModel):
    cartId: str
    name: str
    phone: str


class AdminResetCartRequest(BaseModel):
    cartId: str


class AdminOverrideStatusRequest(BaseModel):
    cartId: str
    newStatus: str


class QueueJoinRequest(BaseModel):
    customerName: str
    customerPhone: str


# ── Customer Endpoints ────────────────────────────────────────────────────────

@app.post("/api/cart/generate-qr")
async def generate_qr(req: GenerateQRRequest):
    """
    Called by the POS on load and every 8 minutes.
    Creates (or replaces) a waiting session for the cart.
    Returns the QR data string the POS should encode.
    """
    # Normalize cart ID to uppercase
    cart_id = req.cartId.upper()
    
    token = generate_token()
    expires_at = now_utc() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    created_at = now_utc()

    session = {
        "cartId": cart_id,
        "token": token,
        "storeId": req.storeId,
        "status": "waiting",
        "customerName": None,
        "customerPhone": None,
        "expiresAt": expires_at,
        "items": [],
        "total": 0.0,
        "createdAt": created_at,
        "connectedAt": None,
        "lastUpdated": created_at,
        "statusHistory": [{"status": "waiting", "timestamp": created_at}]
    }

    # Replace any existing waiting session for this cart
    await db.cart_sessions.delete_many(
        {"cartId": cart_id, "status": "waiting"}
    )
    await db.cart_sessions.insert_one(session)

    qr_data = (
        f"smartcart://connect?cartId={cart_id}"
        f"&token={token}&storeId={req.storeId}"
    )

    await log_event("INFO", f"QR generated for {cart_id}", cart_id)

    return {
        "qrData": qr_data,
        "token": token,
        "expiresAt": expires_at.isoformat(),
        "cartId": cart_id,
    }


@app.post("/api/cart/connect")
async def connect_cart(req: ConnectRequest):
    """
    Called by the scanner app after a valid QR is scanned.
    Validates token, links customer to cart session.
    """
    # Normalize cart ID to uppercase
    cart_id = req.cartId.upper()
    
    session = await db.cart_sessions.find_one(
        {"cartId": cart_id, "token": req.token}
    )

    if not session:
        await log_event("WARN", f"Invalid token attempt for {cart_id}", cart_id)
        raise HTTPException(
            status_code=404,
            detail={"error": "TOKEN_INVALID", "message": "QR code not recognised."},
        )

    if session["status"] != "waiting":
        await log_event("WARN", f"Cart {cart_id} connection attempt while {session['status']}", cart_id)
        raise HTTPException(
            status_code=409,
            detail={"error": "CART_IN_USE", "message": "Cart is already connected."},
        )

    if now_utc() > session["expiresAt"].replace(tzinfo=timezone.utc):
        await log_event("WARN", f"Expired token attempt for {cart_id}", cart_id)
        raise HTTPException(
            status_code=410,
            detail={"error": "TOKEN_EXPIRED", "message": "QR Expired. Please ask staff to refresh."},
        )

    connected_at = now_utc()
    status_history = session.get("statusHistory", [])
    status_history.append({"status": "active", "timestamp": connected_at})

    await db.cart_sessions.update_one(
        {"cartId": cart_id, "token": req.token},
        {
            "$set": {
                "status": "active",
                "customerName": req.customerName,
                "customerPhone": req.customerPhone,
                "connectedAt": connected_at,
                "lastUpdated": connected_at,
                "statusHistory": status_history
            }
        },
    )

    await log_event("INFO", f"Customer {req.customerName} connected to {cart_id}", cart_id)

    return {"success": True, "cartId": cart_id, "customerName": req.customerName}


@app.get("/api/cart/status/{cart_id}")
async def cart_status(cart_id: str):
    """
    Polled by the scanner app every 3 seconds.
    Also used by the POS to watch for customer connection.
    """
    # Normalize cart ID to uppercase
    cart_id = cart_id.upper()
    
    session = await db.cart_sessions.find_one(
        {"cartId": cart_id},
        sort=[("createdAt", -1)],  # latest session for this cart
    )

    if not session:
        raise HTTPException(status_code=404, detail="No session found for this cart.")

    return session_to_dict(session)


@app.post("/api/cart/add-item")
async def add_item(req: AddItemRequest):
    """
    Called by the POS AI system when a product is detected/added.
    Updates the active session's items array and recalculates total.
    """
    # Normalize cart ID to uppercase
    cart_id = req.cartId.upper()
    
    session = await db.cart_sessions.find_one(
        {"cartId": cart_id, "status": "active"}
    )
    if not session:
        raise HTTPException(status_code=404, detail="No active session for this cart.")

    new_item = {"name": req.name, "price": req.price, "qty": req.qty}
    items = session.get("items", [])

    # Merge with existing item if same name
    existing = next((i for i in items if i["name"] == req.name), None)
    if existing:
        existing["qty"] += req.qty
    else:
        items.append(new_item)

    total = sum(i["price"] * i["qty"] for i in items)
    last_updated = now_utc()

    await db.cart_sessions.update_one(
        {"cartId": cart_id, "status": "active"},
        {"$set": {"items": items, "total": round(total, 2), "lastUpdated": last_updated}},
    )

    await log_event("INFO", f"Item {req.name} added to {cart_id}", cart_id)

    return {"success": True, "items": items, "total": round(total, 2)}


class UpdateItemRequest(BaseModel):
    cartId: str
    name: str
    qty: int


@app.post("/api/cart/update-item")
async def update_item(req: UpdateItemRequest):
    """
    Update item quantity in cart. Set qty to exact value.
    Called by POS when item quantity is changed.
    """
    # Normalize cart ID to uppercase
    cart_id = req.cartId.upper()
    
    session = await db.cart_sessions.find_one(
        {"cartId": cart_id, "status": "active"}
    )
    if not session:
        raise HTTPException(status_code=404, detail="No active session for this cart.")

    items = session.get("items", [])
    
    # Find item by name
    existing = next((i for i in items if i["name"] == req.name), None)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Item {req.name} not found in cart.")
    
    # Update quantity
    if req.qty <= 0:
        # Remove item if quantity is 0 or negative
        items = [i for i in items if i["name"] != req.name]
        await log_event("INFO", f"Item {req.name} removed from {cart_id} (qty set to {req.qty})", cart_id)
    else:
        existing["qty"] = req.qty
        await log_event("INFO", f"Item {req.name} quantity updated to {req.qty} in {cart_id}", cart_id)

    total = sum(i["price"] * i["qty"] for i in items)
    last_updated = now_utc()

    await db.cart_sessions.update_one(
        {"cartId": cart_id, "status": "active"},
        {"$set": {"items": items, "total": round(total, 2), "lastUpdated": last_updated}},
    )

    return {"success": True, "items": items, "total": round(total, 2)}


class RemoveItemRequest(BaseModel):
    cartId: str
    name: str


@app.post("/api/cart/remove-item")
async def remove_item(req: RemoveItemRequest):
    """
    Remove item from cart completely.
    Called by POS when item is deleted from cart.
    """
    # Normalize cart ID to uppercase
    cart_id = req.cartId.upper()
    
    session = await db.cart_sessions.find_one(
        {"cartId": cart_id, "status": "active"}
    )
    if not session:
        raise HTTPException(status_code=404, detail="No active session for this cart.")

    items = session.get("items", [])
    
    # Find and remove item by name
    original_length = len(items)
    items = [i for i in items if i["name"] != req.name]
    
    if len(items) == original_length:
        raise HTTPException(status_code=404, detail=f"Item {req.name} not found in cart.")

    total = sum(i["price"] * i["qty"] for i in items)
    last_updated = now_utc()

    await db.cart_sessions.update_one(
        {"cartId": cart_id, "status": "active"},
        {"$set": {"items": items, "total": round(total, 2), "lastUpdated": last_updated}},
    )

    await log_event("INFO", f"Item {req.name} removed from {cart_id}", cart_id)

    return {"success": True, "items": items, "total": round(total, 2)}


@app.post("/api/cart/checkout")
async def checkout(req: CheckoutRequest):
    """
    Called by the POS on checkout.
    Scanner app polling detects status='checked-out' and shows thank-you screen.
    """
    # Normalize cart ID to uppercase
    cart_id = req.cartId.upper()
    
    session = await db.cart_sessions.find_one({"cartId": cart_id, "status": "active"})
    if not session:
        raise HTTPException(status_code=404, detail="No active session to check out.")

    checkout_time = now_utc()
    status_history = session.get("statusHistory", [])
    status_history.append({"status": "checked-out", "timestamp": checkout_time})

    result = await db.cart_sessions.update_one(
        {"cartId": cart_id, "status": "active"},
        {"$set": {
            "status": "checked-out", 
            "lastUpdated": checkout_time,
            "statusHistory": status_history
        }},
    )

    await log_event("INFO", f"Checkout completed for {cart_id} - Total: ₹{session.get('total', 0)}", cart_id)

    return {"success": True, "cartId": cart_id}


@app.post("/api/validate-cart")
async def validate_cart(req: ValidateCartRequest):
    """
    Legacy endpoint for scanner app compatibility.
    Validates cart ID format and checks if cart is available.
    Creates a new session if cart is available.
    """
    # Normalize cart ID to uppercase
    cart_id = req.cartId.upper()
    
    # Validate format
    if not cart_id or not cart_id.startswith("CART-"):
        await log_event("WARN", f"Invalid cart format: {cart_id}")
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": "INVALID_FORMAT",
                "message": "QR code doesn't match cart format"
            }
        )
    
    # Validate cart ID is in the known set
    if cart_id not in CART_IDS:
        await log_event("WARN", f"Cart not found: {cart_id}")
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": "CART_NOT_FOUND",
                "message": "This QR code isn't a valid cart"
            }
        )
    
    # Check if cart already has an active session
    existing_session = await db.cart_sessions.find_one(
        {"cartId": cart_id, "status": {"$in": ["active", "waiting"]}}
    )
    
    if existing_session and existing_session["status"] == "active":
        await log_event("WARN", f"Cart {cart_id} already in use", cart_id)
        raise HTTPException(
            status_code=409,
            detail={
                "success": False,
                "error": "CART_IN_USE",
                "message": f"Cart {cart_id} is already occupied"
            }
        )
    
    # Check if ALL carts are occupied - trigger queue system
    available_carts = await db.cart_sessions.count_documents({"status": "waiting"})
    if available_carts == 0:
        await log_event("WARN", f"All carts occupied - customer {req.name} needs to queue")
        raise HTTPException(
            status_code=503,
            detail={
                "success": False,
                "error": "ALL_CARTS_OCCUPIED",
                "message": "All carts are currently in use. Please join the queue.",
                "shouldQueue": True
            }
        )
    
    # Create new active session for this cart
    connected_at = now_utc()
    token = generate_token()
    expires_at = connected_at + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    
    session = {
        "cartId": cart_id,
        "token": token,
        "storeId": STORE_ID,
        "status": "active",
        "customerName": req.name,
        "customerPhone": req.phone,
        "expiresAt": expires_at,
        "items": [],
        "total": 0.0,
        "createdAt": connected_at,
        "connectedAt": connected_at,
        "lastUpdated": connected_at,
        "statusHistory": [
            {"status": "waiting", "timestamp": connected_at},
            {"status": "active", "timestamp": connected_at}
        ]
    }
    
    # Delete any existing session for this cart
    await db.cart_sessions.delete_many({"cartId": cart_id})
    
    # Insert new active session
    await db.cart_sessions.insert_one(session)
    
    await log_event("INFO", f"Customer {req.name} connected to {cart_id} via validate-cart", cart_id)
    
    return {
        "success": True,
        "cartId": cart_id,
        "assignedTo": req.name
    }


@app.get("/api/carts")
async def list_carts():
    """Debug — list all sessions."""
    docs = await db.cart_sessions.find({}, sort=[("createdAt", -1)]).to_list(50)
    return [session_to_dict(d) for d in docs]


# ── Admin Endpoints ───────────────────────────────────────────────────────────

@app.get("/api/admin/carts")
async def admin_list_carts():
    """Get all cart sessions for admin panel"""
    docs = await db.cart_sessions.find({}, sort=[("createdAt", -1)]).to_list(100)
    return [session_to_dict(d) for d in docs]


@app.post("/api/admin/reset-all-carts")
async def admin_reset_all_carts():
    """Reset all carts to waiting status - uses fixed set of cart IDs"""
    start_time = time.time()
    
    # Delete ALL existing sessions (including duplicates and stale entries)
    await db.cart_sessions.delete_many({})
    
    # Create fresh waiting sessions ONLY for the fixed set of cart IDs
    reset_time = now_utc()
    new_sessions = []
    
    for cart_id in CART_IDS:
        token = generate_token()
        expires_at = reset_time + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
        
        session = {
            "cartId": cart_id,  # Already uppercase from CART_IDS
            "token": token,
            "storeId": STORE_ID,
            "status": "waiting",
            "customerName": None,
            "customerPhone": None,
            "expiresAt": expires_at,
            "items": [],
            "total": 0.0,
            "createdAt": reset_time,
            "connectedAt": None,
            "lastUpdated": reset_time,
            "statusHistory": [{"status": "waiting", "timestamp": reset_time}]
        }
        new_sessions.append(session)
    
    # Insert exactly 5 cart sessions
    await db.cart_sessions.insert_many(new_sessions)
    
    end_time = time.time()
    await log_event("INFO", f"All {len(CART_IDS)} carts reset by admin", admin_action=True)
    
    return {
        "success": True, 
        "message": f"All {len(CART_IDS)} carts have been reset successfully.",
        "cartsReset": len(CART_IDS),
        "responseTime": round((end_time - start_time) * 1000, 2)
    }


@app.post("/api/admin/reset-cart/{cart_id}")
async def admin_reset_cart(cart_id: str):
    """Reset a specific cart to waiting status"""
    start_time = time.time()
    
    # Normalize cart ID to uppercase
    cart_id = cart_id.upper()
    
    # Validate cart ID is in the known set
    if cart_id not in CART_IDS:
        raise HTTPException(status_code=404, detail=f"Cart {cart_id} not found in system")
    
    # Delete existing session for this cart
    await db.cart_sessions.delete_many({"cartId": cart_id})
    
    # Create fresh waiting session
    reset_time = now_utc()
    token = generate_token()
    expires_at = reset_time + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    
    session = {
        "cartId": cart_id,
        "token": token,
        "storeId": STORE_ID,
        "status": "waiting",
        "customerName": None,
        "customerPhone": None,
        "expiresAt": expires_at,
        "items": [],
        "total": 0.0,
        "createdAt": reset_time,
        "connectedAt": None,
        "lastUpdated": reset_time,
        "statusHistory": [{"status": "waiting", "timestamp": reset_time}]
    }
    
    await db.cart_sessions.insert_one(session)
    
    end_time = time.time()
    await log_event("INFO", f"Cart {cart_id} reset by admin", cart_id, admin_action=True)
    
    return {
        "success": True,
        "message": f"{cart_id} has been reset.",
        "responseTime": round((end_time - start_time) * 1000, 2)
    }


@app.get("/api/health")
async def health_check():
    """System health check for admin panel"""
    start_time = time.time()
    health_status = {
        "fastapi": {"status": "operational", "responseTime": 0},
        "mongodb": {"status": "operational", "responseTime": 0},
        "cartService": {"status": "operational", "responseTime": 0},
        "tokenGenerator": {"status": "operational", "responseTime": 0}
    }
    
    # Test FastAPI
    fastapi_start = time.time()
    health_status["fastapi"]["responseTime"] = round((time.time() - fastapi_start) * 1000, 2)
    
    # Test MongoDB
    try:
        mongo_start = time.time()
        await db.cart_sessions.count_documents({})
        health_status["mongodb"]["responseTime"] = round((time.time() - mongo_start) * 1000, 2)
    except Exception as e:
        health_status["mongodb"]["status"] = "error"
        health_status["mongodb"]["error"] = str(e)
    
    # Test Cart Service
    try:
        cart_start = time.time()
        await db.cart_sessions.find_one({})
        health_status["cartService"]["responseTime"] = round((time.time() - cart_start) * 1000, 2)
    except Exception as e:
        health_status["cartService"]["status"] = "error"
        health_status["cartService"]["error"] = str(e)
    
    # Test Token Generator
    try:
        token_start = time.time()
        generate_token()
        health_status["tokenGenerator"]["responseTime"] = round((time.time() - token_start) * 1000, 2)
    except Exception as e:
        health_status["tokenGenerator"]["status"] = "error"
        health_status["tokenGenerator"]["error"] = str(e)
    
    total_time = round((time.time() - start_time) * 1000, 2)
    all_operational = all(service["status"] == "operational" for service in health_status.values())
    
    await log_event("INFO", f"Health check performed - Status: {'Operational' if all_operational else 'Degraded'}", admin_action=True)
    
    return {
        "status": "operational" if all_operational else "degraded",
        "totalResponseTime": total_time,
        "services": health_status,
        "timestamp": now_utc().isoformat()
    }


@app.get("/api/admin/logs")
async def admin_get_logs():
    """Get recent system logs"""
    logs = await db.logs.find({}, sort=[("timestamp", -1)]).limit(50).to_list(50)
    return [log_to_dict(log) for log in logs]


@app.post("/api/admin/logs")
async def admin_add_log(log_data: dict):
    """Add a log entry (for admin login tracking)"""
    try:
        log_entry = {
            "timestamp": now_utc(),
            "level": log_data.get("level", "INFO").upper(),
            "message": log_data.get("message", ""),
            "cartId": log_data.get("cartId"),
            "adminAction": log_data.get("adminAction", False)
        }
        await db.logs.insert_one(log_entry)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/admin/logs/clear")
async def admin_clear_logs():
    """Clear all system logs"""
    result = await db.logs.delete_many({})
    await log_event("INFO", f"System logs cleared by admin - {result.deleted_count} entries removed", admin_action=True)
    return {"success": True, "deletedCount": result.deleted_count}


@app.post("/api/admin/override-cart-status")
async def admin_override_cart_status(req: AdminOverrideStatusRequest):
    """Manually override cart status"""
    # Normalize cart ID to uppercase
    cart_id = req.cartId.upper()
    
    if req.newStatus not in ["waiting", "active", "checked-out"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be waiting, active, or checked-out")
    
    # Validate cart ID is in the known set
    if cart_id not in CART_IDS:
        raise HTTPException(status_code=404, detail=f"Cart {cart_id} not found in system")
    
    session = await db.cart_sessions.find_one({"cartId": cart_id})
    if not session:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    override_time = now_utc()
    status_history = session.get("statusHistory", [])
    status_history.append({"status": req.newStatus, "timestamp": override_time})
    
    update_data = {
        "status": req.newStatus,
        "lastUpdated": override_time,
        "statusHistory": status_history
    }
    
    # If setting to waiting, clear customer data
    if req.newStatus == "waiting":
        update_data.update({
            "customerName": None,
            "customerPhone": None,
            "connectedAt": None,
            "items": [],
            "total": 0.0
        })
    
    await db.cart_sessions.update_one(
        {"cartId": cart_id},
        {"$set": update_data}
    )
    
    await log_event("INFO", f"Cart {cart_id} status manually overridden to {req.newStatus} by admin", cart_id, admin_action=True)
    
    return {"success": True, "message": f"Cart {cart_id} status updated to {req.newStatus}"}


@app.get("/api/admin/daily-summary")
async def admin_daily_summary():
    """Get daily summary statistics"""
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Get today's checkouts
    checkouts_today = await db.cart_sessions.find({
        "status": "checked-out",
        "lastUpdated": {"$gte": today_start}
    }).to_list(1000)
    
    total_checkouts = len(checkouts_today)
    total_revenue = sum(checkout.get("total", 0) for checkout in checkouts_today)
    avg_cart_value = total_revenue / total_checkouts if total_checkouts > 0 else 0
    
    # Find busiest cart (most sessions today)
    all_sessions_today = await db.cart_sessions.find({
        "createdAt": {"$gte": today_start}
    }).to_list(1000)
    
    cart_session_counts = {}
    for session in all_sessions_today:
        cart_id = session["cartId"]
        cart_session_counts[cart_id] = cart_session_counts.get(cart_id, 0) + 1
    
    busiest_cart = max(cart_session_counts.items(), key=lambda x: x[1])[0] if cart_session_counts else None
    
    return {
        "totalCheckouts": total_checkouts,
        "totalRevenue": round(total_revenue, 2),
        "avgCartValue": round(avg_cart_value, 2),
        "busiestCart": busiest_cart,
        "date": today_start.isoformat()
    }


# ── SSE Endpoints ─────────────────────────────────────────────────────────────

@app.get("/api/sse/cart-updates")
async def cart_updates_sse(request: Request):
    """Server-Sent Events endpoint for real-time cart updates"""
    async def event_generator():
        try:
            while True:
                # Check if client disconnected
                if await request.is_disconnected():
                    break
                
                # Fetch all carts
                carts = await db.cart_sessions.find({}, sort=[("createdAt", -1)]).to_list(100)
                carts_data = [session_to_dict(cart) for cart in carts]
                
                # Check for abandoned carts
                now = now_utc()
                for cart in carts_data:
                    if cart.get("status") == "active" and cart.get("lastUpdated"):
                        try:
                            # Parse ISO format datetime string
                            last_updated_str = cart["lastUpdated"]
                            if isinstance(last_updated_str, str):
                                # Remove 'Z' and add timezone info
                                if last_updated_str.endswith('Z'):
                                    last_updated_str = last_updated_str[:-1] + '+00:00'
                                last_updated = datetime.fromisoformat(last_updated_str)
                            else:
                                last_updated = last_updated_str
                            
                            inactive_minutes = (now - last_updated).total_seconds() / 60
                            cart["isAbandoned"] = inactive_minutes >= ABANDONMENT_THRESHOLD_MINUTES
                            cart["inactiveMinutes"] = int(inactive_minutes)
                        except Exception as e:
                            print(f"Error calculating abandonment: {e}")
                            cart["isAbandoned"] = False
                            cart["inactiveMinutes"] = 0
                    else:
                        cart["isAbandoned"] = False
                        cart["inactiveMinutes"] = 0
                
                # Send data as SSE
                data = json.dumps({"carts": carts_data, "timestamp": now.isoformat()})
                yield f"data: {data}\n\n"
                
                # Wait 2 seconds before next update
                await asyncio.sleep(2)
                
        except asyncio.CancelledError:
            pass
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@app.get("/api/sse/cart-status/{cart_id}")
async def cart_status_sse(cart_id: str, request: Request):
    """SSE endpoint for individual cart status updates (for customer live view)"""
    cart_id = cart_id.upper()
    
    async def event_generator():
        try:
            while True:
                if await request.is_disconnected():
                    break
                
                # Fetch cart status
                session = await db.cart_sessions.find_one(
                    {"cartId": cart_id},
                    sort=[("createdAt", -1)]
                )
                
                if session:
                    cart_data = session_to_dict(session)
                    data = json.dumps(cart_data)
                    yield f"data: {data}\n\n"
                
                await asyncio.sleep(1)  # Update every second for live cart view
                
        except asyncio.CancelledError:
            pass
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


# ── Queue System Endpoints ────────────────────────────────────────────────────

@app.post("/api/queue/join")
async def join_queue(req: QueueJoinRequest):
    """Add customer to waiting queue when all carts are occupied"""
    # Check if any carts are available
    available_carts = await db.cart_sessions.count_documents({"status": "waiting"})
    
    if available_carts > 0:
        return {
            "success": False,
            "message": "Carts are available, no need to queue",
            "availableCarts": available_carts
        }
    
    # Generate queue ticket
    queue_id = f"Q-{int(time.time())}-{random.randint(1000, 9999)}"
    queue_entry = {
        "queueId": queue_id,
        "customerName": req.customerName,
        "customerPhone": req.customerPhone,
        "joinedAt": now_utc().isoformat(),
        "position": len(waiting_queue) + 1
    }
    
    waiting_queue.append(queue_entry)
    
    await log_event("INFO", f"Customer {req.customerName} joined queue at position {queue_entry['position']}")
    
    return {
        "success": True,
        "queueId": queue_id,
        "position": queue_entry["position"],
        "estimatedWaitMinutes": queue_entry["position"] * 5  # Estimate 5 min per person
    }


@app.get("/api/queue/status/{queue_id}")
async def queue_status(queue_id: str):
    """Get current queue position for a customer"""
    # Find customer in queue
    for idx, entry in enumerate(waiting_queue):
        if entry["queueId"] == queue_id:
            # Check if any carts became available
            available_carts = await db.cart_sessions.count_documents({"status": "waiting"})
            
            if available_carts > 0 and idx == 0:
                # First in queue and cart available - remove from queue
                waiting_queue.popleft()
                
                # Get available cart
                cart = await db.cart_sessions.find_one({"status": "waiting"})
                
                return {
                    "inQueue": False,
                    "cartAvailable": True,
                    "cartId": cart["cartId"],
                    "message": "Your cart is ready!"
                }
            
            return {
                "inQueue": True,
                "position": idx + 1,
                "estimatedWaitMinutes": (idx + 1) * 5,
                "queueLength": len(waiting_queue)
            }
    
    return {
        "inQueue": False,
        "cartAvailable": False,
        "message": "Queue ID not found"
    }


@app.get("/api/queue/list")
async def list_queue():
    """Admin endpoint to view current queue"""
    return {
        "queue": list(waiting_queue),
        "length": len(waiting_queue)
    }
