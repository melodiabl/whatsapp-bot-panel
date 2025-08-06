#!/bin/bash
# 📥 INSTALACIÓN DIRECTA RENDER CLI (Descarga desde GitHub)

echo "🚀 Instalando Render CLI con descarga directa..."

# Detectar sistema operativo y arquitectura
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

# Mapear arquitecturas
case $ARCH in
    x86_64)
        ARCH="amd64"
        ;;
    arm64|aarch64)
        ARCH="arm64"
        ;;
    *)
        echo "❌ Arquitectura no soportada: $ARCH"
        exit 1
        ;;
esac

# Determinar URL de descarga
case $OS in
    linux)
        DOWNLOAD_URL="https://github.com/render-oss/cli/releases/latest/download/render-linux-${ARCH}"
        ;;
    darwin)
        DOWNLOAD_URL="https://github.com/render-oss/cli/releases/latest/download/render-darwin-${ARCH}"
        ;;
    *)
        echo "❌ Sistema operativo no soportado: $OS"
        echo "🪟 Para Windows, usa: install-render-windows.bat"
        exit 1
        ;;
esac

echo "🔍 Sistema detectado: $OS $ARCH"
echo "📥 Descargando desde: $DOWNLOAD_URL"

# Crear directorio temporal
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

# Descargar Render CLI
echo "⬇️ Descargando Render CLI..."
if command -v curl >/dev/null 2>&1; then
    curl -L "$DOWNLOAD_URL" -o render
elif command -v wget >/dev/null 2>&1; then
    wget "$DOWNLOAD_URL" -O render
else
    echo "❌ curl o wget no están disponibles"
    exit 1
fi

# Verificar descarga
if [ ! -f "render" ]; then
    echo "❌ Error en la descarga"
    exit 1
fi

# Hacer ejecutable
chmod +x render

# Verificar que funciona
if ! ./render --version >/dev/null 2>&1; then
    echo "❌ El binario descargado no funciona"
    exit 1
fi

# Instalar en el sistema
echo "📦 Instalando en /usr/local/bin..."
if [ -w "/usr/local/bin" ]; then
    mv render /usr/local/bin/
else
    echo "🔐 Requiere permisos de administrador..."
    sudo mv render /usr/local/bin/
fi

# Verificar instalación
if command -v render >/dev/null 2>&1; then
    echo "✅ ¡Render CLI instalado exitosamente!"
    echo "📋 Versión instalada:"
    render --version
    
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
else
    echo "❌ Error en la instalación"
    echo "🔧 Verifica que /usr/local/bin esté en tu PATH"
    exit 1
fi

# Limpiar archivos temporales
cd /
rm -rf "$TEMP_DIR"

echo "🎉 ¡Instalación completada!"
