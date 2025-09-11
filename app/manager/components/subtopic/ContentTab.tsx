// /app/manager/components/subtopic/ContentTab.tsx
import { useState, useCallback } from "react";
import { useManagerTranslation } from "../../hooks/useManagerTranslation";
import { Subtopic } from "../../contexts/SubtopicContext";

interface ContentFile {
	_id: string;
	fileName: string;
	originalName: string;
	fileType: string;
	size: number;
	mimeType: string;
	url: string;
	description?: string;
	ragProcessed?: boolean;
	ragDocumentId?: string;
	ragStats?: {
		chunks: number;
		pages: number;
		processingTime: number;
		textLength: number;
		quality: string;
	};
	transcription?: {
		content: string;
		metadata?: {
			title?: string;
			author?: string;
			duration?: string;
			url?: string;
			transcribedAt?: string;
			service?: string;
			language?: string;
			characterCount?: number;
		};
	};
	uploadedBy?: {
		name: string;
		email: string;
	};
	createdAt: string;
	updatedAt: string;
}

interface ContentTabProps {
	subtopic: Subtopic;
	subjectId: string;
	topicId: string;
	files: ContentFile[];
	onUploadDocument: () => void;
	onAddVideoUrl: (url: string) => void;
	onDeleteFile: (fileId: string) => void;
	isLoading?: boolean;
	isUploading?: boolean;
	uploadProgress?: { step: string; progress: number };
	isProcessingVideo?: boolean;
	videoProgress?: { step: string; progress: number };
}

/**
 * Componente de pestaña para gestionar el contenido de un subtema
 */
const ContentTab: React.FC<ContentTabProps> = ({
	subtopic,
	subjectId,
	topicId,
	files,
	onUploadDocument,
	onAddVideoUrl,
	onDeleteFile,
	isLoading = false,
	isUploading = false,
	uploadProgress = { step: '', progress: 0 },
	isProcessingVideo = false,
	videoProgress = { step: '', progress: 0 },
}) => {
	const { t } = useManagerTranslation();
	const [videoUrl, setVideoUrl] = useState<string>("");

	// Formatear tamaño de archivo
	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	// Formatear fecha
	const formatDate = (dateString: string): string => {
		return new Date(dateString).toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	/**
	 * Maneja el cambio en el campo de URL de video
	 */
	const handleVideoUrlChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setVideoUrl(e.target.value);
		},
		[]
	);

	/**
	 * Añade la URL de video al subtema
	 */
	const handleAddVideoUrl = useCallback(() => {
		if (videoUrl.trim() && !isProcessingVideo) {
			onAddVideoUrl(videoUrl);
			setVideoUrl("");
		}
	}, [videoUrl, onAddVideoUrl, isProcessingVideo]);

	/**
	 * Determina el icono adecuado según la extensión del archivo o tipo
	 */
	const getFileIcon = useCallback((fileName: string, fileType?: string): JSX.Element => {
		// Videos externos
		if (fileType === 'video') {
			return (
				<svg
					className="w-4 h-4 text-red-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
					/>
				</svg>
			);
		}

		const extension = fileName.split(".").pop()?.toLowerCase();

		if (extension === "pdf") {
			return (
				<svg
					className="w-4 h-4 text-red-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
					/>
				</svg>
			);
		} else if (["ppt", "pptx"].includes(extension || "")) {
			return (
				<svg
					className="w-4 h-4 text-orange-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
					/>
				</svg>
			);
		} else if (["doc", "docx"].includes(extension || "")) {
			return (
				<svg
					className="w-4 h-4 text-blue-600"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
					/>
				</svg>
			);
		} else {
			return (
				<svg
					className="w-4 h-4 text-gray-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
					/>
				</svg>
			);
		}
	}, []);

	/**
	 * Maneja la descarga de un archivo
	 */
	const handleDownloadFile = async (file: ContentFile) => {
		try {
			console.log('Iniciando descarga de archivo:', file.originalName);
			
			// 1. Obtener token de descarga
			const token = localStorage.getItem('jwt_token') || localStorage.getItem('auth_token');
			if (!token) {
				console.error('No hay token de autenticación');
				return;
			}

			const response = await fetch(file.url, {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (!response.ok) {
				console.error('Error obteniendo token de descarga:', response.status);
				return;
			}

			const result = await response.json();
			if (!result.success) {
				console.error('Error en respuesta:', result.message);
				return;
			}

			// 2. Usar la URL de descarga con token temporal
			const downloadUrl = result.data.downloadUrl;
			console.log('Descargando desde:', downloadUrl);

			// 3. Crear un enlace temporal y hacer click
			const link = document.createElement('a');
			link.href = downloadUrl;
			link.download = result.data.fileName;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			console.log('Descarga iniciada exitosamente');
		} catch (error) {
			console.error('Error durante la descarga:', error);
		}
	};

	/**
	 * Renderiza un archivo individual
	 */
	const renderFile = (file: ContentFile): JSX.Element => {
		return (
			<div
				key={file._id}
				className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
			>
				<div className="flex items-center space-x-3 flex-1">
					{getFileIcon(file.originalName, file.fileType)}
					<div className="flex-1 min-w-0">
						<div className="flex items-center space-x-2">
							<p className="text-sm font-medium text-gray-900 truncate">
								{file.originalName}
							</p>
							{file.ragProcessed && (
								<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
									RAG
								</span>
							)}
							{file.fileType === 'video' && file.transcription && (
								<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
									TXT
								</span>
							)}
						</div>
						<div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
							<span>{formatFileSize(file.size)}</span>
							<span>{formatDate(file.createdAt)}</span>
							{file.uploadedBy && (
								<span>por {file.uploadedBy.name}</span>
							)}
						</div>
						{file.description && (
							<p className="text-xs text-gray-600 mt-1 truncate">
								{file.description}
							</p>
						)}
						{file.ragProcessed && file.ragStats && (
							<div className="text-xs text-gray-500 mt-1">
								{file.ragStats.chunks} chunks, {file.ragStats.pages} páginas
							</div>
						)}
						{file.fileType === 'video' && file.transcription && (
							<div className="text-xs text-gray-500 mt-1">
								Transcripción: {file.transcription.metadata?.characterCount || 'N/A'} caracteres
								{file.transcription.metadata?.duration && `, ${file.transcription.metadata.duration}`}
							</div>
						)}
					</div>
				</div>
				<div className="flex items-center space-x-2">
					<button
						onClick={() => handleDownloadFile(file)}
						className="text-gray-400 hover:text-blue-600 transition-colors"
						title={file.fileType === 'video' && file.transcription ? "Descargar transcripción (TXT)" : "Descargar archivo"}
						disabled={isLoading}
					>
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
					</button>
					<button
						onClick={() => onDeleteFile(file._id)}
						className="text-gray-400 hover:text-red-600 transition-colors"
						title={t("subtopicDetail.deleteFile") || "Eliminar archivo"}
						aria-label={`Eliminar archivo ${file.originalName}`}
						disabled={isLoading}
					>
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
							/>
						</svg>
					</button>
				</div>
			</div>
		);
	};

	/**
	 * Renderiza el botón para subir documentos con progreso
	 */
	const renderUploadButton = (): JSX.Element => {
		return (
			<div className="space-y-2">
				<button
					onClick={onUploadDocument}
					className={`px-3 py-2 rounded-md flex items-center text-sm transition-colors ${
						isUploading 
							? 'bg-blue-600 text-white cursor-not-allowed' 
							: 'bg-gray-800 text-white hover:bg-gray-700'
					}`}
					disabled={isLoading || isUploading}
					aria-label="Subir documento PDF"
				>
					{isUploading ? (
						<div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
					) : (
						<svg
							className="w-4 h-4 mr-1"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M12 4v16m8-8H4"
							/>
						</svg>
					)}
					{isUploading ? 'Subiendo PDF...' : 'Subir PDF (RAG)'}
				</button>
				
				{/* Barra de progreso */}
				{isUploading && uploadProgress.step && (
					<div className="w-full max-w-xs">
						<div className="flex justify-between text-xs text-gray-600 mb-1">
							<span>{uploadProgress.step}</span>
							<span>{uploadProgress.progress}%</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-2">
							<div 
								className="bg-blue-600 h-2 rounded-full transition-all duration-300"
								style={{ width: `${uploadProgress.progress}%` }}
							></div>
						</div>
					</div>
				)}
				
				{/* Mensaje de error */}
				{!isUploading && uploadProgress.step && uploadProgress.step.startsWith('Error') && (
					<div className="text-red-600 text-xs max-w-xs">
						{uploadProgress.step}
					</div>
				)}
				
				{/* Mensaje de éxito */}
				{!isUploading && (uploadProgress.step === 'Completado' || uploadProgress.step === 'Completado (desarrollo)') && (
					<div className="text-green-600 text-xs">
						✅ PDF procesado exitosamente
						{uploadProgress.step.includes('desarrollo') && (
							<span className="text-blue-600 ml-1">(modo desarrollo)</span>
						)}
					</div>
				)}
			</div>
		);
	};

	/**
	 * Renderiza el formulario para añadir URL de video
	 */
	const renderVideoUrlForm = (): JSX.Element => {
		return (
			<div className="flex-1 space-y-2">
				<div className="flex items-center gap-2">
					<input
						type="text"
						placeholder="https://www.youtube.com/watch?v=..."
						value={videoUrl}
						onChange={handleVideoUrlChange}
						className="flex-1 p-2 border rounded-md text-sm"
						aria-label="URL del video de YouTube"
						disabled={isProcessingVideo}
					/>
					<button
						onClick={handleAddVideoUrl}
						disabled={!videoUrl.trim() || isLoading || isProcessingVideo}
						className={`px-3 py-2 rounded-md text-sm transition-colors flex items-center ${
							isProcessingVideo 
								? 'bg-blue-600 text-white cursor-not-allowed' 
								: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50'
						}`}
						aria-label="Añadir URL de video"
					>
						{isProcessingVideo ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
								Procesando...
							</>
						) : (
							<>
								<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
								</svg>
								Video
							</>
						)}
					</button>
				</div>
				
				{/* Barra de progreso para video */}
				{isProcessingVideo && videoProgress.step && (
					<div className="w-full">
						<div className="flex justify-between text-xs text-gray-600 mb-1">
							<span>{videoProgress.step}</span>
							<span>{videoProgress.progress}%</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-2">
							<div 
								className="bg-blue-600 h-2 rounded-full transition-all duration-300"
								style={{ width: `${videoProgress.progress}%` }}
							></div>
						</div>
					</div>
				)}
				
				{/* Mensaje de error para video */}
				{!isProcessingVideo && videoProgress.step && videoProgress.step.startsWith('Error') && (
					<div className="text-red-600 text-xs">
						{videoProgress.step}
					</div>
				)}
				
				{/* Mensaje de éxito para video */}
				{!isProcessingVideo && videoProgress.step === 'Completado' && (
					<div className="text-green-600 text-xs">
						🎥 Video procesado y transcrito exitosamente
					</div>
				)}
			</div>
		);
	};

	return (
		<div>
			<p className="text-gray-700 mb-4">
				{t("subtopicDetail.contentDescription") ||
					"El contenido de los documentos se utilizará para generar preguntas del subtema."}
			</p>

			<div className="flex gap-2 mb-4">
				{renderUploadButton()}
				{renderVideoUrlForm()}
			</div>

			<div className="mt-1 text-xs text-gray-500 mb-4">
				{t("subtopicDetail.allowedFiles") ||
					"Formatos admitidos: PDF, PPT, DOC, DOCX. Videos: YouTube, Vimeo."}
			</div>

			{/* Lista de archivos */}
			{files.length === 0 ? (
				<div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
					<p className="text-gray-500">
						{t("subtopicDetail.noFiles") ||
							"No hay documentos ni videos asociados a este subtema."}
					</p>
				</div>
			) : (
				<div className="space-y-2">{files.map(renderFile)}</div>
			)}
		</div>
	);
};

export default ContentTab;
