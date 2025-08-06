# 🔐 SOLUCIÓN: Error de Autenticación GitLab

## ❌ **PROBLEMA:**
```
HTTP Basic: Access denied. Authentication failed
```

## ✅ **SOLUCIÓN PASO A PASO:**

### **OPCIÓN 1 - TOKEN DE ACCESO PERSONAL (RECOMENDADO)**

#### 1. **Crear Token en GitLab:**
1. Ve a: https://gitlab.com/-/profile/personal_access_tokens
2. Click "Add new token"
3. **Name:** `whatsapp-bot-token`
4. **Expiration:** 1 año (o sin expiración)
5. **Scopes:** Marcar:
   - ✅ `read_repository`
   - ✅ `write_repository`
   - ✅ `api`
6. Click "Create personal access token"
7. **¡COPIA EL TOKEN!** (solo se muestra una vez)

#### 2. **Configurar Git con Token:**
```bash
# Eliminar remote actual
git remote remove origin

# Agregar remote con token
git remote add origin https://TOKEN_AQUI@gitlab.com/melodiabl-group/whatsapp-bot-panel.git

# Ejemplo:
# git remote add origin https://glpat-xxxxxxxxxxxxxxxxxxxx@gitlab.com/melodiabl-group/whatsapp-bot-panel.git
```

#### 3. **Subir Proyecto:**
```bash
git push -u origin main
```

---

### **OPCIÓN 2 - SSH (ALTERNATIVA)**

#### 1. **Generar Clave SSH:**
```bash
ssh-keygen -t ed25519 -C "melodiabl-group@gmail.com"
```

#### 2. **Agregar Clave a GitLab:**
1. Ve a: https://gitlab.com/-/profile/keys
2. Copia contenido de: `~/.ssh/id_ed25519.pub`
3. Pega en GitLab y guarda

#### 3. **Cambiar Remote a SSH:**
```bash
git remote remove origin
git remote add origin git@gitlab.com:melodiabl-group/whatsapp-bot-panel.git
git push -u origin main
```

---

### **OPCIÓN 3 - CREDENCIALES WINDOWS**

#### 1. **Limpiar Credenciales:**
```bash
git config --global --unset credential.helper
```

#### 2. **Configurar Nuevo Helper:**
```bash
git config --global credential.helper manager-core
```

#### 3. **Intentar Push (pedirá credenciales):**
```bash
git push -u origin main
```
- **Usuario:** tu email de GitLab
- **Contraseña:** tu token personal (NO tu contraseña)

---

## 🚀 **COMANDOS RÁPIDOS:**

### **Con Token Personal:**
```bash
# 1. Reemplaza TOKEN_AQUI con tu token real
git remote remove origin
git remote add origin https://TOKEN_AQUI@gitlab.com/melodiabl-group/whatsapp-bot-panel.git
git push -u origin main
```

### **Verificar que funcionó:**
```bash
git remote -v
git log --oneline -5
```

---

## 📋 **DESPUÉS DEL PUSH EXITOSO:**

1. **Ve a GitLab:** https://gitlab.com/melodiabl-group/whatsapp-bot-panel
2. **Verifica el código subido**
3. **Revisa el Pipeline:** https://gitlab.com/melodiabl-group/whatsapp-bot-panel/-/pipelines
4. **Conecta con Render** para auto-deploy

---

## 🔔 **DÓNDE VER NOTIFICACIONES:**

Una vez subido exitosamente:

### **GitLab Pipelines:**
- **URL:** https://gitlab.com/melodiabl-group/whatsapp-bot-panel/-/pipelines
- **Verás:** Build, Test, Deploy automático

### **Notifications:**
- **Campana** en barra superior de GitLab
- **Email** automático en cada pipeline

### **Environments:**
- **Deployments** → **Environments**
- **URLs de producción**

---

## ⚡ **PRÓXIMO PASO:**

1. **Crear token personal** en GitLab
2. **Ejecutar comandos** con tu token
3. **¡Tu bot estará en internet!**

**URL Final:** https://whatsapp-bot-panel.onrender.com
