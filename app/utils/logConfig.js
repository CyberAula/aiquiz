/**
 * Configuración centralizada del sistema de logging
 * 
 * Para cambiar el nivel de logging, modifica LOG_LEVEL en .env:
 * 
 * LOG_LEVEL=ERROR   # Solo errores críticos
 * LOG_LEVEL=WARN    # Errores y advertencias
 * LOG_LEVEL=INFO    # Información general (por defecto)
 * LOG_LEVEL=DEBUG   # Información detallada para desarrollo
 * LOG_LEVEL=TRACE   # Todo incluido, muy detallado
 * 
 * Otras opciones en .env:
 * SHOW_TIMESTAMPS=true/false
 * COLORED_OUTPUT=true/false
 */

export const LOG_CONFIG = {
    // Niveles de log por componente
    components: {
        'Questions': process.env.QUESTIONS_LOG_LEVEL || process.env.LOG_LEVEL,
        'RAG': process.env.RAG_LOG_LEVEL || process.env.LOG_LEVEL,
        'LLM': process.env.LLM_LOG_LEVEL || process.env.LOG_LEVEL,
        'Files': process.env.FILES_LOG_LEVEL || process.env.LOG_LEVEL,
        'Manager': process.env.MANAGER_LOG_LEVEL || process.env.LOG_LEVEL,
    },
    
    // Configuración de formato
    formatting: {
        showTimestamps: process.env.SHOW_TIMESTAMPS !== 'false',
        coloredOutput: process.env.COLORED_OUTPUT !== 'false',
        includeStackTrace: process.env.INCLUDE_STACK_TRACE === 'true'
    }
};