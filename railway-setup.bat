@echo off
echo 🚀 Configuración Rápida de Railway para WhatsApp Bot Panel
echo.

echo ✅ Verificando autenticación...
railway whoami
echo.

echo 📋 Estado actual del proyecto...
railway status
echo.

echo ⚙️ Variables de entorno actuales...
railway variables
echo.

echo 📝 Para configurar variables de entorno, usa estos comandos:
echo railway variables set NODE_ENV=production
echo railway variables set PORT=3001
echo railway variables set JWT_SECRET=tu_jwt_secret_aqui
echo railway variables set FRONTEND_URL=https://tu-app.railway.app
echo railway variables set ADMIN_PASSWORD=tu_password_admin
echo.

echo 🚀 Para desplegar, usa:
echo railway up
echo.

echo 📊 Para ver logs:
echo railway logs
echo.

echo 🌐 Para abrir la app:
echo railway open
echo.

pause
