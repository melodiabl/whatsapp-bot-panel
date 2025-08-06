#!/bin/bash
# 📦 INSTALACIÓN RENDER CLI CON NPM/YARN/PNPM

echo "🚀 Instalando Render CLI con gestores de paquetes Node.js..."

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar Node.js
if ! command_exists node; then
    echo "❌ Node.js no está instalado"
    echo "📥 Instala Node.js desde: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# MÉTODO 1: NPM
if command_exists npm; then
    echo ""
    echo "📦 MÉTODO 1: Instalando con NPM..."
    npm install -g @render/cli
    
    if command_exists render; then
        echo "✅ ¡Render CLI instalado exitosamente con NPM!"
        echo "📋 Versión instalada:"
        render --version
        exit 0
    fi
fi

# MÉTODO 2: YARN
if command_exists yarn; then
    echo ""
    echo "📦 MÉTODO 2: Instalando con Yarn..."
    yarn global add @render/cli
    
    if command_exists render; then
        echo "✅ ¡Render CLI instalado exitosamente con Yarn!"
        echo "📋 Versión instalada:"
        render --version
        exit 0
    fi
fi

# MÉTODO 3: PNPM
if command_exists pnpm; then
    echo ""
    echo "📦 MÉTODO 3: Instalando con PNPM..."
    pnpm add -g @render/cli
    
    if command_exists render; then
        echo "✅ ¡Render CLI instalado exitosamente con PNPM!"
        echo "📋 Versión instalada:"
        render --version
        exit 0
    fi
fi

# Si llegamos aquí, ningún método funcionó
echo "❌ No se pudo instalar Render CLI con ningún gestor de paquetes"
echo "🔧 Intenta con otro método de instalación"
exit 1
