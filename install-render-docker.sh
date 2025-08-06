#!/bin/bash
# 🐳 INSTALACIÓN RENDER CLI CON DOCKER

echo "🚀 Configurando Render CLI con Docker..."

# Verificar si Docker está instalado
if ! command -v docker >/dev/null 2>&1; then
    echo "❌ Docker no está instalado"
    echo "📥 Instala Docker desde: https://docs.docker.com/get-docker/"
    exit 1
fi

echo "✅ Docker encontrado: $(docker --version)"

# Verificar que Docker esté corriendo
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker no está corriendo"
    echo "🔧 Inicia Docker y vuelve a ejecutar este script"
    exit 1
fi

echo "✅ Docker está corriendo"

# MÉTODO 1: Crear alias para usar como comando
echo ""
echo "📦 MÉTODO 1: Configurando alias para Render CLI..."

# Determinar shell y archivo de configuración
if [ -n "$ZSH_VERSION" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
elif [ -n "$BASH_VERSION" ]; then
    SHELL_CONFIG="$HOME/.bashrc"
else
    SHELL_CONFIG="$HOME/.profile"
fi

# Crear alias
ALIAS_COMMAND='alias render="docker run --rm -it -v \$(pwd):/app -w /app renderinc/cli"'

# Verificar si el alias ya existe
if grep -q "alias render=" "$SHELL_CONFIG" 2>/dev/null; then
    echo "⚠️ Alias ya existe en $SHELL_CONFIG"
else
    echo "📝 Agregando alias a $SHELL_CONFIG..."
    echo "" >> "$SHELL_CONFIG"
    echo "# Render CLI con Docker" >> "$SHELL_CONFIG"
    echo "$ALIAS_COMMAND" >> "$SHELL_CONFIG"
    echo "✅ Alias agregado"
fi

# MÉTODO 2: Crear script ejecutable
echo ""
echo "📦 MÉTODO 2: Creando script ejecutable..."

SCRIPT_PATH="/usr/local/bin/render"
SCRIPT_CONTENT='#!/bin/bash
docker run --rm -it -v $(pwd):/app -w /app renderinc/cli "$@"'

# Crear script
if [ -w "/usr/local/bin" ]; then
    echo "$SCRIPT_CONTENT" > "$SCRIPT_PATH"
    chmod +x "$SCRIPT_PATH"
    echo "✅ Script creado en $SCRIPT_PATH"
else
    echo "🔐 Requiere permisos de administrador para crear script..."
    echo "$SCRIPT_CONTENT" | sudo tee "$SCRIPT_PATH" >/dev/null
    sudo chmod +x "$SCRIPT_PATH"
    echo "✅ Script creado en $SCRIPT_PATH"
fi

# MÉTODO 3: Crear docker-compose.yml
echo ""
echo "📦 MÉTODO 3: Creando docker-compose.yml..."

COMPOSE_CONTENT='version: "3.8"
services:
  render-cli:
    image: renderinc/cli
    volumes:
      - .:/app
    working_dir: /app
    stdin_open: true
    tty: true'

echo "$COMPOSE_CONTENT" > docker-compose.render.yml
echo "✅ docker-compose.render.yml creado"

# Descargar imagen de Docker
echo ""
echo "⬇️ Descargando imagen de Render CLI..."
docker pull renderinc/cli

# Verificar instalación
echo ""
echo "🔍 Verificando instalación..."

# Probar con script
if [ -x "$SCRIPT_PATH" ]; then
    echo "✅ Script ejecutable disponible"
    echo "📋 Versión:"
    "$SCRIPT_PATH" --version
fi

# Instrucciones finales
echo ""
echo "🎉 ¡Render CLI configurado con Docker!"
echo ""
echo "📋 Formas de usar Render CLI:"
echo ""
echo "1️⃣ Con alias (requiere reiniciar terminal):"
echo "   source $SHELL_CONFIG"
echo "   render --version"
echo ""
echo "2️⃣ Con script ejecutable:"
echo "   render --version"
echo ""
echo "3️⃣ Con Docker directamente:"
echo "   docker run --rm -it -v \$(pwd):/app -w /app renderinc/cli --version"
echo ""
echo "4️⃣ Con Docker Compose:"
echo "   docker-compose -f docker-compose.render.yml run render-cli --version"
echo ""
echo "🔐 Próximos pasos:"
echo "1. render auth login"
echo "2. render auth whoami"
echo "3. render services list"
echo ""
echo "🚀 Para desplegar tu WhatsApp Bot Panel:"
echo "render services create web \\"
echo "  --name whatsapp-bot-panel \\"
echo "  --repo https://gitlab.com/melodiabl-group/whatsapp-bot-panel \\"
echo "  --branch render-optimized \\"
echo "  --plan free"
