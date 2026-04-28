@echo off
echo 🚀 Starting SmartCart AI System with Admin Panel...
echo.

echo 📊 Starting MongoDB (if not running)...
echo    Make sure MongoDB is running on port 27017
echo    Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest
echo.

echo 🔧 Starting FastAPI server...
cd fastapi-server
start "FastAPI Server" python start.py
cd ..

timeout /t 3 /nobreak >nul

echo 🎨 Starting React client...
cd client
start "React Client" npm run dev
cd ..

echo.
echo ✅ System started successfully!
echo.
echo 📱 Scanner App: http://localhost:5173
echo 🔗 FastAPI API: http://localhost:8000
echo 👨‍💼 Admin Panel: http://localhost:5173/admin
echo.
echo 🔐 Admin Credentials:
echo    Username: smartcart_admin
echo    Password: admin@2025
echo.
echo Press any key to continue...
pause >nul