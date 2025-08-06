# 🚀 Guía Completa para Desplegar en Render (GRATIS)

## 📋 **Pasos para Desplegar:**

### 1. **Preparar Repositorio GitHub**
```bash
# Si no tienes git inicializado
git init
git add .
git commit -m "Initial commit - WhatsApp Bot Panel"

# Crear repositorio en GitHub y subir
git remote add origin https://github.com/tu-usuario/whatsapp-bot-panel.git
git branch -M main
git push -u origin main
```

### 2. **Crear Cuenta en Render**
1. Ve a [render.com](https://render.com)
2. Regístrate con GitHub (gratis)
3. Conecta tu repositorio

### 3. **Configurar Web Service**
1. Click "New +" → "Web Service"
2. Conectar repositorio GitHub
3. Configuración:
   - **Name:** `whatsapp-bot-panel`
   - **Environment:** `Node`
   - **Build Command:** `npm run railway:build`
   - **Start Command:** `npm run start:production`
   - **Plan:** `Free`

### 4. **Variables de Entorno**
En la sección "Environment", agregar:
```
NODE_ENV=production
PORT=10000
JWT_SECRET=whatsapp_bot_jwt_secret_2024_melodia_secure_key
ADMIN_PASSWORD=admin123
BOT_NAME=Melodia WhatsApp Bot
DATABASE_PATH=/opt/render/project/src/backend/full/storage/database.sqlite
FRONTEND_URL=https://tu-app.onrender.com
```

### 5. **Configurar Disco Persistente (Opcional)**
Para mantener la base de datos:
1. En "Settings" → "Disks"
2. Add Disk:
   - **Name:** `data`
   - **Mount Path:** `/opt/render/project/src/backend/full/storage`
   - **Size:** `1 GB`

## 🎯 **Después del Despliegue:**

### Tu bot estará disponible en:
- **URL:** `https://tu-app.onrender.com`
- **Panel Admin:** `https://tu-app.onrender.com/login`
- **API:** `https://tu-app.onrender.com/api/`

### Credenciales por defecto:
- **Usuario:** `admin`
- **Contraseña:** `admin123`

## 📊 **Monitoreo:**
- **Logs:** En el dashboard de Render
- **Métricas:** CPU, memoria, requests
- **Status:** Online/offline

## ⚠️ **Limitaciones Plan Gratuito:**
- Se duerme después de 15 min sin actividad
- 750 horas/mes (suficiente para uso personal)
- 0.1 CPU, 512 MB RAM

## 🔄 **Auto-Deploy:**
Cada push a `main` desplegará automáticamente

## 🆘 **Troubleshooting:**
- **Build falla:** Revisar logs en Render
- **App no inicia:** Verificar variables de entorno
- **Base de datos:** Asegurar disco persistente configurado
