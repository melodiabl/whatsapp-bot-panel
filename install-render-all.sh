#!/bin/bash
# 🚀 INSTALACIÓN RENDER CLI - TODOS LOS MÉTODOS POSIBLES

echo "🎯 INSTALADOR MAESTRO DE RENDER CLI"
echo "====================================="
echo "Intentará instalar Render CLI usando TODOS los métodos disponibles"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para verificar si render está instalado
check_render() {
    if command -v render >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Render CLI está instalado!${NC}"
        echo -e "${BLUE}📋 Versión: $(render --version)${NC}"
        return 0
    else
        return 1
    fi
}

# Función para mostrar próximos pasos
show_next_steps() {
    echo ""
    echo -e "${GREEN}🎉 ¡INSTALACIÓN EXITOSA!${NC}"
    echo ""
    echo -e "${YELLOW}🔐 Próximos pasos:${NC}"
    echo "1. render auth login"
    echo "2. render auth whoami"
    echo "3. render services list"
    echo ""
    echo -e "${YELLOW}🚀 Para desplegar tu WhatsApp Bot Panel:${NC}"
    echo "render services create web \\"
    echo "  --name whatsapp-bot-panel \\"
    echo "  --repo https://gitlab.com/melodiabl-group/whatsapp-bot-panel \\"
    echo "  --branch render-optimized \\"
    echo "  --plan free"
    echo ""
}

# Verificar si ya está instalado
echo -e "${BLUE}🔍 Verificando si Render CLI ya está instalado...${NC}"
if check_render; then
    show_next_steps
    exit 0
fi

echo -e "${YELLOW}⚠️ Render CLI no encontrado. Iniciando instalación...${NC}"
echo ""

# MÉTODO 1: Homebrew
echo -e "${BLUE}📦 MÉTODO 1: Intentando instalación con Homebrew...${NC}"
if command -v brew >/dev/null 2>&1; then
    echo "✅ Homebrew encontrado"
    brew update >/dev/null 2>&1
    brew install render >/dev/null 2>&1
    if check_render; then
        echo -e "${GREEN}🎉 ¡Instalado exitosamente con Homebrew!${NC}"
        show_next_steps
        exit 0
    fi
else
    echo -e "${YELLOW}⚠️ Homebrew no encontrado${NC}"
fi

# MÉTODO 2: NPM
echo ""
echo -e "${BLUE}📦 MÉTODO 2: Intentando instalación con NPM...${NC}"
if command -v npm >/dev/null 2>&1; then
    echo "✅ NPM encontrado"
    npm install -g @render/cli >/dev/null 2>&1
    if check_render; then
        echo -e "${GREEN}🎉 ¡Instalado exitosamente con NPM!${NC}"
        show_next_steps
        exit 0
    fi
else
    echo -e "${YELLOW}⚠️ NPM no encontrado${NC}"
fi

# MÉTODO 3: Yarn
echo ""
echo -e "${BLUE}📦 MÉTODO 3: Intentando instalación con Yarn...${NC}"
if command -v yarn >/dev/null 2>&1; then
    echo "✅ Yarn encontrado"
    yarn global add @render/cli >/dev/null 2>&1
    if check_render; then
        echo -e "${GREEN}🎉 ¡Instalado exitosamente con Yarn!${NC}"
        show_next_steps
        exit 0
    fi
else
    echo -e "${YELLOW}⚠️ Yarn no encontrado${NC}"
fi

# MÉTODO 4: PNPM
echo ""
echo -e "${BLUE}📦 MÉTODO 4: Intentando instalación con PNPM...${NC}"
if command -v pnpm >/dev/null 2>&1; then
    echo "✅ PNPM encontrado"
    pnpm add -g @render/cli >/dev/null 2>&1
    if check_render; then
        echo -e "${GREEN}🎉 ¡Instalado exitosamente con PNPM!${NC}"
        show_next_steps
        exit 0
    fi
else
    echo -e "${YELLOW}⚠️ PNPM no encontrado${NC}"
fi

# MÉTODO 5: Descarga directa
echo ""
echo -e "${BLUE}📦 MÉTODO 5: Intentando descarga directa...${NC}"

# Detectar sistema operativo y arquitectura
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case $ARCH in
    x86_64) ARCH="amd64" ;;
    arm64|aarch64) ARCH="arm64" ;;
    *) echo -e "${RED}❌ Arquitectura no soportada: $ARCH${NC}"; ARCH="" ;;
esac

if [ -n "$ARCH" ]; then
    case $OS in
        linux)
            DOWNLOAD_URL="https://github.com/render-oss/cli/releases/latest/download/render-linux-${ARCH}"
            ;;
        darwin)
            DOWNLOAD_URL="https://github.com/render-oss/cli/releases/latest/download/render-darwin-${ARCH}"
            ;;
        *)
            echo -e "${RED}❌ Sistema operativo no soportado: $OS${NC}"
            DOWNLOAD_URL=""
            ;;
    esac
    
    if [ -n "$DOWNLOAD_URL" ]; then
        echo "🔍 Sistema detectado: $OS $ARCH"
        TEMP_DIR=$(mktemp -d)
        cd "$TEMP_DIR"
        
        if command -v curl >/dev/null 2>&1; then
            curl -L "$DOWNLOAD_URL" -o render >/dev/null 2>&1
        elif command -v wget >/dev/null 2>&1; then
            wget "$DOWNLOAD_URL" -O render >/dev/null 2>&1
        fi
        
        if [ -f "render" ]; then
            chmod +x render
            if ./render --version >/dev/null 2>&1; then
                if [ -w "/usr/local/bin" ]; then
                    mv render /usr/local/bin/
                else
                    sudo mv render /usr/local/bin/ >/dev/null 2>&1
                fi
                
                if check_render; then
                    echo -e "${GREEN}🎉 ¡Instalado exitosamente con descarga directa!${NC}"
                    cd /
                    rm -rf "$TEMP_DIR"
                    show_next_steps
                    exit 0
                fi
            fi
        fi
        
        cd /
        rm -rf "$TEMP_DIR"
    fi
fi

# MÉTODO 6: Docker
echo ""
echo -e "${BLUE}📦 MÉTODO 6: Configurando con Docker...${NC}"
if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    echo "✅ Docker encontrado y corriendo"
    
    # Crear script ejecutable
    SCRIPT_PATH="/usr/local/bin/render"
    SCRIPT_CONTENT='#!/bin/bash
docker run --rm -it -v $(pwd):/app -w /app renderinc/cli "$@"'
    
    if [ -w "/usr/local/bin" ]; then
        echo "$SCRIPT_CONTENT" > "$SCRIPT_PATH"
        chmod +x "$SCRIPT_PATH"
    else
        echo "$SCRIPT_CONTENT" | sudo tee "$SCRIPT_PATH" >/dev/null 2>&1
        sudo chmod +x "$SCRIPT_PATH" >/dev/null 2>&1
    fi
    
    # Descargar imagen
    docker pull renderinc/cli >/dev/null 2>&1
    
    if [ -x "$SCRIPT_PATH" ]; then
        echo -e "${GREEN}🎉 ¡Configurado exitosamente con Docker!${NC}"
        echo -e "${BLUE}📋 Versión: $("$SCRIPT_PATH" --version 2>/dev/null)${NC}"
        show_next_steps
        exit 0
    fi
else
    echo -e "${YELLOW}⚠️ Docker no disponible${NC}"
fi

# Si llegamos aquí, ningún método funcionó
echo ""
echo -e "${RED}❌ NO SE PUDO INSTALAR RENDER CLI${NC}"
echo ""
echo -e "${YELLOW}🔧 Opciones manuales:${NC}"
echo "1. Instala Homebrew: https://brew.sh/"
echo "2. Instala Node.js: https://nodejs.org/"
echo "3. Instala Docker: https://docs.docker.com/get-docker/"
echo "4. Descarga manual: https://github.com/render-oss/cli/releases"
echo ""
echo -e "${BLUE}📚 Consulta la documentación completa en:${NC}"
echo "RENDER_CLI_INSTALACION_COMPLETA.md"
echo ""
exit 1
