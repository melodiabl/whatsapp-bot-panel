@echo off
echo ========================================
echo    DESPLIEGUE AUTOMATICO A INTERNET
echo ========================================
echo.

echo [1/4] Preparando proyecto para despliegue...
git add .
git commit -m "Deploy: Sistema completo con logs y registro automatico"

echo.
echo [2/4] Subiendo a GitHub...
git push origin main

echo.
echo [3/4] Desplegando en Render...
echo Abriendo Render Dashboard...
start https://dashboard.render.com

echo.
echo [4/4] URLs que tendras:
echo.
echo 🌐 PANEL WEB: https://tu-proyecto.onrender.com
echo 🔑 LOGIN: https://tu-proyecto.onrender.com/login
echo 📱 API: https://tu-proyecto.onrender.com/api
echo.
echo ========================================
echo   INSTRUCCIONES PARA TU ADMIN:
echo ========================================
echo.
echo 1. Usa la URL: https://tu-proyecto.onrender.com
echo 2. Usuario: admin
echo 3. Contraseña: admin123
echo.
echo ⚠️  IMPORTANTE: Cambia la contraseña después del primer login
echo.
pause
