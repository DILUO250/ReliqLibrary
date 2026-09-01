@echo off
setlocal
cd /d "%~dp0"

echo ==========================================
echo   「遗迹图书馆」 - Reliquiarum to Library
echo ==========================================
echo.

if not exist "node_modules\" (
  echo [1/2] 首次运行：正在安装依赖包...
  call npm install
  if errorlevel 1 (
    echo.
    echo 依赖安装失败。请确认已安装 Node.js 22.x LTS 或更高版本。
    pause
    exit /b 1
  )
) else (
  echo [1/2] 依赖已就绪。
)

echo.
echo [2/2] 正在启动后端与前端...
start "RTL Backend" cmd /k "npm run dev:backend"
timeout /t 3 /nobreak >nul
start "RTL Frontend" cmd /k "npm run dev:frontend"

echo.
echo 「遗迹图书馆」已启动：
echo   前端  http://localhost:4290
echo   后端  http://127.0.0.1:3000
echo.
echo 关闭对应窗口即可停止服务。
echo.
pause
