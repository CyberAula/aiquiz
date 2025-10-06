"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useManagerTranslation } from "../../../../../../hooks/useManagerTranslation";
import {
	SubtopicProvider,
	useSubtopic,
	Subtopic,
} from "../../../../../../contexts/SubtopicContext";
import useApiRequest from "../../../../../../hooks/useApiRequest";
import apiService from "../../../../../../services";

// Importar los componentes de las pestañas
import { ContentTab, SettingsTab } from "../../../../../../components/subtopic";

// Componente interno para el contenido
const SubtopicDetailContent = () => {
	const params = useParams();
	const id = params.id as string;
	const topicId = params.topicId as string;
	const subtopicId = params.subtopicId as string;

	const router = useRouter();
	const { t } = useManagerTranslation();
	const { subtopic, loading, setSubtopic, refetchSubtopic } = useSubtopic();

	// Estados para UI
	const [activeTab, setActiveTab] = useState("content");
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState({ step: '', progress: 0 });
	const [isProcessingVideo, setIsProcessingVideo] = useState(false);
	const [videoProgress, setVideoProgress] = useState({ step: '', progress: 0 });
	const [files, setFiles] = useState([]);
	const [filesLoaded, setFilesLoaded] = useState(false);

	// API para modificaciones del subtema
	const { makeRequest: updateSubtopic, loading: updatingSubtopic } =
		useApiRequest(
			`/api/manager/subjects/${id}/topics/${topicId}/subtopics/${subtopicId}`,
			"PUT",
			null,
			false
		);

	// API para eliminar subtema
	const { makeRequest: deleteSubtopic, loading: deletingSubtopic } =
		useApiRequest(
			`/api/manager/subjects/${id}/topics/${topicId}/subtopics/${subtopicId}`,
			"DELETE",
			null,
			false
		);

	// API para gestión de archivos
	const { makeRequest: uploadDocument, loading: uploadingDocument } =
		useApiRequest(
			`/api/manager/subjects/${id}/topics/${topicId}/subtopics/${subtopicId}/files`,
			"POST",
			null,
			false
		);

	const { makeRequest: addVideoUrl, loading: addingVideoUrl } = useApiRequest(
		`/api/manager/subjects/${id}/topics/${topicId}/subtopics/${subtopicId}/videos`,
		"POST",
		null,
		false
	);

	const { makeRequest: getFiles, loading: loadingFiles } = useApiRequest(
		`/api/manager/subjects/${id}/topics/${topicId}/subtopics/${subtopicId}/files`,
		"GET",
		null,
		false // No cargar automáticamente al montar
	);

	const { makeRequest: deleteFileAPI, loading: deletingFile } = useApiRequest(
		"",
		"DELETE",
		null,
		false
	);

	const handleTabChange = (tab: string) => {
		setActiveTab(tab);
	};

	// Función para cargar archivos del subtema
	const loadSubtopicFiles = useCallback(async (forceReload = false) => {
		if (filesLoaded && !forceReload) {
			console.log('📋 Archivos ya cargados, omitiendo...');
			return;
		}
		
		try {
			console.log('📋 Cargando archivos del subtema...');
			const response = await getFiles();
			
			if (response && response.success) {
				setFiles(response.data?.files || []);
				setFilesLoaded(true);
				console.log(`✅ ${response.data?.files?.length || 0} archivos cargados`);
			} else {
				console.error('❌ Error cargando archivos:', response?.message || 'No response');
				setFiles([]);
			}
		} catch (error) {
			console.error('❌ Error cargando archivos:', error);
			setFiles([]);
		}
	}, [filesLoaded, getFiles]); // Depender del estado de carga y función API

	// Cargar archivos cuando se carga el componente o cambia el subtema
	useEffect(() => {
		if (subtopic) {
			// Force reload when subtopic changes
			setFilesLoaded(false);
			loadSubtopicFiles(true);
		}
	}, [subtopic?.id]); // Solo depender del ID del subtema, no de la función

	// Subida de documento PDF con procesamiento RAG
	const handleUploadDocument = () => {
		// Crear un input de archivo oculto
		const fileInput = document.createElement("input");
		fileInput.type = "file";
		fileInput.accept = ".pdf";  // Solo PDFs para procesamiento RAG

		// Manejar el evento de cambio cuando se selecciona un archivo
		fileInput.onchange = async (e: Event) => {
			const target = e.target as HTMLInputElement;
			const files = target.files;

			if (files && files.length > 0) {
				const file = files[0];
				
				// Validar que es un PDF
				if (file.type !== 'application/pdf') {
					alert('Solo se permiten archivos PDF para el procesamiento semántico');
					return;
				}

				console.log("🚀 Iniciando subida de documento:", file.name);
				setIsUploading(true);
				setUploadProgress({ step: 'Preparando archivo...', progress: 10 });

				try {
					// Crear FormData con el archivo real
					setUploadProgress({ step: 'Creando FormData...', progress: 20 });
					const formData = new FormData();
					formData.append('file', file);
					formData.append('description', `Documento: ${file.name}`);
					
					console.log('📦 FormData creado:', {
						fileName: file.name,
						fileSize: file.size,
						fileType: file.type,
						hasFile: formData.has('file')
					});

					// Llamar a la API con FormData
					setUploadProgress({ step: 'Enviando al servidor...', progress: 30 });
					console.log('📤 Enviando archivo al servidor...');
					
					const result = await uploadDocument(formData);
					
					console.log('✅ Respuesta del servidor:', result);
					
					// Verificar si se usó modo desarrollo
					if (result?.data?.ragMode === 'development') {
						setUploadProgress({ step: 'Procesado en modo desarrollo...', progress: 70 });
						console.log('ℹ️ Archivo procesado con Mock RAG (modo desarrollo)');
					} else {
						setUploadProgress({ step: 'Procesando PDF...', progress: 70 });
					}

					// Recargar los datos del subtema y archivos
					setUploadProgress({ step: 'Actualizando datos...', progress: 90 });
					// Force reload instead of setting flag
					await Promise.all([
						refetchSubtopic(),
						loadSubtopicFiles(true) // Force reload
					]);
					
					// Mensaje de éxito basado en el modo
					const successMessage = result?.data?.ragMode === 'development' 
						? 'Completado (desarrollo)' 
						: 'Completado';
					setUploadProgress({ step: successMessage, progress: 100 });
					
					// Mostrar éxito por 3 segundos (más tiempo para desarrollo)
					setTimeout(() => {
						setUploadProgress({ step: '', progress: 0 });
					}, 3000);
					
				} catch (error) {
					console.error("❌ Error al subir el documento:", error);
					setUploadProgress({ step: `Error: ${error.message}`, progress: 0 });
					
					// Limpiar mensaje de error después de 5 segundos
					setTimeout(() => {
						setUploadProgress({ step: '', progress: 0 });
					}, 5000);
				} finally {
					setIsUploading(false);
				}
			}
		};

		// Hacer clic en el input de archivo
		fileInput.click();
	};

	const handleAddVideoUrl = async (url: string) => {
		console.log("🎥 Iniciando procesamiento de video:", url);
		setIsProcessingVideo(true);
		setVideoProgress({ step: 'Validando URL...', progress: 10 });

		try {
			// Validación básica de URL
			if (!url.includes('youtube.com') && !url.includes('youtu.be') && !url.includes('vimeo.com')) {
				throw new Error('Solo se admiten URLs de YouTube y Vimeo');
			}

			setVideoProgress({ step: 'Detectando plataforma...', progress: 20 });
			
			const platform = url.includes('youtube') ? 'youtube' : 
							 url.includes('vimeo') ? 'vimeo' : 'other';
			
			console.log("📺 Plataforma detectada:", platform);

			setVideoProgress({ step: 'Enviando al servidor...', progress: 30 });

			// Llamada real a la API
			const result = await addVideoUrl({
				url: url,
				platform: platform,
				title: `Video de ${platform}`,
				description: `Video educativo procesado automáticamente`
			});

			console.log("✅ Respuesta del servidor:", result);

			setVideoProgress({ step: 'Extrayendo metadata...', progress: 50 });
			
			// Simular progreso de transcripción
			setTimeout(() => {
				setVideoProgress({ step: 'Generando transcripción...', progress: 70 });
			}, 500);

			setTimeout(() => {
				setVideoProgress({ step: 'Procesando con RAG...', progress: 90 });
			}, 1000);

			// Recargar los datos del subtema y archivos
			setVideoProgress({ step: 'Actualizando datos...', progress: 95 });
			await Promise.all([
				refetchSubtopic(),
				loadSubtopicFiles(true)
			]);

			setVideoProgress({ step: 'Completado', progress: 100 });
			
			// Limpiar mensaje de éxito después de 3 segundos
			setTimeout(() => {
				setVideoProgress({ step: '', progress: 0 });
			}, 3000);

		} catch (error) {
			console.error("❌ Error al procesar video:", error);
			setVideoProgress({ step: `Error: ${error.message}`, progress: 0 });
			
			// Limpiar mensaje de error después de 5 segundos
			setTimeout(() => {
				setVideoProgress({ step: '', progress: 0 });
			}, 5000);
		} finally {
			setIsProcessingVideo(false);
		}
	};

	const handleDeleteFile = async (fileId: string) => {
		if (!confirm('¿Estás seguro de que quieres eliminar este archivo? Esta acción no se puede deshacer.')) {
			return;
		}

		try {
			console.log("🗑️ Eliminando archivo:", fileId);

			// Usar el API service directamente
			const result = await apiService.deleteSubtopicFile(id, topicId, subtopicId, fileId);

			if (result && result.success) {
				console.log("✅ Archivo eliminado:", result.data?.fileName);
				// Recargar la lista de archivos
				await loadSubtopicFiles(true); // Force reload
			} else {
				const errorMessage = result?.message || 'Error desconocido';
				console.error("❌ Error eliminando archivo:", errorMessage);
				alert(`Error eliminando archivo: ${errorMessage}`);
			}
		} catch (error) {
			console.error("❌ Error al eliminar el archivo:", error);
			alert(`Error eliminando archivo: ${error.message}`);
		}
	};

	const handleSaveSubtopicChanges = async (
		updatedData: Partial<Subtopic>
	) => {
		try {
			const response = await updateSubtopic(updatedData);

			if (response.success) {
				await refetchSubtopic();
			}
		} catch (error) {
			console.error("Error al actualizar el subtema:", error);
		}
	};

	const handleDeleteSubtopic = async () => {
		try {
			const response = await deleteSubtopic();

			if (response.success) {
				// Redireccionar a la página del tema
				router.push(`/manager/subjects/${id}/topics/${topicId}`);
			}
		} catch (error) {
			console.error("Error al eliminar el subtema:", error);
		}
	};

	if (loading) {
		return (
			<div className="p-6 sm:p-8">
				<div className="flex justify-center items-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
					<span className="ml-3 text-lg text-gray-700">
						{t("subtopicDetail.loading") || "Cargando..."}
					</span>
				</div>
			</div>
		);
	}

	if (!subtopic) {
		return (
			<div className="p-6 sm:p-8">
				<div className="text-center">
					<h2 className="text-xl font-semibold text-gray-700">
						{t("subtopicDetail.subtopicNotFound") ||
							"Subtema no encontrado"}
					</h2>
					<Link
						href={`/manager/subjects/${id}/topics/${topicId}`}
						className="mt-4 inline-block text-blue-600 hover:underline"
					>
						{t("subtopicDetail.backToTopic") || "Volver al tema"}
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 sm:p-8">
			{/* Breadcrumbs y título */}
			<div className="mb-6">
				<div className="flex items-center text-sm text-gray-500 mb-2">
					<Link
						href="/manager/subjects"
						className="hover:text-gray-700"
					>
						{t("navigation.subjects") || "Asignaturas"}
					</Link>
					<span className="mx-2">&gt;</span>
					<Link
						href={`/manager/subjects/${id}`}
						className="hover:text-gray-700"
					>
						{subtopic.subjectTitle || "Asignatura"}
					</Link>
					<span className="mx-2">&gt;</span>
					<Link
						href={`/manager/subjects/${id}/topics/${topicId}`}
						className="hover:text-gray-700"
					>
						{subtopic.topicTitle || subtopic.topic?.title || "Tema"}
					</Link>
					<span className="mx-2">&gt;</span>
					<span className="text-gray-900">{subtopic.title}</span>
				</div>

				<h1 className="text-3xl font-bold">{subtopic.title}</h1>
				<p className="text-gray-700 mt-2">{subtopic.description}</p>
			</div>

			{/* Tabs de navegación */}
			<div className="border-b border-gray-200 mb-6">
				<nav className="-mb-px flex space-x-8">
					<button
						onClick={() => handleTabChange("content")}
						className={`py-4 px-1 ${
							activeTab === "content"
								? "border-b-2 border-indigo-500 font-medium text-indigo-600"
								: "border-b-2 border-transparent font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
						}`}
					>
						{t("subtopicDetail.documentsAndVideos") ||
							"Documentos y videos"}
					</button>
					<button
						onClick={() => handleTabChange("settings")}
						className={`py-4 px-1 ${
							activeTab === "settings"
								? "border-b-2 border-indigo-500 font-medium text-indigo-600"
								: "border-b-2 border-transparent font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
						}`}
					>
						{t("subtopicDetail.settings") || "Ajustes"}
					</button>
				</nav>
			</div>

			{/* Contenido de las tabs */}
			<div className="mt-6">
				{activeTab === "content" && subtopic && (
					<ContentTab
						subtopic={subtopic}
						subjectId={id}
						topicId={topicId}
						files={files}
						onUploadDocument={handleUploadDocument}
						onAddVideoUrl={handleAddVideoUrl}
						onDeleteFile={handleDeleteFile}
						isLoading={
							uploadingDocument ||
							addingVideoUrl ||
							deletingFile ||
							loadingFiles
						}
						isUploading={isUploading}
						uploadProgress={uploadProgress}
						isProcessingVideo={isProcessingVideo}
						videoProgress={videoProgress}
					/>
				)}

				{activeTab === "settings" && subtopic && (
					<SettingsTab
						subtopic={subtopic}
						subjectId={id}
						topicId={topicId}
						onSaveChanges={handleSaveSubtopicChanges}
						onDeleteSubtopic={handleDeleteSubtopic}
						isLoading={updatingSubtopic || deletingSubtopic}
					/>
				)}
			</div>
		</div>
	);
};

// Componente principal con el provider del contexto
export default function SubtopicDetailPage() {
	return (
		<SubtopicProvider>
			<SubtopicDetailContent />
		</SubtopicProvider>
	);
}
