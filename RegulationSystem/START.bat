@echo off
echo ========================================
echo   LexAlign 法規比對系統 - 啟動腳本
echo ========================================
echo.

REM 檢查 Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [錯誤] 未安裝 Node.js，請先安裝 Node.js
    pause
    exit /b 1
)

echo [1/4] 檢查環境...
echo Node.js 版本:
node --version
echo.

REM 後端設定
echo [2/4] 檢查後端環境...
cd backend
if not exist "node_modules" (
    echo 首次運行，安裝後端依賴...
    call npm install
)
if not exist ".env" (
    echo [警告] 後端 .env 檔案不存在，請確認已設定
)
cd ..
echo.

REM 前端設定
echo [3/4] 檢查前端環境...
cd frontend-vue
if not exist "node_modules" (
    echo 首次運行，安裝前端依賴...
    call npm install
)
if not exist ".env" (
    echo [警告] 前端 .env 檔案不存在，已自動創建預設值
    echo VITE_API_URL=http://localhost:3001 > .env
)
cd ..
echo.

echo [4/4] 啟動服務...
echo.
echo ========================================
echo   後端服務將在新視窗啟動 (Port 3001)
echo   前端服務將在新視窗啟動 (Port 5173)
echo ========================================
echo.

REM 啟動後端
start "LexAlign Backend" cmd /k "cd backend && npm start"
timeout /t 3 >nul

REM 啟動前端
start "LexAlign Frontend" cmd /k "cd frontend-vue && npm run dev"
timeout /t 3 >nul

echo.
echo ========================================
echo   ✅ 系統啟動完成！
echo ========================================
echo.
echo   前端: http://localhost:5173
echo   後端: http://localhost:3001
echo.
echo   按任意鍵開啟瀏覽器...
pause >nul

start http://localhost:5173

echo.
echo 若要停止系統，請關閉兩個 CMD 視窗
pause
