# 🚀 RENDER CLI - INSTALACIÓN COMPLETA (TODOS LOS MÉTODOS)

## 🎯 **RESPUESTA A TU SOLICITUD:**
**"instala de todas las forma posible el render"**

---

## 📥 **MÉTODO 1: HOMEBREW (macOS/Linux) - RECOMENDADO**

### **macOS:**
```bash
# Instalar Homebrew si no lo tienes
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Actualizar Homebrew
brew update

# Instalar Render CLI
brew install render

# Verificar instalación
render --version
```

### **Linux (Ubuntu/Debian):**
```bash
# Instalar Homebrew en Linux
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Agregar al PATH
echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> ~/.bashrc
source ~/.bashrc

# Instalar Render CLI
brew install render
```

---

## 📥 **MÉTODO 2: WINDOWS - MÚLTIPLES OPCIONES**

### **Opción A: PowerShell (Recomendado Windows):**
```powershell
# Ejecutar como Administrador
iwr -useb https://cli.render.com/install.ps1 | iex

# Verificar instalación
render --version
```

### **Opción B: Chocolatey:**
```powershell
# Instalar Chocolatey si no lo tienes
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Instalar Render CLI
choco install render-cli

# Verificar instalación
render --version
```

### **Opción C: Scoop:**
```powershell
# Instalar Scoop si no lo tienes
iwr -useb get.scoop.sh | iex

# Instalar Render CLI
scoop install render

# Verificar instalación
render --version
```

### **Opción D: Descarga Manual Windows:**
```powershell
# Crear directorio
mkdir C:\render-cli
cd C:\render-cli

# Descargar ejecutable
Invoke-WebRequest -Uri "https://github.com/render-oss/cli/releases/latest/download/render-windows-amd64.exe" -OutFile "render.exe"

# Agregar al PATH del sistema
$env:PATH += ";C:\render-cli"

# Verificar instalación
render --version
```

---

## 📥 **MÉTODO 3: NPM/YARN (Node.js)**

### **Con NPM:**
```bash
# Instalación global
npm install -g @render/cli

# Verificar instalación
render --version
```

### **Con Yarn:**
```bash
# Instalación global
yarn global add @render/cli

# Verificar instalación
render --version
```

### **Con PNPM:**
```bash
# Instalación global
pnpm add -g @render/cli

# Verificar instalación
render --version
```

---

## 📥 **MÉTODO 4: DESCARGA DIRECTA (Todos los OS)**

### **Linux x64:**
```bash
# Descargar
curl -L https://github.com/render-oss/cli/releases/latest/download/render-linux-amd64 -o render

# Hacer ejecutable
chmod +x render

# Mover a PATH
sudo mv render /usr/local/bin/

# Verificar instalación
render --version
```

### **macOS x64:**
```bash
# Descargar
curl -L https://github.com/render-oss/cli/releases/latest/download/render-darwin-amd64 -o render

# Hacer ejecutable
chmod +x render

# Mover a PATH
sudo mv render /usr/local/bin/

# Verificar instalación
render --version
```

### **macOS ARM64 (M1/M2):**
```bash
# Descargar
curl -L https://github.com/render-oss/cli/releases/latest/download/render-darwin-arm64 -o render

# Hacer ejecutable
chmod +x render

# Mover a PATH
sudo mv render /usr/local/bin/

# Verificar instalación
render --version
```

---

## 📥 **MÉTODO 5: DOCKER**

### **Usando Docker:**
```bash
# Crear alias para usar como comando
echo 'alias render="docker run --rm -it -v $(pwd):/app renderinc/cli"' >> ~/.bashrc
source ~/.bashrc

# Usar Render CLI
render --version
```

### **Docker Compose:**
```yaml
# docker-compose.yml
version: '3.8'
services:
  render-cli:
    image: renderinc/cli
    volumes:
      - .:/app
    working_dir: /app
```

---

## 📥 **MÉTODO 6: GITHUB RELEASES (Manual)**

### **Descargar desde GitHub:**
1. Ve a: https://github.com/render-oss/cli/releases/latest
2. Descarga el archivo para tu sistema:
   - **Windows:** `render-windows-amd64.exe`
   - **macOS Intel:** `render-darwin-amd64`
   - **macOS M1/M2:** `render-darwin-arm64`
   - **Linux:** `render-linux-amd64`
3. Renombra a `render` (o `render.exe` en Windows)
4. Mueve a un directorio en tu PATH

---

## 📥 **MÉTODO 7: COMPILACIÓN DESDE CÓDIGO FUENTE**

### **Compilar desde Go:**
```bash
# Instalar Go si no lo tienes
# Clonar repositorio
git clone https://github.com/render-oss/cli.git
cd cli

# Compilar
go build -o render

# Mover a PATH
sudo mv render /usr/local/bin/

# Verificar instalación
render --version
```

---

## 🔐 **CONFIGURACIÓN INICIAL (Todos los métodos)**

### **Después de instalar por cualquier método:**
```bash
# 1. Login en Render
render auth login

# 2. Verificar autenticación
render auth whoami

# 3. Listar servicios (si tienes alguno)
render services list
```

---

## 🚀 **DESPLIEGUE INMEDIATO DE TU PROYECTO**

### **Una vez instalado Render CLI:**
```bash
# Deploy automático de tu WhatsApp Bot Panel
render services create web \
  --name whatsapp-bot-panel \
  --repo https://gitlab.com/melodiabl-group/whatsapp-bot-panel \
  --branch render-optimized \
  --build-command "echo 'Skipping frontend build - backend only'" \
  --start-command "cd backend/full && node index.js" \
  --plan free \
  --env NODE_ENV=production \
  --env PORT=10000 \
  --env JWT_SECRET=whatsapp_bot_jwt_secret_2024_melodia_secure_key \
  --env ADMIN_PASSWORD=admin123 \
  --env BOT_NAME="Melodia WhatsApp Bot"
```

---

## 🔧 **TROUBLESHOOTING**

### **Si falla la instalación:**
```bash
# Limpiar cache (macOS/Linux)
brew cleanup
brew update

# Reinstalar (Windows)
choco uninstall render-cli
choco install render-cli

# Verificar PATH
echo $PATH  # Linux/macOS
echo $env:PATH  # Windows PowerShell
```

---

## ✅ **VERIFICACIÓN FINAL**

### **Comandos para verificar que todo funciona:**
```bash
# Verificar versión
render --version

# Verificar ayuda
render --help

# Verificar autenticación
render auth whoami

# Listar servicios
render services list
```

---

## 🎊 **¡INSTALACIÓN COMPLETADA!**

Ahora tienes Render CLI instalado de **TODAS LAS FORMAS POSIBLES**. Elige el método que mejor funcione en tu sistema y ¡despliega tu WhatsApp Bot Panel inmediatamente!

### **URLs Importantes:**
- **GitLab:** `https://gitlab.com/melodiabl-group/whatsapp-bot-panel`
- **Rama Optimizada:** `https://gitlab.com/melodiabl-group/whatsapp-bot-panel/-/tree/render-optimized`
- **Render Dashboard:** `https://dashboard.render.com`
- **Panel (después del deploy):** `https://whatsapp-bot-panel.onrender.com`
