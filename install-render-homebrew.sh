#!/bin/bash
# 🍺 INSTALACIÓN RENDER CLI CON HOMEBREW

echo "🚀 Instalando Render CLI con Homebrew..."

# Verificar si Homebrew está instalado
if ! command -v brew &> /dev/null; then
    echo "📦 Homebrew no encontrado. Instalando Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Agregar al PATH en Linux
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> ~/.bashrc
        source ~/.bashrc
    fi
fi

# Actualizar Homebrew
echo "🔄 Actualizando Homebrew..."
brew update

# Instalar Render CLI
echo "⬇️ Instalando Render CLI..."
brew install render

# Verificar instalación
echo "✅ Verificando instalación..."
if command -v render &> /dev/null; then
    echo "🎉 ¡Render CLI instalado exitosamente!"
    echo "📋 Versión instalada:"
    render --version
    
    echo ""
    echo "🔐 Próximos pasos:"
    echo "1. render auth login"
    echo "2. render auth whoami"
    echo "3. render services list"
else
    echo "❌ Error en la instalación"
    exit 1
fi
