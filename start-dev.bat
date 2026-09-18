@echo off
echo ========================================================
echo Starting InfraHub Fullstack Platform
echo ========================================================
echo.

cd /d "%~dp0backend"
start "InfraHub Backend (Flask)" cmd /k "venv\Scripts\python.exe run.py"

cd /d "%~dp0frontend"
start "InfraHub Frontend (Vite)" cmd /k "npm.cmd run dev -- --host 0.0.0.0 --port 8501"

echo.
echo Servers started!
echo Frontend: http://localhost:8501 or http://192.168.1.108:8501
echo Backend:  http://localhost:5000 or http://192.168.1.108:5000
echo.
