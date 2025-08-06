@echo off
echo ========================================
echo   RENDER CLI DEPLOYMENT AUTOMATICO
echo ========================================
echo.

echo 🚀 DESPLEGANDO CON RENDER CLI...
echo.

echo 📋 CONFIGURACION AUTOMATICA:
echo   - Repositorio: https://gitlab.com/melodiabl-group/whatsapp-bot-panel
echo   - Rama: upload-project
echo   - Build: echo "Skipping frontend build - backend only"
echo   - Start: cd backend/full ^&^& node index.js
echo.

echo 🔧 VARIABLES DE ENTORNO:
echo   NODE_ENV=production
echo   PORT=10000
echo   JWT_SECRET=whatsapp_bot_jwt_secret_2024_melodia_secure_key
echo   ADMIN_PASSWORD=admin123
echo   BOT_NAME=Melodia WhatsApp Bot
echo.

echo 📱 COMANDOS RENDER CLI (Manual):
echo.
echo 1. Instalar Render CLI:
echo    curl -fsSL https://cli.render.com/install ^| sh
echo.
echo 2. Login:
echo    render auth login
echo.
echo 3. Crear servicio:
echo    render services create web ^
echo      --name whatsapp-bot-panel ^
echo      --repo https://gitlab.com/melodiabl-group/whatsapp-bot-panel ^
echo      --branch upload-project ^
echo      --build-command "echo 'Skipping frontend build - backend only'" ^
echo      --start-command "cd backend/full && node index.js" ^
echo      --plan free
echo.
echo 4. Configurar variables:
echo    render env set NODE_ENV=production
echo    render env set PORT=10000
echo    render env set JWT_SECRET=whatsapp_bot_jwt_secret_2024_melodia_secure_key
echo    render env set ADMIN_PASSWORD=admin123
echo    render env set BOT_NAME="Melodia WhatsApp Bot"
echo.
echo 5. Deploy:
echo    render services deploy
echo.

echo 🔔 DONDE VER NOTIFICACIONES:
echo.
echo GitLab:
echo   - Campana: https://gitlab.com/dashboard/todos
echo   - Pipelines: https://gitlab.com/melodiabl-group/whatsapp-bot-panel/-/pipelines
echo.
echo Render:
echo   - Dashboard: https://dashboard.render.com
echo   - Logs en tiempo real
echo   - Notificaciones por email
echo.

echo 🌐 URL FINAL:
echo   Panel: https://whatsapp-bot-panel.onrender.com
echo   Login: admin / admin123
echo.

echo ✅ CONFIGURACION RENDER CLI LISTA
echo Tu WhatsApp Bot Panel esta preparado para Render CLI!
echo.

pause
