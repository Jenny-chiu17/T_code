@echo off
echo ========================================
echo   清除快取並重啟系統
echo ========================================
echo.

echo [1/5] 停止所有 Node 進程...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/5] 清除前端快取...
cd frontend-vue
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo ✓ Vite 快取已清除
)
if exist "dist" (
    rmdir /s /q "dist"
    echo ✓ Dist 資料夾已清除
)

echo [3/5] 清除瀏覽器快取提示...
echo.
echo ⚠️  請在瀏覽器中執行以下操作：
echo    1. 按 Ctrl + Shift + Delete 打開清除快取視窗
echo    2. 選擇「快取的圖片和檔案」
echo    3. 點擊「清除資料」
echo.
echo    或者直接按 Ctrl + Shift + R 強制重新載入
echo.
pause

echo [4/5] 啟動後端伺服器...
cd ..\backend
start "Backend Server" cmd /c "npm start"
timeout /t 3 /nobreak >nul

echo [5/5] 啟動前端開發伺服器...
cd ..\frontend-vue
start "Frontend Server" cmd /c "npm run dev -- --force"

echo.
echo ========================================
echo   啟動完成！
echo ========================================
echo.
echo 前端: http://localhost:3000
echo 後端: http://localhost:3000 (backend)
echo.
echo ⚠️  重要：請在瀏覽器中按 Ctrl+Shift+R 強制刷新！
echo.
pause
