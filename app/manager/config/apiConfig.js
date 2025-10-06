// config/apiConfig.js - Configuración de la API
export const API_CONFIG = {
	// Determinar si usar API real o simulada
	USE_REAL_API: process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_REAL_API === 'true',
	
	// URLs de la API
	BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
	API_PREFIX: process.env.NEXT_PUBLIC_API_PREFIX || '/api',
	
	// Configuración de autenticación
	JWT_STORAGE_KEY: 'auth_token',
	USER_STORAGE_KEY: 'user_data',
	
	// Configuración de requests
	DEFAULT_TIMEOUT: 10000,
	RETRY_ATTEMPTS: 3,
	
	// Configuración de logging
	ENABLE_LOGGING: process.env.NODE_ENV === 'development',
	
	// Configuración de simulación
	SIMULATION_DELAY: 800,
	
	// Mensajes de debug
	DEBUG_MESSAGES: {
		USING_REAL_API: '🔧 API Service: Using REAL API service',
		USING_MOCK_API: '🔧 API Service: Using MOCK API service',
		SWITCHED_TO_REAL: '🔧 Switched to REAL API service',
		SWITCHED_TO_MOCK: '🔧 Switched to MOCK API service',
	}
};

// Función para obtener información del entorno
export function getEnvironmentInfo() {
	return {
		isDevelopment: process.env.NODE_ENV === 'development',
		isProduction: process.env.NODE_ENV === 'production',
		useRealApi: API_CONFIG.USE_REAL_API,
		baseUrl: API_CONFIG.BASE_URL,
		apiPrefix: API_CONFIG.API_PREFIX,
	};
}

// Función para logging condicional
export function apiLog(message, ...args) {
	if (API_CONFIG.ENABLE_LOGGING) {
		console.log(`[API Service] ${message}`, ...args);
	}
}

// Función para warning condicional
export function apiWarn(message, ...args) {
	if (API_CONFIG.ENABLE_LOGGING) {
		console.warn(`[API Service] ${message}`, ...args);
	}
}

// Función para error condicional
export function apiError(message, ...args) {
	if (API_CONFIG.ENABLE_LOGGING) {
		console.error(`[API Service] ${message}`, ...args);
	}
}

export default API_CONFIG;