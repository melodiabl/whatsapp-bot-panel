import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuración de Gemini AI
const GEMINI_API_KEY = 'AIzaSyAOBzrh8dnm_rMAUyy3yzBMpVIME-JFay4';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Sistema de IA para detección inteligente de contenido de manhwa
 */

/**
 * Analizar texto con Gemini AI para extraer información de manhwa
 */
async function analyzeContentWithAI(messageText, filename = '') {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
Analiza el siguiente texto y nombre de archivo para extraer información sobre contenido de manhwa/webtoon:

TEXTO DEL MENSAJE: "${messageText}"
NOMBRE DE ARCHIVO: "${filename}"

Por favor, extrae y devuelve SOLO un objeto JSON con esta estructura exacta:
{
  "titulo": "título del manhwa detectado o 'Desconocido' si no se puede determinar",
  "tipo": "capítulo|extra|ilustración|pack|desconocido",
  "capitulo": "número de capítulo si aplica o null",
  "confianza": 0.0-1.0
}

REGLAS:
- Si detectas un título de manhwa conocido (como Jinx, Painter of the Night, BJ Alex, etc.), úsalo
- Para "tipo": usa "capítulo" si hay números de capítulo, "extra" para contenido adicional, "ilustración" para imágenes/fanart, "pack" para colecciones
- "confianza" debe ser alta (>0.8) solo si estás muy seguro del título
- Responde SOLO con el JSON, sin texto adicional
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Intentar parsear la respuesta JSON
    try {
      const cleanText = text.replace(/```json|```/g, '').trim();
      const aiResult = JSON.parse(cleanText);
      
      // Validar estructura
      if (aiResult.titulo && aiResult.tipo && typeof aiResult.confianza === 'number') {
        return {
          success: true,
          data: {
            titulo: aiResult.titulo,
            tipo: aiResult.tipo,
            capitulo: aiResult.capitulo || null,
            confianza: aiResult.confianza,
            fuente: 'gemini-ai'
          }
        };
      }
    } catch (parseError) {
      console.error('Error parseando respuesta de Gemini:', parseError);
    }

    return {
      success: false,
      error: 'Respuesta de IA no válida',
      rawResponse: text
    };

  } catch (error) {
    console.error('Error con Gemini AI:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Mejorar detección de títulos usando IA como respaldo
 */
async function enhancedTitleDetection(messageText, filename = '') {
  // Primero intentar detección tradicional (más rápida)
  const traditionalResult = detectManhwaTitleTraditional(messageText, filename);
  
  // Si la detección tradicional no es confiable, usar IA
  if (traditionalResult === 'Desconocido' || shouldUseAI(messageText, filename)) {
    const aiResult = await analyzeContentWithAI(messageText, filename);
    
    if (aiResult.success && aiResult.data.confianza > 0.6) {
      return {
        titulo: aiResult.data.titulo,
        tipo: aiResult.data.tipo,
        capitulo: aiResult.data.capitulo,
        metodo: 'ai',
        confianza: aiResult.data.confianza
      };
    }
  }

  // Fallback a detección tradicional
  return {
    titulo: traditionalResult,
    tipo: detectContentTypeTraditional(messageText, filename),
    capitulo: extractChapterNumber(messageText, filename),
    metodo: 'tradicional',
    confianza: traditionalResult !== 'Desconocido' ? 0.7 : 0.3
  };
}

/**
 * Detección tradicional de títulos (método original)
 */
function detectManhwaTitleTraditional(messageText, filename = '') {
  const knownTitles = [
    'jinx', 'painter of the night', 'killing stalking', 'bj alex',
    'cherry blossoms after winter', 'love is an illusion', 'warehouse',
    'sign', 'pearl boy', 'banana scandal', 'semantic error', 'viewfinder',
    'under the green light', 'define the relationship', 'love shuttle',
    'at the end of the road', 'walk on water', 'royal servant',
    'blood bank', 'ten count', 'given', 'doukyuusei', 'hitorijime my hero',
    'solo leveling', 'tower of god', 'the god of high school', 'noblesse',
    'lookism', 'sweet home', 'bastard', 'pigpen', 'tales of demons and gods'
  ];

  const text = (messageText + ' ' + filename).toLowerCase();
  
  for (const title of knownTitles) {
    if (text.includes(title.toLowerCase())) {
      return title.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
  }

  // Patrones de extracción
  const patterns = [
    /(?:manhwa|manga|webtoon)[\s\-_]*([a-zA-Z\s]+?)[\s\-_]*(?:cap|chapter|ch|episodio|ep)/i,
    /([a-zA-Z\s]+?)[\s\-_]*(?:cap|chapter|ch|episodio|ep)[\s\-_]*\d+/i,
    /([a-zA-Z\s]{3,30})[\s\-_]*(?:extra|special|bonus)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim().split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
  }

  return 'Desconocido';
}

/**
 * Detección tradicional de tipo de contenido
 */
function detectContentTypeTraditional(messageText, filename = '') {
  const text = (messageText + ' ' + filename).toLowerCase();
  
  if (text.match(/(?:cap|chapter|ch|episodio|ep)[\s\-_]*\d+/i)) {
    return 'capítulo';
  }
  
  if (text.match(/(?:extra|special|bonus|omake|side)/i)) {
    return 'extra';
  }
  
  if (text.match(/(?:ilustr|art|fanart|cover|portada)/i)) {
    return 'ilustración';
  }
  
  if (text.match(/(?:pack|bundle|collection|vol|volume)/i)) {
    return 'pack';
  }

  return 'desconocido';
}

/**
 * Extraer número de capítulo
 */
function extractChapterNumber(messageText, filename = '') {
  const text = (messageText + ' ' + filename).toLowerCase();
  const chapterMatch = text.match(/(?:cap|chapter|ch|episodio|ep)[\s\-_]*(\d+)/i);
  return chapterMatch ? parseInt(chapterMatch[1]) : null;
}

/**
 * Determinar si se debe usar IA
 */
function shouldUseAI(messageText, filename = '') {
  const text = (messageText + ' ' + filename).toLowerCase();
  
  // Usar IA si:
  // - El texto es complejo o tiene caracteres especiales
  // - Contiene palabras clave de manhwa pero no títulos conocidos
  // - El nombre del archivo es críptico
  
  const complexityIndicators = [
    /[^\x00-\x7F]/, // Caracteres no ASCII
    /(?:manhwa|webtoon|yaoi|bl|shounen|seinen)/i, // Palabras clave de género
    /(?:raw|scan|translation)/i, // Términos de scanlation
    filename.length > 20 && !/\.(pdf|jpg|png|jpeg)$/i.test(filename) // Nombres complejos
  ];

  return complexityIndicators.some(indicator => indicator.test(text));
}

/**
 * Generar descripción mejorada con IA
 */
async function generateEnhancedDescription(titulo, tipo, capitulo, proveedor) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
Genera una descripción concisa y profesional para un aporte de manhwa con esta información:

TÍTULO: ${titulo}
TIPO: ${tipo}
CAPÍTULO: ${capitulo || 'N/A'}
PROVEEDOR: ${proveedor}

Genera una descripción de máximo 100 caracteres que sea clara y útil para catalogar el contenido.
Responde SOLO con la descripción, sin texto adicional.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const description = response.text().trim();

    return description.length <= 100 ? description : `${titulo} - ${tipo}${capitulo ? ` ${capitulo}` : ''}`;

  } catch (error) {
    console.error('Error generando descripción con IA:', error);
    return `${titulo} - ${tipo}${capitulo ? ` ${capitulo}` : ''}`;
  }
}

/**
 * Análisis completo con IA para un mensaje de proveedor
 */
async function analyzeProviderMessage(messageText, filename, groupName) {
  try {
    console.log(`🤖 Analizando mensaje con IA: "${messageText}" | Archivo: "${filename}"`);

    // Usar detección mejorada
    const analysis = await enhancedTitleDetection(messageText, filename);
    
    // Generar descripción mejorada
    const description = await generateEnhancedDescription(
      analysis.titulo, 
      analysis.tipo, 
      analysis.capitulo, 
      groupName
    );

    const result = {
      titulo: analysis.titulo,
      tipo: analysis.tipo,
      capitulo: analysis.capitulo,
      descripcion: description,
      confianza: analysis.confianza,
      metodo: analysis.metodo,
      timestamp: new Date().toISOString()
    };

    console.log(`✅ Análisis IA completado:`, result);
    return result;

  } catch (error) {
    console.error('❌ Error en análisis con IA:', error);
    
    // Fallback a método tradicional
    return {
      titulo: detectManhwaTitleTraditional(messageText, filename),
      tipo: detectContentTypeTraditional(messageText, filename),
      capitulo: extractChapterNumber(messageText, filename),
      descripcion: `${detectManhwaTitleTraditional(messageText, filename)} - ${detectContentTypeTraditional(messageText, filename)}`,
      confianza: 0.5,
      metodo: 'fallback',
      error: error.message
    };
  }
}

export {
  analyzeContentWithAI,
  enhancedTitleDetection,
  analyzeProviderMessage,
  generateEnhancedDescription
};
