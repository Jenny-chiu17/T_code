@echo off
echo ========================================
echo   法規對應比對系統 - 更新後重啟
echo ========================================
echo.

echo [1/4] 停止現有伺服器...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/4] 清除前端快取...
cd frontend-vue
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo 快取已清除
) else (
    echo 無需清除快取
)

echo [3/4] 啟動後端伺服器...
cd ..\backend
start "Backend Server" cmd /c "npm start"
timeout /t 3 /nobreak >nul

echo [4/4] 啟動前端開發伺服器 (強制重新編譯)...
cd ..\frontend-vue
start "Frontend Server" cmd /c "npm run dev -- --force"

echo.
echo ========================================
echo   系統啟動完成！
echo ========================================
echo.
echo 前端網址: http://localhost:5173
echo 後端網址: http://localhost:3000
echo.
echo 請等待幾秒鐘讓伺服器完全啟動
echo 然後在瀏覽器中按 Ctrl+Shift+R 強制刷新頁面
echo.
pause
