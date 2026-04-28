#!/bin/bash

echo "🚀 Starting SmartCart QR Session System..."
echo ""

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB not detected. Please start MongoDB first:"
    echo "   docker run -d -p 27017:27017 --name mongodb mongo:latest"
    echo "   OR install MongoDB locally"
    echo ""
fi

# Start FastAPI server in background
echo "🔧 Starting FastAPI server..."
cd fastapi-server
python start.py &
FASTAPI_PID=$!
cd ..

# Wait a moment for FastAPI to start
sleep 3

# Start React client
echo "🎨 Starting React client..."
cd client
npm run dev &
CLIENT_PID=$!
cd ..

echo ""
echo "✅ System started successfully!"
echo ""
echo "📱 Scanner App: http://localhost:5173 (default mode)"
echo "🖥️  POS System: http://localhost:5173 (click 'Switch to POS App')"
echo "🔗 FastAPI API: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all services..."

# Wait for interrupt
trap "echo ''; echo '🛑 Stopping services...'; kill $FASTAPI_PID $CLIENT_PID 2>/dev/null; exit 0" INT
wait