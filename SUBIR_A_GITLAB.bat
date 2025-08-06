@echo off
color 0B
echo.
echo ========================================
echo    WHATSAPP BOT PANEL - SUBIR A GITLAB
echo ========================================
echo.
echo Tu proyecto esta 100%% LISTO con commits hechos!
echo.
echo OPCION 1 - MANUAL (MAS RAPIDO):
echo ================================
echo 1. Ve a: https://gitlab.com/projects/new
echo 2. Project name: whatsapp-bot-panel
echo 3. Description: WhatsApp Bot Panel con React y Node.js
echo 4. Visibility Level: PUBLIC
echo 5. NO marcar "Initialize repository with a README"
echo 6. Click "Create project"
echo.
echo 7. Ejecuta estos comandos UNO POR UNO:
echo    git remote add origin https://gitlab.com/TU-USUARIO/whatsapp-bot-panel.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo OPCION 2 - CON GITLAB CLI (glab):
echo =================================
echo 1. Instala GitLab CLI: scoop install glab
echo 2. Ejecuta: glab auth login
echo 3. Ejecuta: glab repo create whatsapp-bot-panel --public
echo 4. Ejecuta: git branch -M main
echo 5. Ejecuta: git push -u origin main
echo.
echo ========================================
echo    DESPLEGAR EN RENDER (GRATIS)
echo ========================================
echo.
echo 1. Ve a: https://render.com
echo 2. Registrate con GitLab
echo 3. New + ^> Web Service
echo 4. Conecta tu repositorio "whatsapp-bot-panel"
echo 5. Configuracion AUTOMATICA (ya tienes render.yaml)
echo 6. Click "Create Web Service"
echo.
echo ========================================
echo    DONDE VER NOTIFICACIONES EN GITLAB
echo ========================================
echo.
echo 1. CI/CD Pipelines: 
echo    https://gitlab.com/TU-USUARIO/whatsapp-bot-panel/-/pipelines
echo.
echo 2. Notifications: Campana en barra superior
echo.
echo 3. Environments: Deployments ^> Environments
echo.
echo 4. Issues ^& Merge Requests: Para colaboracion
echo.
echo ========================================
echo    URLS FINALES
echo ========================================
echo.
echo Panel: https://whatsapp-bot-panel.onrender.com
echo Login: admin / admin123
echo GitLab Repo: https://gitlab.com/TU-USUARIO/whatsapp-bot-panel
echo.
echo ¡Tu bot estara en internet en unos minutos!
echo.
pause
