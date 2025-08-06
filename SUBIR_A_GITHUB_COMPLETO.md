# 🚀 Guía Completa: Subir a GitHub y Usar en Replit

## 📋 **PASO 1: Crear Repositorio en GitHub**

### **1.1 Ir a GitHub:**
1. Ve a [github.com](https://github.com)
2. Inicia sesión en tu cuenta
3. Click en el botón **"New"** (verde) o **"+"** → **"New repository"**

### **1.2 Configurar Repositorio:**
- **Repository name:** `whatsapp-bot-panel-completo`
- **Description:** `Bot de WhatsApp con Panel Web - Registro Automático + IA + Logs`
- **Visibility:** ✅ **Public** (para usar en Replit gratis)
- **Initialize:** ❌ NO marcar ninguna opción (README, .gitignore, license)
- Click **"Create repository"**

### **1.3 Copiar URL del Repositorio:**
Después de crear, GitHub te mostrará algo como:
```
https://github.com/tu-usuario/whatsapp-bot-panel-completo.git
```
**¡COPIA ESTA URL!** La necesitarás en el siguiente paso.

## 📋 **PASO 2: Subir Código a GitHub**

### **2.1 Ejecutar Comandos (uno por uno):**

```bash
# 1. Agregar remote de GitHub (CAMBIA LA URL POR LA TUYA)
git remote add origin https://github.com/tu-usuario/whatsapp-bot-panel-completo.git

# 2. Verificar que esté configurado
git remote -v

# 3. Subir código a GitHub
git push -u origin main
```

### **2.2 Si te pide autenticación:**
- **Username:** Tu usuario de GitHub
- **Password:** Tu **Personal Access Token** (NO tu contraseña normal)

### **2.3 Crear Personal Access Token (si no tienes):**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. **Scopes:** Marcar `repo` (acceso completo a repositorios)
4. **Expiration:** 90 days o No expiration
5. **Copiar el token** (solo se muestra una vez)

## 📋 **PASO 3: Usar en Replit**

### **3.1 Crear Repl desde GitHub:**
1. Ve a [replit.com](https://replit.com)
2. Click **"Create Repl"**
3. Selecciona **"Import from GitHub"**
4. Pega la URL de tu repositorio: `https://github.com/tu-usuario/whatsapp-bot-panel-completo`
5. **Language:** Node.js
6. **Repl name:** `whatsapp-bot-panel`
7. Click **"Import from GitHub"**

### **3.2 Configurar Variables de Entorno en Replit:**
1. En tu Repl, ve a **"Secrets"** (icono de candado en la barra lateral)
2. Agregar estas variables:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=whatsapp_bot_jwt_secret_2024_melodia_secure_key
ADMIN_PASSWORD=admin123
BOT_NAME=Melodia WhatsApp Bot
DATABASE_PATH=./backend/full/storage/database.sqlite
FRONTEND_URL=https://tu-repl-name.tu-usuario.repl.co
```

### **3.3 Configurar Archivo de Inicio:**
1. En Replit, crear archivo `.replit` en la raíz:

```toml
run = "node backend/full/index.js"
entrypoint = "backend/full/index.js"

[nix]
channel = "stable-22_11"

[deployment]
run = ["sh", "-c", "node backend/full/index.js"]
```

### **3.4 Instalar Dependencias:**
En la consola de Replit ejecutar:
```bash
npm install
```

### **3.5 Ejecutar el Bot:**
```bash
node backend/full/index.js
```

## 🌐 **PASO 4: Mantener 24/7 en Replit**

### **4.1 Replit Always On (Recomendado):**
- **Costo:** $20/mes por Repl
- **Beneficio:** Se mantiene ejecutando 24/7 automáticamente
- **Activar:** En tu Repl → Settings → Always On

### **4.2 Alternativa Gratuita (UptimeRobot):**
1. Ve a [uptimerobot.com](https://uptimerobot.com)
2. Crear cuenta gratuita
3. Add New Monitor:
   - **Type:** HTTP(s)
   - **URL:** `https://tu-repl-name.tu-usuario.repl.co`
   - **Interval:** 5 minutes
4. Esto "despertará" tu Repl cada 5 minutos

## 📱 **PASO 5: Configurar WhatsApp**

### **5.1 Conectar WhatsApp:**
1. Ejecutar el bot en Replit
2. Buscar en los logs el código QR o ir a: `https://tu-repl-name.tu-usuario.repl.co/qr`
3. Escanear con WhatsApp Web
4. ¡Bot conectado!

### **5.2 Autorizar Grupos:**
En WhatsApp, enviar al bot:
```
/autorizar_grupo
```

## 🎯 **PASO 6: Probar el Sistema**

### **6.1 Registro Automático:**
En WhatsApp:
```
/registrar miusuario123
```

### **6.2 Acceder al Panel:**
1. Ir a: `https://tu-repl-name.tu-usuario.repl.co`
2. Login con las credenciales recibidas por WhatsApp
3. ¡Panel funcionando!

### **6.3 Comandos Disponibles:**
```
/registrar username    # Registro automático
/resetpass username    # Reset contraseña
/miinfo               # Ver mi información
/ai pregunta          # Preguntar a IA
/clasificar texto     # Clasificar contenido
/logssystem          # Ver logs del sistema
```

## 🔧 **URLs Importantes:**

Una vez configurado tendrás:
- **🌐 Panel Web:** `https://tu-repl-name.tu-usuario.repl.co`
- **🔑 Login:** `https://tu-repl-name.tu-usuario.repl.co/login`
- **📱 QR WhatsApp:** `https://tu-repl-name.tu-usuario.repl.co/qr`
- **📊 API:** `https://tu-repl-name.tu-usuario.repl.co/api`

## ⚠️ **Credenciales por Defecto:**
- **Usuario:** `admin`
- **Contraseña:** `admin123`

**¡IMPORTANTE!** Cambia la contraseña después del primer login.

## 🎉 **¡LISTO!**

Tu bot estará funcionando 24/7 en internet con:
- ✅ **Registro automático** desde WhatsApp
- ✅ **Panel web** accesible desde cualquier lugar
- ✅ **IA integrada** con Gemini
- ✅ **Sistema de logs** completo
- ✅ **Gestión de usuarios** avanzada

## 🆘 **Troubleshooting:**

### **Error: "Cannot find module"**
```bash
npm install
```

### **Error: "Port already in use"**
Cambiar PORT en Secrets a otro número (ej: 3001)

### **Bot no responde en WhatsApp:**
1. Verificar que esté conectado en los logs
2. Re-escanear código QR si es necesario
3. Verificar que el grupo esté autorizado

### **Panel no carga:**
1. Verificar que el Repl esté ejecutándose
2. Revisar la URL (debe terminar en .repl.co)
3. Verificar variables de entorno

---

**¡Tu WhatsApp Bot Panel está listo para conquistar el mundo desde GitHub y Replit!** 🌍🚀
