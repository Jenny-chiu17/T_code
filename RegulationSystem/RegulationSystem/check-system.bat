@echo off
chcp 65001 >nul
echo ========================================
echo  法規比對系統 - 系統檢查
echo ========================================
echo.

echo [1] 檢查 Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 未安裝 Node.js
    goto :end
) else (
    node --version
    echo ✅ Node.js 已安裝
)

echo.
echo [2] 檢查後端依賴...
if exist backend\node_modules (
    echo ✅ 後端依賴已安裝
) else (
    echo ⚠️  後端依賴未安裝
    echo    請執行: cd backend ^&^& npm install
)

echo.
echo [3] 檢查前端依賴...
if exist frontend-vue\node_modules (
    echo ✅ 前端依賴已安裝
) else (
    echo ⚠️  前端依賴未安裝
    echo    請執行: cd frontend-vue ^&^& npm install
)

echo.
echo [4] 檢查後端設定...
if exist backend\.env (
    echo ✅ backend\.env 存在
    echo.
    echo 當前設定:
    type backend\.env
) else (
    echo ❌ backend\.env 不存在
    echo    請創建此檔案並設定 GOOGLE_API_KEY
)

echo.
echo [5] 檢查前端設定...
if exist frontend-vue\.env (
    echo ✅ frontend-vue\.env 存在
) else (
    echo ⚠️  frontend-vue\.env 不存在 (將使用預設值)
)

echo.
echo [6] 檢查內規資料夾...
if exist data\internal_rules (
    echo ✅ data\internal_rules 存在
    dir /b data\internal_rules\*.docx 2>nul | find /c /v "" > temp.txt
    set /p count=<temp.txt
    del temp.txt
    echo    找到文件數: %count%
) else (
    echo ⚠️  data\internal_rules 不存在
    echo    系統可以正常運行,但需要上傳內規文件
)

:end
echo.
echo ========================================
echo  檢查完成
echo ========================================
echo.
echo 如果所有項目都顯示 ✅,可以執行 start-system.bat 啟動系統
echo.
pause
