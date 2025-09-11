// realApiService.js - Servicio real para la API del manager
"use client";

/**
 * Clase RealApiService para gestionar llamadas reales a la API del manager
 * Este servicio reemplaza las simulaciones y conecta con los endpoints reales
 */
class RealApiService {
	constructor() {
		this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
		this.token = null;
		this.user = null;
		this.enableLogging = true;
		
		// Cargar token desde localStorage si existe
		if (typeof window !== 'undefined') {
			this.token = localStorage.getItem('jwt_token') || localStorage.getItem('auth_token');
			const userData = localStorage.getItem('user_data');
			if (userData) {
				try {
					this.user = JSON.parse(userData);
				} catch (e) {
					console.error('Error parsing user data:', e);
				}
			}
		}
	}

	/**
	 * Configura el token de autenticación
	 * @param {string} token - Token JWT
	 * @param {Object} user - Datos del usuario
	 */
	setAuth(token, user) {
		this.token = token;
		this.user = user;
		
		if (typeof window !== 'undefined') {
			localStorage.setItem('jwt_token', token);
			localStorage.setItem('user_data', JSON.stringify(user));
		}
	}

	/**
	 * Limpia la autenticación
	 */
	clearAuth() {
		this.token = null;
		this.user = null;
		
		if (typeof window !== 'undefined') {
			localStorage.removeItem('jwt_token');
			localStorage.removeItem('auth_token'); // Limpiar ambos por compatibilidad
			localStorage.removeItem('user_data');
		}
	}

	/**
	 * Obtiene los headers para las peticiones
	 * @returns {Object} Headers
	 */
	getHeaders() {
		const headers = {
			'Content-Type': 'application/json',
		};
		
		if (this.token) {
			headers['Authorization'] = `Bearer ${this.token}`;
		}
		
		return headers;
	}

	/**
	 * Realiza una petición HTTP
	 * @param {string} endpoint - Endpoint de la API
	 * @param {Object} options - Opciones de la petición
	 * @returns {Promise<Object>} Respuesta de la API
	 */
	async makeRequest(endpoint, options = {}) {
		const url = `${this.baseUrl}${endpoint}`;
		
		// Determinar si estamos enviando FormData
		const isFormData = options.body instanceof FormData;
		
		const config = {
			method: options.method || 'GET',
			headers: isFormData ? (options.headers || {}) : this.getHeaders(),
			...options,
		};

		// Merge headers si es FormData (para auth, pero sin Content-Type)
		if (isFormData && this.token) {
			config.headers['Authorization'] = `Bearer ${this.token}`;
		}

		// Solo convertir a JSON si no es FormData
		if (config.body && typeof config.body === 'object' && !isFormData) {
			config.body = JSON.stringify(config.body);
		}

		if (this.enableLogging) {
			console.log(`🔄 API Request: ${config.method} ${url}`);
			if (isFormData) {
				console.log('📦 Sending FormData with entries:');
				for (let [key, value] of options.body.entries()) {
					console.log(`   ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
				}
				console.log('📋 Headers:', config.headers);
			} else {
				console.log('📤 Request body:', config.body);
				console.log('📋 Headers:', config.headers);
			}
		}

		try {
			const response = await fetch(url, config);
			const data = await response.json();

			if (this.enableLogging) {
				console.log(`📥 API Response: ${response.status}`, data);
			}

			if (!response.ok) {
				throw new Error(data.message || `HTTP error! status: ${response.status}`);
			}

			return data;
		} catch (error) {
			if (this.enableLogging) {
				console.error('❌ API Error:', error);
			}
			throw error;
		}
	}

	// ==========================================
	// ========== MÉTODOS DE AUTENTICACIÓN =====
	// ==========================================

	/**
	 * Inicia sesión
	 * @param {string} email - Email del usuario
	 * @param {string} password - Contraseña
	 * @returns {Promise<Object>} Respuesta del login
	 */
	async login(email, password) {
		const response = await this.makeRequest('/api/manager/auth/login', {
			method: 'POST',
			body: { email, password },
		});

		if (response.success && response.token) {
			this.setAuth(response.token, response.user);
		}

		return response;
	}

	/**
	 * Recupera la contraseña
	 * @param {string} email - Email del usuario
	 * @returns {Promise<Object>} Respuesta de recuperación
	 */
	async recoverPassword(email) {
		return await this.makeRequest('/api/manager/auth/recovery', {
			method: 'POST',
			body: { email },
		});
	}

	/**
	 * Restablece la contraseña
	 * @param {string} token - Token de recuperación
	 * @param {string} newPassword - Nueva contraseña
	 * @returns {Promise<Object>} Respuesta de restablecimiento
	 */
	async resetPassword(token, newPassword) {
		return await this.makeRequest('/api/manager/auth/reset-password', {
			method: 'POST',
			body: { token, newPassword },
		});
	}

	/**
	 * Obtiene el perfil del usuario actual
	 * @returns {Promise<Object>} Datos del perfil del usuario
	 */
	async getUserProfile() {
		return await this.makeRequest('/api/manager/auth/me', {
			method: 'GET',
		});
	}

	/**
	 * Actualiza el perfil del usuario actual
	 * @param {Object} data - Datos a actualizar
	 * @returns {Promise<Object>} Usuario actualizado
	 */
	async updateUserProfile(data) {
		return await this.makeRequest('/api/manager/auth/me', {
			method: 'PUT',
			body: data,
		});
	}

	/**
	 * Cambia la contraseña del usuario actual
	 * @param {Object} data - Datos de cambio de contraseña
	 * @returns {Promise<Object>} Respuesta del cambio de contraseña
	 */
	async changePassword(data) {
		return await this.makeRequest('/api/account/password', {
			method: 'PUT',
			body: data,
		});
	}

	// ==========================================
	// ========== MÉTODOS DE ASIGNATURAS =======
	// ==========================================

	/**
	 * Obtiene todas las asignaturas
	 * @returns {Promise<Array>} Lista de asignaturas
	 */
	async getSubjects() {
		return await this.makeRequest('/api/manager/subjects');
	}

	/**
	 * Obtiene una asignatura por ID
	 * @param {string} id - ID de la asignatura
	 * @returns {Promise<Object>} Datos de la asignatura
	 */
	async getSubject(id) {
		return await this.makeRequest(`/api/manager/subjects/${id}`);
	}

	/**
	 * Crea una nueva asignatura
	 * @param {Object} data - Datos de la asignatura
	 * @returns {Promise<Object>} Asignatura creada
	 */
	async createSubject(data) {
		return await this.makeRequest('/api/manager/subjects', {
			method: 'POST',
			body: data,
		});
	}

	/**
	 * Actualiza una asignatura
	 * @param {string} id - ID de la asignatura
	 * @param {Object} data - Datos a actualizar
	 * @returns {Promise<Object>} Asignatura actualizada
	 */
	async updateSubject(id, data) {
		return await this.makeRequest(`/api/manager/subjects/${id}`, {
			method: 'PUT',
			body: data,
		});
	}

	/**
	 * Elimina una asignatura
	 * @param {string} id - ID de la asignatura
	 * @returns {Promise<Object>} Respuesta de eliminación
	 */
	async deleteSubject(id) {
		return await this.makeRequest(`/api/manager/subjects/${id}`, {
			method: 'DELETE',
		});
	}

	/**
	 * Añade un profesor a una asignatura
	 * @param {string} subjectId - ID de la asignatura
	 * @param {Object} professorData - Datos del profesor
	 * @returns {Promise<Object>} Respuesta de adición
	 */
	async addProfessorToSubject(subjectId, professorData) {
		return await this.makeRequest(`/api/manager/subjects/${subjectId}/professors`, {
			method: 'POST',
			body: professorData,
		});
	}

	/**
	 * Elimina un profesor de una asignatura
	 * @param {string} subjectId - ID de la asignatura
	 * @param {string} professorId - ID del profesor
	 * @returns {Promise<Object>} Respuesta de eliminación
	 */
	async removeProfessorFromSubject(subjectId, professorId) {
		return await this.makeRequest(`/api/manager/subjects/${subjectId}/professors/${professorId}`, {
			method: 'DELETE',
		});
	}

	// ==========================================
	// ============= MÉTODOS DE TEMAS ==========
	// ==========================================

	/**
	 * Obtiene todos los temas de una asignatura
	 * @param {string} subjectId - ID de la asignatura
	 * @returns {Promise<Object>} Lista de temas
	 */
	async getTopics(subjectId) {
		return await this.makeRequest(`/api/manager/subjects/${subjectId}/topics`);
	}

	/**
	 * Obtiene un tema por ID
	 * @param {string} subjectId - ID de la asignatura
	 * @param {string} topicId - ID del tema
	 * @returns {Promise<Object>} Datos del tema
	 */
	async getTopic(subjectId, topicId) {
		return await this.makeRequest(`/api/manager/subjects/${subjectId}/topics/${topicId}`);
	}

	/**
	 * Crea un nuevo tema
	 * @param {string} subjectId - ID de la asignatura
	 * @param {Object} data - Datos del tema
	 * @returns {Promise<Object>} Tema creado
	 */
	async createTopic(subjectId, data) {
		return await this.makeRequest(`/api/manager/subjects/${subjectId}/topics`, {
			method: 'POST',
			body: data,
		});
	}

	/**
	 * Actualiza un tema
	 * @param {string} subjectId - ID de la asignatura
	 * @param {string} topicId - ID del tema
	 * @param {Object} data - Datos a actualizar
	 * @returns {Promise<Object>} Tema actualizado
	 */
	async updateTopic(subjectId, topicId, data) {
		return await this.makeRequest(`/api/manager/subjects/${subjectId}/topics/${topicId}`, {
			method: 'PUT',
			body: data,
		});
	}

	/**
	 * Elimina un tema
	 * @param {string} subjectId - ID de la asignatura
	 * @param {string} topicId - ID del tema
	 * @returns {Promise<Object>} Respuesta de eliminación
	 */
	async deleteTopic(subjectId, topicId) {
		return await this.makeRequest(`/api/manager/subjects/${subjectId}/topics/${topicId}`, {
			method: 'DELETE',
		});
	}

	// ==========================================
	// ========== MÉTODOS DE SUBTEMAS ==========
	// ==========================================

	/**
	 * Obtiene todos los subtemas de un tema
	 * @param {string} subjectId - ID de la asignatura
	 * @param {string} topicId - ID del tema
	 * @returns {Promise<Object>} Lista de subtemas
	 */
	async getSubtopics(subjectId, topicId) {
		return await this.makeRequest(`/api/manager/subjects/${subjectId}/topics/${topicId}/subtopics`);
	}

	/**
	 * Obtiene un subtema por ID
	 * @param {string} subjectId - ID de la asignatura
	 * @param {string} topicId - ID del tema
	 * @param {string} subtopicId - ID del subtema
	 * @returns {Promise<Object>} Datos del subtema
	 */
	async getSubtopic(subjectId, topicId, subtopicId) {
		return await this.makeRequest(`/api/manager/subjects/${subjectId}/topics/${topicId}/subtopics/${subtopicId}`);
	}

	/**
	 * Crea un nuevo subtema
	 * @param {string} subjectId - ID de la asignatura
	 * @param {string} topicId - ID del tema
	 * @param {Object} data - Datos del subtema
	 * @returns {Promise<Object>} Subtema creado
	 */
	async createSubtopic(subjectId, topicId, data) {
		return await this.makeRequest(`/api/manager/subjects/${subjectId}/topics/${topicId}/subtopics`, {
			method: 'POST',
			body: data,
		});
	}

	/**
	 * Actualiza un subtema
	 * @param {string} subjectId - ID de la asignatura
	 * @param {string} topicId - ID del tema
	 * @param {string} subtopicId - ID del subtema
	 * @param {Object} data - Datos a actualizar
	 * @returns {Promise<Object>} Subtema actualizado
	 */
	async updateSubtopic(subjectId, topicId, subtopicId, data) {
		return await this.makeRequest(`/api/manager/subjects/${subjectId}/topics/${topicId}/subtopics/${subtopicId}`, {
			method: 'PUT',
			body: data,
		});
	}

	/**
	 * Elimina un subtema
	 * @param {string} subjectId - ID de la asignatura
	 * @param {string} topicId - ID del tema
	 * @param {string} subtopicId - ID del subtema
	 * @returns {Promise<Object>} Respuesta de eliminación
	 */
	async deleteSubtopic(subjectId, topicId, subtopicId) {
		return await this.makeRequest(`/api/manager/subjects/${subjectId}/topics/${topicId}/subtopics/${subtopicId}`, {
			method: 'DELETE',
		});
	}

	// ==========================================
	// ========= MÉTODOS DE ARCHIVOS/VIDEOS ====
	// ==========================================

	/**
	 * Sube un archivo a un subtema (PENDIENTE DE IMPLEMENTACIÓN)
	 * @param {string} subjectId - ID de la asignatura
	 * @param {string} topicId - ID del tema
	 * @param {string} subtopicId - ID del subtema
	 * @param {FormData} fileData - Datos del archivo
	 * @returns {Promise<Object>} Respuesta de subida
	 */
	async uploadFile(subjectId, topicId, subtopicId, fileData) {
		return await this.makeRequest(
			`/api/manager/subjects/${subjectId}/topics/${topicId}/subtopics/${subtopicId}/files`,
			{
				method: 'POST',
				body: fileData,
			}
		);
	}

	/**
	 * Obtiene los archivos de un subtema
	 * @param {string} subjectId - ID de la asignatura
	 * @param {string} topicId - ID del tema
	 * @param {string} subtopicId - ID del subtema
	 * @returns {Promise<Object>} Lista de archivos
	 */
	async getSubtopicFiles(subjectId, topicId, subtopicId) {
		return await this.makeRequest(
			`/api/manager/subjects/${subjectId}/topics/${topicId}/subtopics/${subtopicId}/files`,
			{
				method: 'GET',
			}
		);
	}

	/**
	 * Elimina un archivo de un subtema
	 * @param {string} subjectId - ID de la asignatura
	 * @param {string} topicId - ID del tema
	 * @param {string} subtopicId - ID del subtema
	 * @param {string} fileId - ID del archivo a eliminar
	 * @returns {Promise<Object>} Resultado de la eliminación
	 */
	async deleteSubtopicFile(subjectId, topicId, subtopicId, fileId) {
		return await this.makeRequest(
			`/api/manager/subjects/${subjectId}/topics/${topicId}/subtopics/${subtopicId}/files/${fileId}`,
			{
				method: 'DELETE',
			}
		);
	}

	/**
	 * Añade una URL de video a un subtema (PENDIENTE DE IMPLEMENTACIÓN)
	 * @param {string} subjectId - ID de la asignatura
	 * @param {string} topicId - ID del tema
	 * @param {string} subtopicId - ID del subtema
	 * @param {Object} videoData - Datos del video
	 * @returns {Promise<Object>} Respuesta de adición
	 */
	async addVideoUrl(subjectId, topicId, subtopicId, videoData) {
		return await this.makeRequest(
			`/api/manager/subjects/${subjectId}/topics/${topicId}/subtopics/${subtopicId}/videos`,
			{
				method: 'POST',
				body: videoData,
			}
		);
	}

	// ==========================================
	// ========== MÉTODOS DE UTILIDAD ==========
	// ==========================================

	/**
	 * Verifica si el usuario está autenticado
	 * @returns {boolean} True si está autenticado
	 */
	isAuthenticated() {
		return !!this.token;
	}

	/**
	 * Obtiene los datos del usuario actual
	 * @returns {Object|null} Datos del usuario o null
	 */
	getCurrentUser() {
		return this.user;
	}

	/**
	 * Activa o desactiva el logging
	 * @param {boolean} enable - True para activar, false para desactivar
	 */
	setLogging(enable) {
		this.enableLogging = enable;
	}
}

// Exportar una única instancia para toda la aplicación
const realApiService = new RealApiService();

export default realApiService;