// services/index.js - API Service (Real API only)
import realApiService from './realApiService';
import { API_CONFIG, apiLog } from '../config/apiConfig';

// Wrapper simplificado que usa solo la API real
class ApiServiceWrapper {
	constructor() {
		this.service = realApiService;
		this.isRealApi = true;
		
		apiLog(API_CONFIG.DEBUG_MESSAGES.USING_REAL_API);
	}

	// Métodos de autenticación
	async login(email, password) {
		return await this.service.login(email, password);
	}

	async recoverPassword(email) {
		return await this.service.recoverPassword(email);
	}

	async resetPassword(token, newPassword) {
		return await this.service.resetPassword(token, newPassword);
	}

	async getUserProfile() {
		return await this.service.getUserProfile();
	}

	async updateUserProfile(data) {
		return await this.service.updateUserProfile(data);
	}

	async changePassword(data) {
		return await this.service.changePassword(data);
	}

	// Métodos de asignaturas
	async getSubjects() {
		return await this.service.getSubjects();
	}

	async getSubject(id) {
		return await this.service.getSubject(id);
	}

	async createSubject(data) {
		return await this.service.createSubject(data);
	}

	async updateSubject(id, data) {
		return await this.service.updateSubject(id, data);
	}

	async deleteSubject(id) {
		return await this.service.deleteSubject(id);
	}

	// Métodos de profesores
	async addProfessorToSubject(subjectId, professorData) {
		return await this.service.addProfessorToSubject(subjectId, professorData);
	}

	async removeProfessorFromSubject(subjectId, professorId) {
		return await this.service.removeProfessorFromSubject(subjectId, professorId);
	}

	// Métodos de temas
	async getTopics(subjectId) {
		return await this.service.getTopics(subjectId);
	}

	async getTopic(subjectId, topicId) {
		return await this.service.getTopic(subjectId, topicId);
	}

	async createTopic(subjectId, data) {
		return await this.service.createTopic(subjectId, data);
	}

	async updateTopic(subjectId, topicId, data) {
		return await this.service.updateTopic(subjectId, topicId, data);
	}

	async deleteTopic(subjectId, topicId) {
		return await this.service.deleteTopic(subjectId, topicId);
	}

	// Métodos de subtemas
	async getSubtopics(subjectId, topicId) {
		return await this.service.getSubtopics(subjectId, topicId);
	}

	async getSubtopic(subjectId, topicId, subtopicId) {
		return await this.service.getSubtopic(subjectId, topicId, subtopicId);
	}

	async createSubtopic(subjectId, topicId, data) {
		return await this.service.createSubtopic(subjectId, topicId, data);
	}

	async updateSubtopic(subjectId, topicId, subtopicId, data) {
		return await this.service.updateSubtopic(subjectId, topicId, subtopicId, data);
	}

	async deleteSubtopic(subjectId, topicId, subtopicId) {
		return await this.service.deleteSubtopic(subjectId, topicId, subtopicId);
	}

	// Métodos de archivos y videos
	async uploadFile(subjectId, topicId, subtopicId, fileData) {
		return await this.service.uploadFile(subjectId, topicId, subtopicId, fileData);
	}

	async getSubtopicFiles(subjectId, topicId, subtopicId) {
		return await this.service.getSubtopicFiles(subjectId, topicId, subtopicId);
	}

	async deleteSubtopicFile(subjectId, topicId, subtopicId, fileId) {
		return await this.service.deleteSubtopicFile(subjectId, topicId, subtopicId, fileId);
	}

	async addVideoUrl(subjectId, topicId, subtopicId, videoData) {
		return await this.service.addVideoUrl(subjectId, topicId, subtopicId, videoData);
	}

	// Métodos de utilidad
	isAuthenticated() {
		return this.service.isAuthenticated();
	}

	getCurrentUser() {
		return this.service.getCurrentUser();
	}

	setLogging(enable) {
		this.service.setLogging(enable);
	}

	setAuth(token, user) {
		this.service.setAuth(token, user);
	}

	clearAuth() {
		this.service.clearAuth();
	}

	// Información sobre el servicio activo
	getServiceInfo() {
		return {
			type: 'real',
			name: 'Real API Service',
			baseUrl: this.service.baseUrl,
			authenticated: this.isAuthenticated(),
			user: this.getCurrentUser(),
		};
	}
}

// Exportar instancia única
const apiService = new ApiServiceWrapper();

export default apiService;