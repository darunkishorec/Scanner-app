@echo off
echo 🔄 Cart Reset Utility
echo.

if "%1"=="" (
    echo Usage: reset-cart.bat CART-001
    echo.
    echo Available carts: CART-001, CART-002, CART-003, CART-004, CART-005
    echo.
    echo Examples:
    echo   reset-cart.bat CART-001    (reset specific cart)
    echo   reset-cart.bat ALL         (reset all carts)
    echo.
    pause
    exit /b
)

if "%1"=="ALL" (
    echo Resetting all carts...
    curl -X POST http://localhost:3001/api/free-cart -H "Content-Type: application/json" -d "{\"cartId\": \"CART-001\"}"
    curl -X POST http://localhost:3001/api/free-cart -H "Content-Type: application/json" -d "{\"cartId\": \"CART-002\"}"
    curl -X POST http://localhost:3001/api/free-cart -H "Content-Type: application/json" -d "{\"cartId\": \"CART-003\"}"
    curl -X POST http://localhost:3001/api/free-cart -H "Content-Type: application/json" -d "{\"cartId\": \"CART-004\"}"
    curl -X POST http://localhost:3001/api/free-cart -H "Content-Type: application/json" -d "{\"cartId\": \"CART-005\"}"
    echo.
    echo ✅ All carts reset to available!
) else (
    echo Resetting cart %1...
    curl -X POST http://localhost:3001/api/free-cart -H "Content-Type: application/json" -d "{\"cartId\": \"%1\"}"
    echo.
    echo ✅ Cart %1 reset to available!
)

echo.
echo 📋 Current cart status:
curl -s http://localhost:3001/api/carts
echo.
echo.
pause