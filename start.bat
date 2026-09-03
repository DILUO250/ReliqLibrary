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
echo [2/2] 正在以最小化方式启动后端与前端...
start /min "RTL Backend" cmd /k "npm run dev:backend"
ping -n 4 127.0.0.1 >nul
start /min "RTL Frontend" cmd /k "npm run dev:frontend"

echo.
echo 「遗迹图书馆」已启动（窗口最小化在任务栏，点击还原可查看日志）：
echo   前端  http://localhost:4290
echo   后端  http://127.0.0.1:3000
echo.
echo 本窗口将在 30 秒后自动关闭。
echo.
ping -n 31 127.0.0.1 >nul
