@echo off
echo 🚀 Configurando Variables de Entorno para Railway
echo.

echo ⚙️ Configurando variables básicas...
railway variables set NODE_ENV=production
railway variables set PORT=3001

echo 🔐 Configurando JWT Secret...
railway variables set JWT_SECRET=whatsapp_bot_jwt_secret_2024_melodia_secure_key

echo 🌐 Configurando URLs del frontend...
echo ⚠️  IMPORTANTE: Después del primer despliegue, actualiza estas URLs con tu dominio real
railway variables set FRONTEND_URL=https://whatsapp-bot-panel-production.up.railway.app
railway variables set RAILWAY_STATIC_URL=https://whatsapp-bot-panel-production.up.railway.app

echo 👤 Configurando credenciales de admin...
railway variables set ADMIN_PASSWORD=admin123
railway variables set BOT_NAME=Melodia WhatsApp Bot

echo 💾 Configurando base de datos...
railway variables set DATABASE_PATH=/app/backend/full/storage/database.sqlite

echo.
echo ✅ Variables de entorno configuradas!
echo.
echo 📋 Para ver todas las variables:
echo railway variables
echo.
echo 🚀 Para desplegar:
echo railway up
echo.
pause
