@echo off
chcp 65001 >nul
echo ========================================
echo  LexAlign 初始化安裝
echo ========================================
echo.

echo [1/2] 安裝後端依賴...
cd backend
if exist node_modules (
    echo 後端依賴已存在,跳過安裝
) else (
    echo 正在安裝後端依賴...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ 後端依賴安裝失敗
        pause
        exit /b 1
    )
    echo ✅ 後端依賴安裝成功
)
cd ..

echo.
echo [2/2] 安裝前端依賴...
cd frontend-vue
if exist node_modules (
    echo 前端依賴已存在,跳過安裝
) else (
    echo 正在安裝前端依賴...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ 前端依賴安裝失敗
        pause
        exit /b 1
    )
    echo ✅ 前端依賴安裝成功
)
cd ..

echo.
echo ========================================
echo  ✅ 安裝完成!
echo ========================================
echo.
echo 下一步:
echo 1. 確認 backend\.env 中的 GOOGLE_API_KEY
echo 2. 執行 start-system.bat 啟動系統
echo.
pause
