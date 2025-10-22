@echo off
chcp 65001 >nul
echo ========================================
echo  法規比對系統 - 啟動腳本
echo ========================================
echo.

echo [1/3] 檢查環境...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 未安裝 Node.js，請先安裝
    pause
    exit /b 1
)
echo ✅ Node.js 已安裝

echo.
echo [2/3] 啟動後端服務 (Port 3001)...
start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo [3/3] 啟動前端服務 (Port 5173)...
start "Frontend UI" cmd /k "cd frontend-vue && npm run dev"

echo.
echo ========================================
echo  ✅ 系統啟動完成!
echo ========================================
echo.
echo  後端: http://localhost:3001
echo  前端: http://localhost:5173
echo.
echo  請等待 5 秒後在瀏覽器打開前端...
echo ========================================
timeout /t 5 /nobreak >nul
start http://localhost:5173

pause
