#!/usr/bin/env python3
"""
SmartCart FastAPI Server Startup Script
"""
import uvicorn
import os

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")
    
    print(f"🚀 Starting SmartCart FastAPI server on {host}:{port}")
    print("📱 Make sure MongoDB is running on mongodb://localhost:27017")
    print("🔗 POS System will be available at http://localhost:5173 (switch to POS mode)")
    print("📱 Scanner App will be available at http://localhost:5173 (default mode)")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )