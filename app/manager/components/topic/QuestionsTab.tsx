// /app/manager/components/topic/QuestionsTab.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useManagerTranslation } from "../../hooks/useManagerTranslation";
import useApiRequest from "../../hooks/useApiRequest";
import SearchBar from "../subject/SearchBar";
import { ConfirmationModal } from "../common";
import QuestionStatusFilter, { StatusFilter } from "./QuestionStatusFilter";
import GenerateQuestionsModal from "./GenerateQuestionsModal";
import { useTopic } from "../../contexts/TopicContext";

interface Choice {
	text: string;
	isCorrect: boolean;
}

interface Question {
	_id: string;
	id?: string; // Para compatibilidad
	text: string;
	type: string;
	difficulty: string;
	createdAt: string;
	choices?: Choice[] | string[]; // Puede ser formato manager (Choice[]) o quiz (string[])
	answer?: number; // Índice de respuesta correcta en formato quiz
	verified?: boolean;
	rejected?: boolean;
	generated?: boolean;
	explanation?: string;
	tags?: string[];
}

interface QuestionsResponse {
	success: boolean;
	questions: Question[];
	total: number;
	stats: {
		verified: number;
		unverified: number;
		generated: number;
		manual: number;
	};
}

interface QuestionsTabProps {
	topicId: string;
	subjectId: string;
}

/**
 * Componente de pestaña para gestionar preguntas
 */
const QuestionsTab: React.FC<QuestionsTabProps> = ({ topicId, subjectId }) => {
	const { t } = useManagerTranslation();
	const { topic } = useTopic();

	// Estados para los datos
	const [questions, setQuestions] = useState<Question[]>([]);
	const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);

	// Estados para la selección
	const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
	const [selectAll, setSelectAll] = useState<boolean>(false);

	// Estados para UI
	const [showFormatOptions, setShowFormatOptions] = useState<boolean>(false);
	const [showQuestionDetails, setShowQuestionDetails] = useState<
		string | null
	>(null);
	const [expandAllQuestions, setExpandAllQuestions] =
		useState<boolean>(false);
	const [statusFilter, setStatusFilter] =
		useState<StatusFilter>("unverified");
	const [searchQuery, setSearchQuery] = useState<string>("");

	// Estados para paginación
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [questionsPerPage] = useState<number>(10); // Preguntas por página

	// Estados para modales
	const [showGenerateModal, setShowGenerateModal] = useState<boolean>(false);
	const [generationTitle, setGenerationTitle] = useState<string>("");
	const [generationDescription, setGenerationDescription] =
		useState<string>("");
	const [showGenerateQuestionsModal, setShowGenerateQuestionsModal] =
		useState<boolean>(false);
	
	// Estados para feedback
	const [generationStatus, setGenerationStatus] = useState<string>("");
	const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);

	// API para obtener preguntas
	const {
		data: questionsData,
		loading,
		error,
		makeRequest: fetchQuestions,
	} = useApiRequest(
		`/api/manager/subjects/${subjectId}/topics/${topicId}/questions`,
		"GET",
		null,
		true
	);

	// Debug logs
	console.log('[QuestionsTab] Estado de la petición:', {
		loading,
		error,
		questionsData,
		url: `/api/manager/subjects/${subjectId}/topics/${topicId}/questions`
	});

	// API para generar cuestionario desde preguntas seleccionadas
	const {
		makeRequest: generateQuestionnaire,
		loading: generatingQuestionnaire,
	} = useApiRequest(
		`/api/manager/subjects/${subjectId}/topics/${topicId}/questionnaires`,
		"POST",
		null,
		false
	);

	// API para descargar preguntas seleccionadas
	const { makeRequest: downloadQuestions, loading: downloadingQuestions } =
		useApiRequest(
			`/api/manager/subjects/${subjectId}/topics/${topicId}/questions/download`,
			"POST",
			null,
			false
		);

	// API para generar nuevas preguntas
	const {
		makeRequest: generateNewQuestions,
		loading: generatingNewQuestions,
	} = useApiRequest(
		`/api/manager/subjects/${subjectId}/topics/${topicId}/generate-questions`,
		"POST",
		null,
		false
	);

	// API para verificar o rechazar preguntas
	const { makeRequest: updateQuestionStatus, loading: updatingQuestion } =
		useApiRequest(
			`/api/manager/subjects/${subjectId}/topics/${topicId}/questions`,
			"PATCH",
			null,
			false
		);

	/**
	 * Inicializa las preguntas a partir de los datos obtenidos
	 */
	useEffect(() => {
		console.log('[QuestionsTab] useEffect - questionsData cambió:', questionsData);
		
		if (questionsData?.questions) {
			console.log('[QuestionsTab] Procesando preguntas:', questionsData.questions.length);
			const questionsWithSelected = questionsData.questions.map((q: Question) => ({
				...q,
				id: q._id, // Mapear _id a id para compatibilidad
				selected: selectedQuestions.includes(q._id),
				verified: q.verified !== undefined ? q.verified : false,
				rejected: q.rejected !== undefined ? q.rejected : false,
			}));
			setQuestions(questionsWithSelected);
			applyFilters(questionsWithSelected, searchQuery, statusFilter);
			console.log('[QuestionsTab] Preguntas procesadas y filtradas');
		} else {
			console.log('[QuestionsTab] No hay questionsData.questions:', questionsData);
		}
	}, [questionsData, selectedQuestions]);

	/**
	 * Aplica filtros por estado y búsqueda
	 */
	const applyFilters = useCallback(
		(questionsList: Question[], query: string, filter: StatusFilter) => {
			let filtered = [...questionsList];

			// Filtrar por estado
			if (filter !== "all") {
				if (filter === "unverified") {
					filtered = filtered.filter(
						(q) => !q.verified && !q.rejected
					);
				} else if (filter === "verified") {
					filtered = filtered.filter((q) => q.verified);
				} else if (filter === "rejected") {
					filtered = filtered.filter((q) => q.rejected);
				}
			}

			// Filtrar por búsqueda
			if (query) {
				const queryLower = query.toLowerCase();
				filtered = filtered.filter(
					(question) =>
						question.text.toLowerCase().includes(queryLower) ||
						question.type.toLowerCase().includes(queryLower) ||
						question.difficulty.toLowerCase().includes(queryLower)
				);
			}

			setFilteredQuestions(filtered);
		},
		[]
	);

	// Calcular preguntas paginadas
	const paginatedQuestions = React.useMemo(() => {
		const startIndex = (currentPage - 1) * questionsPerPage;
		const endIndex = startIndex + questionsPerPage;
		return filteredQuestions.slice(startIndex, endIndex);
	}, [filteredQuestions, currentPage, questionsPerPage]);

	/**
	 * Actualiza el estado de selectAll basándose en las preguntas de la página actual
	 */
	useEffect(() => {
		if (paginatedQuestions.length > 0) {
			const allCurrentPageSelected = paginatedQuestions.every(q => 
				selectedQuestions.includes(q.id || q._id)
			);
			setSelectAll(allCurrentPageSelected);
		} else {
			setSelectAll(false);
		}
	}, [paginatedQuestions, selectedQuestions]);

	// Calcular información de paginación
	const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
	const showingStart = ((currentPage - 1) * questionsPerPage) + 1;
	const showingEnd = Math.min(currentPage * questionsPerPage, filteredQuestions.length);

	/**
	 * Maneja el cambio de página
	 */
	const handlePageChange = useCallback((page: number) => {
		setCurrentPage(page);
		// No limpiar selecciones al cambiar de página para permitir selección multi-página
		// Actualizar el estado de selectAll basado en las preguntas de la nueva página
		setSelectAll(false); // Se actualizará automáticamente en el useEffect
	}, []);

	/**
	 * Resetea la página actual cuando cambian los filtros
	 */
	const resetPagination = useCallback(() => {
		setCurrentPage(1);
	}, []);

	/**
	 * Maneja la búsqueda de preguntas
	 */
	const handleSearch = useCallback(
		(query: string) => {
			setSearchQuery(query);
			applyFilters(questions, query, statusFilter);
			resetPagination(); // Resetear a la primera página
			// Limpiar selecciones cuando cambia la búsqueda para evitar confusión
			setSelectedQuestions([]);
			setSelectAll(false);
		},
		[questions, statusFilter, applyFilters, resetPagination]
	);

	/**
	 * Maneja el cambio de filtro por estado
	 */
	const handleStatusFilterChange = useCallback(
		(filter: StatusFilter) => {
			setStatusFilter(filter);
			applyFilters(questions, searchQuery, filter);
			resetPagination(); // Resetear a la primera página
			// Limpiar selecciones cuando cambia el filtro para evitar confusión
			setSelectedQuestions([]);
			setSelectAll(false);
		},
		[questions, searchQuery, applyFilters, resetPagination]
	);

	/**
	 * Maneja la selección de una pregunta
	 */
	const handleSelectQuestion = useCallback((id: string) => {
		setSelectedQuestions((prev) => {
			if (prev.includes(id)) {
				return prev.filter((qId) => qId !== id);
			} else {
				return [...prev, id];
			}
		});
	}, []);

	/**
	 * Maneja la selección/deselección de todas las preguntas
	 */
	const handleSelectAll = useCallback(() => {
		if (!selectAll) {
			// Seleccionar todas las preguntas de la página actual (añadir a las ya seleccionadas)
			const currentPageIds = paginatedQuestions.map((q) => q.id || q._id);
			setSelectedQuestions(prev => {
				const newSelections = [...prev];
				currentPageIds.forEach(id => {
					if (!newSelections.includes(id)) {
						newSelections.push(id);
					}
				});
				return newSelections;
			});
		} else {
			// Deseleccionar todas las preguntas de la página actual (mantener las de otras páginas)
			const currentPageIds = paginatedQuestions.map((q) => q.id || q._id);
			setSelectedQuestions(prev => prev.filter(id => !currentPageIds.includes(id)));
		}
	}, [selectAll, paginatedQuestions]);

	/**
	 * Alterna la expansión de todas las preguntas
	 */
	const toggleExpandAllQuestions = useCallback(() => {
		setExpandAllQuestions(!expandAllQuestions);
	}, [expandAllQuestions]);

	/**
	 * Alterna la visualización de detalles de una pregunta
	 */
	const handleToggleDetails = useCallback(
		(id: string) => {
			if (expandAllQuestions) return;
			setShowQuestionDetails(showQuestionDetails === id ? null : id);
		},
		[expandAllQuestions, showQuestionDetails]
	);

	/**
	 * Maneja la verificación o rechazo de una pregunta
	 */
	const handleVerifyQuestion = useCallback(
		async (id: string, isValid: boolean) => {
			try {
				console.log('[QuestionsTab] Verificando pregunta:', { id, isValid });
				
				// Llamada a la API para verificar/rechazar pregunta
				const result = await updateQuestionStatus({
					questionId: id,
					action: isValid ? 'verify' : 'reject',
				});

				console.log('[QuestionsTab] Resultado de verificación:', result);

				// Actualizar estado local
				const updatedQuestions = questions.map((q) => {
					const questionId = q.id || q._id;
					return questionId === id
						? { ...q, verified: isValid, rejected: !isValid }
						: q;
				});

				setQuestions(updatedQuestions);
				applyFilters(updatedQuestions, searchQuery, statusFilter);
			} catch (error) {
				console.error("Error al verificar pregunta:", error);
			}
		},
		[questions, searchQuery, statusFilter, updateQuestionStatus, applyFilters]
	);

	/**
	 * Genera un cuestionario a partir de las preguntas seleccionadas
	 */
	const handleGenerateQuestionnaire = useCallback(
		async (title: string, description: string) => {
			if (selectedQuestions.length === 0 || !title.trim()) return;

			try {
				const response = await generateQuestionnaire({
					title: title,
					description: description,
					questionIds: selectedQuestions,
				});

				if (response.success) {
					// Redirigir a la pestaña de cuestionarios o mostrar mensaje de éxito
					setShowGenerateModal(false);
					setGenerationTitle("");
					setGenerationDescription("");
					// Opcional: deseleccionar todas las preguntas
					setSelectedQuestions([]);
					setSelectAll(false);
				}
			} catch (error) {
				console.error("Error al generar cuestionario:", error);
			}
		},
		[selectedQuestions, generateQuestionnaire]
	);

	/**
	 * Descarga las preguntas seleccionadas en el formato especificado
	 */
	const handleDownloadQuestions = useCallback(
		async (format: string) => {
			if (selectedQuestions.length === 0) return;

			try {
				console.log(`Iniciando descarga de ${selectedQuestions.length} preguntas en formato ${format}`);
				
				const result = await downloadQuestions({
					questionIds: selectedQuestions,
					format,
				});

				if (result?.success) {
					console.log(`✅ Descarga completada: ${result.filename}`);
				}

				// Cerrar menú desplegable
				setShowFormatOptions(false);
			} catch (error) {
				console.error("Error al descargar preguntas:", error);
				// TODO: Mostrar mensaje de error al usuario
			}
		},
		[selectedQuestions, downloadQuestions]
	);

	/**
	 * Genera nuevas preguntas
	 */
	const handleGenerateNewQuestions = useCallback(
		async (difficulty: string, count: number, subtopicId?: string) => {
			try {
				setGenerationStatus(t("topicDetail.generatingQuestions", { count, difficulty }));
				
				const response = await generateNewQuestions({
					difficulty: difficulty,
					count: count,
					type: "Opción múltiple",
					subtopicId: subtopicId || undefined,
					includeExplanations: true
				});

				if (response.success && response.questions) {
					setGenerationStatus(t("topicDetail.questionsGeneratedSuccess", { count: response.questionsGenerated || count }));
					
					// Actualizar con las nuevas preguntas
					await fetchQuestions();
					setShowGenerateQuestionsModal(false);
					
					// Mostrar mensaje de éxito
					setShowSuccessMessage(true);
					setTimeout(() => {
						setShowSuccessMessage(false);
						setGenerationStatus("");
					}, 4000);
				} else {
					setGenerationStatus(t("topicDetail.questionsGenerationError", { error: "No se pudieron generar las preguntas" }));
					setTimeout(() => setGenerationStatus(""), 3000);
				}
			} catch (error) {
				console.error("Error al generar nuevas preguntas:", error);
				setGenerationStatus(t("topicDetail.questionsGenerationError", { error: error instanceof Error ? error.message : 'Error desconocido' }));
				setTimeout(() => setGenerationStatus(""), 3000);
			}
		},
		[generateNewQuestions, fetchQuestions]
	);

	/**
	 * Renderiza los botones de acción para preguntas seleccionadas
	 */
	const renderActionButtons = useCallback(() => {
		if (selectedQuestions.length === 0) return null;

		return (
			<div className="flex space-x-2">
				<div className="relative">
					<button
						className="bg-blue-600 text-white py-2 px-4 rounded-md flex items-center"
						onClick={() => setShowFormatOptions(!showFormatOptions)}
						disabled={loading}
						aria-label="Descargar preguntas"
					>
						<svg
							className="w-5 h-5 mr-1"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
							/>
						</svg>
						{t("topicDetail.download") || "Descargar"}
						<svg
							className={`w-4 h-4 ml-1 transition-transform ${
								showFormatOptions ? "rotate-180" : ""
							}`}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</button>
					{showFormatOptions && (
						<div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
							<button
								onClick={() => handleDownloadQuestions("pdf")}
								className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
								disabled={downloadingQuestions}
							>
								PDF
							</button>
							<button
								onClick={() =>
									handleDownloadQuestions("moodle")
								}
								className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
								disabled={downloadingQuestions}
							>
								Moodle XML
							</button>
						</div>
					)}
				</div>

				<button
					onClick={() => setShowGenerateModal(true)}
					className="bg-green-600 text-white py-2 px-4 rounded-md flex items-center"
					disabled={loading}
					aria-label="Generar cuestionario"
				>
					<svg
						className="w-5 h-5 mr-1"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
					{t("topicDetail.generateQuestionnaire") ||
						"Generar cuestionario"}
				</button>
			</div>
		);
	}, [
		selectedQuestions.length,
		showFormatOptions,
		loading,
		downloadingQuestions,
		t,
		handleDownloadQuestions,
	]);

	/**
	 * Renderiza el botón para generar nuevas preguntas
	 */
	const renderGenerateNewQuestionsButton = useCallback(() => {
		return (
			<button
				onClick={() => setShowGenerateQuestionsModal(true)}
				className="bg-indigo-600 text-white py-2 px-4 rounded-md flex items-center"
				disabled={generatingNewQuestions}
				aria-label="Generar nuevas preguntas"
			>
				{generatingNewQuestions ? (
					<>
						<svg
							className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							></circle>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						{t("common.processing")}
					</>
				) : (
					<>
						<svg
							className="w-5 h-5 mr-1"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						{t("topicDetail.generateNewQuestions") ||
							"Generar nuevas"}
					</>
				)}
			</button>
		);
	}, [generatingNewQuestions, t]);

	/**
	 * Renderiza la tabla de preguntas
	 */
	const renderQuestionsTable = useCallback(() => {
		return (
			<div className="overflow-hidden">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								<div className="flex items-center">
									<input
										type="checkbox"
										className="h-4 w-4 text-blue-600 border-gray-300 rounded"
										checked={selectAll}
										onChange={handleSelectAll}
										aria-label="Seleccionar todas"
									/>
								</div>
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								{t("topicDetail.questionText") || "Pregunta"}
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								{t("topicDetail.type") || "Tipo"}
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								{t("topicDetail.difficulty") || "Dificultad"}
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								{t("topicDetail.status") || "Estado"}
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								{t("topicDetail.actions") || "Acciones"}
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{paginatedQuestions.map((question) =>
							renderQuestionRow(question)
						)}
					</tbody>
				</table>
			</div>
		);
	}, [paginatedQuestions, selectAll, t, handleSelectAll]);

	/**
	 * Renderiza una fila de pregunta
	 */
	const renderQuestionRow = useCallback(
		(question: Question) => {
			const questionId = question.id || question._id;
			const isSelected = selectedQuestions.includes(questionId);
			const isExpanded =
				expandAllQuestions || showQuestionDetails === questionId;

			return (
				<>
					<tr
						key={questionId}
						className={`hover:bg-gray-50 ${
							isSelected
								? "bg-blue-50"
								: question.verified
								? "bg-green-50"
								: question.rejected
								? "bg-red-50"
								: ""
						}`}
					>
						<td className="px-6 py-4 whitespace-nowrap">
							<div className="flex items-center">
								<input
									type="checkbox"
									className="h-4 w-4 text-blue-600 border-gray-300 rounded"
									checked={isSelected}
									onChange={() =>
										handleSelectQuestion(questionId)
									}
									aria-label={`Seleccionar pregunta ${question.text.substring(
										0,
										20
									)}...`}
								/>
							</div>
						</td>
						<td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-md">
							<button
								className="text-left hover:text-blue-600 focus:outline-none w-full overflow-ellipsis overflow-hidden"
								onClick={() => handleToggleDetails(questionId)}
								aria-label={`Ver detalles de pregunta: ${question.text.substring(
									0,
									20
								)}...`}
							>
								{question.text}
								{!expandAllQuestions && (
									<svg
										className="w-4 h-4 ml-1 inline-block"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										{showQuestionDetails === questionId ? (
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M5 15l7-7 7 7"
											/>
										) : (
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M19 9l-7 7-7-7"
											/>
										)}
									</svg>
								)}
							</button>
						</td>
						<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
							{question.type}
						</td>
						<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
							<span
								className={`px-2 py-1 rounded-full text-xs font-medium ${
									question.difficulty === "Fácil"
										? "bg-green-100 text-green-800"
										: question.difficulty === "Medio"
										? "bg-yellow-100 text-yellow-800"
										: "bg-red-100 text-red-800"
								}`}
							>
								{question.difficulty}
							</span>
						</td>
						<td className="px-6 py-4 whitespace-nowrap text-sm text-center">
							<span
								className={`px-2 py-1 rounded-full text-xs font-medium ${
									question.verified
										? "bg-green-100 text-green-800"
										: question.rejected
										? "bg-red-100 text-red-800"
										: "bg-gray-100 text-gray-800"
								}`}
							>
								{question.verified
									? t("topicDetail.verified") || "Verificada"
									: question.rejected
									? t("topicDetail.rejected") || "Rechazada"
									: t("topicDetail.unverified") ||
									  "No verificada"}
							</span>
						</td>
						<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
							<div className="flex justify-center space-x-2">
								<button
									onClick={() =>
										handleVerifyQuestion(questionId, true)
									}
									disabled={
										question.verified || question.rejected || updatingQuestion
									}
									className={`p-1 rounded-full ${
										question.verified
											? "bg-green-100 text-green-700"
											: "hover:bg-green-100 text-gray-500 hover:text-green-700"
									}`}
									title={
										t("topicDetail.verify") || "Verificar"
									}
									aria-label="Verificar pregunta"
								>
									<svg
										className="w-6 h-6"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M5 13l4 4L19 7"
										/>
									</svg>
								</button>
								<button
									onClick={() =>
										handleVerifyQuestion(questionId, false)
									}
									disabled={
										question.verified || question.rejected || updatingQuestion
									}
									className={`p-1 rounded-full ${
										question.rejected
											? "bg-red-100 text-red-700"
											: "hover:bg-red-100 text-gray-500 hover:text-red-700"
									}`}
									title={
										t("topicDetail.reject") || "Rechazar"
									}
									aria-label="Rechazar pregunta"
								>
									<svg
										className="w-6 h-6"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</div>
						</td>
					</tr>
					{isExpanded && renderQuestionDetails(question)}
				</>
			);
		},
		[
			selectedQuestions,
			expandAllQuestions,
			showQuestionDetails,
			t,
			handleSelectQuestion,
			handleToggleDetails,
			handleVerifyQuestion,
		]
	);

	/**
	 * Renderiza los detalles de una pregunta
	 */
	const renderQuestionDetails = useCallback((question: Question) => {
		console.log('[QuestionsTab] Renderizando detalles de pregunta:', {
			text: question.text,
			choices: question.choices,
			choicesCount: question.choices?.length,
			firstChoice: question.choices?.[0],
			choicesType: typeof question.choices?.[0],
			answer: (question as any).answer // Para detectar formato quiz
		});
		
		// Detectar si choices está en formato quiz (array de strings) o manager (objetos)
		let processedChoices: Choice[] = [];
		
		if (question.choices && Array.isArray(question.choices)) {
			if (question.choices.length > 0) {
				// Verificar si es formato quiz (strings) o manager (objetos)
				if (typeof question.choices[0] === 'string') {
					// Formato quiz: convertir a formato manager
					const answerIndex = (question as any).answer || 0;
					processedChoices = question.choices.map((choiceText: string, index: number) => ({
						text: choiceText,
						isCorrect: index === answerIndex
					}));
					console.log('[QuestionsTab] Convertido de formato quiz a manager:', processedChoices);
				} else {
					// Ya está en formato manager
					processedChoices = question.choices as Choice[];
					console.log('[QuestionsTab] Ya en formato manager:', processedChoices);
				}
			}
		}
		
		return (
			<tr className="bg-gray-50">
				<td colSpan={6} className="px-6 py-4">
					<div className="text-sm text-gray-800">
						{processedChoices && processedChoices.length > 0 ? (
							<div className="space-y-2">
								<h4 className="font-medium">Opciones:</h4>
								<ul className="ml-4 space-y-1">
									{processedChoices.map((choice, index) => (
										<li
											key={index}
											className={`flex items-start ${
												choice.isCorrect
													? "text-green-700 font-medium"
													: ""
											}`}
										>
											<span
												className={`mr-2 ${
													choice.isCorrect
														? "text-green-600"
														: "text-gray-400"
												}`}
											>
												{choice.isCorrect ? (
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
															d="M5 13l4 4L19 7"
														/>
													</svg>
												) : (
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
															d="M6 18L18 6M6 6l12 12"
														/>
													</svg>
												)}
											</span>
											{choice.text}
										</li>
									))}
								</ul>
								{question.explanation && (
									<div className="mt-3 pt-3 border-t border-gray-200">
										<h4 className="font-medium mb-2">Explicación:</h4>
										<p className="text-gray-700">{question.explanation}</p>
									</div>
								)}
							</div>
						) : (
							<div>
								<h4 className="font-medium mb-2">
									Pregunta sin opciones de respuesta definidas
								</h4>
								<p className="text-gray-600">
									Tipo: {question.type || 'No especificado'}
								</p>
								{question.explanation && (
									<div className="mt-3">
										<h4 className="font-medium mb-2">Explicación:</h4>
										<p className="text-gray-700">{question.explanation}</p>
									</div>
								)}
							</div>
						)}
					</div>
				</td>
			</tr>
		);
	}, []);

	/**
	 * Renderiza el modal de generación de cuestionario
	 */
	const renderGenerateQuestionnaireModal = useCallback(() => {
		if (!showGenerateModal) return null;

		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
				<div className="bg-white rounded-lg p-6 w-full max-w-md">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-xl font-semibold">
							{t("topicDetail.generateQuestionnaire") ||
								"Generar cuestionario"}
						</h2>
						<button
							onClick={() => setShowGenerateModal(false)}
							className="text-gray-500 hover:text-gray-700"
							disabled={generatingQuestionnaire}
							aria-label="Cerrar"
						>
							<svg
								className="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>

					<p className="mb-4 text-sm text-gray-600">
						{t("topicDetail.selectedQuestionsCount", {
							count: selectedQuestions.length,
						}) ||
							`Preguntas seleccionadas: ${selectedQuestions.length}`}
					</p>

					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleGenerateQuestionnaire(
								generationTitle,
								generationDescription
							);
						}}
					>
						<div className="mb-4">
							<label
								htmlFor="generationTitle"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								{t("topicDetail.title") || "Título"}
							</label>
							<input
								type="text"
								id="generationTitle"
								value={generationTitle}
								onChange={(e) =>
									setGenerationTitle(e.target.value)
								}
								className="w-full p-2 border rounded-md"
								required
								disabled={generatingQuestionnaire}
							/>
						</div>

						<div className="mb-6">
							<label
								htmlFor="generationDescription"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								{t("topicDetail.description") || "Descripción"}
							</label>
							<textarea
								id="generationDescription"
								value={generationDescription}
								onChange={(e) =>
									setGenerationDescription(e.target.value)
								}
								className="w-full p-2 border rounded-md h-32"
								disabled={generatingQuestionnaire}
							/>
						</div>

						<div className="flex justify-end space-x-2">
							<button
								type="button"
								onClick={() => setShowGenerateModal(false)}
								className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
								disabled={generatingQuestionnaire}
							>
								{t("topicDetail.cancel") || "Cancelar"}
							</button>
							<button
								type="submit"
								disabled={
									generatingQuestionnaire ||
									!generationTitle.trim() ||
									selectedQuestions.length === 0
								}
								className="px-4 py-2 bg-green-600 text-white rounded-md disabled:opacity-50 flex items-center"
							>
								{generatingQuestionnaire ? (
									<>
										<svg
											className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												className="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="4"
											></circle>
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											></path>
										</svg>
										{t("common.processing") ||
											"Procesando..."}
									</>
								) : (
									t("topicDetail.generate") || "Generar"
								)}
							</button>
						</div>
					</form>
				</div>
			</div>
		);
	}, [
		showGenerateModal,
		generationTitle,
		generationDescription,
		selectedQuestions.length,
		generatingQuestionnaire,
		t,
		handleGenerateQuestionnaire,
	]);

	/**
	 * Renderiza los controles de paginación
	 */
	const renderPagination = useCallback(() => {
		if (totalPages <= 1) return null;

		const pages = [];
		const maxVisiblePages = 5;
		let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
		let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

		// Ajustar startPage si endPage es menor que maxVisiblePages
		if (endPage - startPage + 1 < maxVisiblePages) {
			startPage = Math.max(1, endPage - maxVisiblePages + 1);
		}

		// Botón "Primera página"
		if (startPage > 1) {
			pages.push(
				<button
					key="first"
					onClick={() => handlePageChange(1)}
					className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50"
					aria-label="Primera página"
				>
					«
				</button>
			);
		}

		// Botón "Anterior"
		pages.push(
			<button
				key="prev"
				onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
				disabled={currentPage === 1}
				className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
				aria-label="Página anterior"
			>
				‹
			</button>
		);

		// Páginas numeradas
		for (let i = startPage; i <= endPage; i++) {
			pages.push(
				<button
					key={i}
					onClick={() => handlePageChange(i)}
					className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
						i === currentPage
							? 'bg-blue-50 border-blue-500 text-blue-600'
							: 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
					}`}
					aria-label={`Página ${i}`}
					aria-current={i === currentPage ? 'page' : undefined}
				>
					{i}
				</button>
			);
		}

		// Botón "Siguiente"
		pages.push(
			<button
				key="next"
				onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
				disabled={currentPage === totalPages}
				className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
				aria-label="Página siguiente"
			>
				›
			</button>
		);

		// Botón "Última página"
		if (endPage < totalPages) {
			pages.push(
				<button
					key="last"
					onClick={() => handlePageChange(totalPages)}
					className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50"
					aria-label="Última página"
				>
					»
				</button>
			);
		}

		return (
			<div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
				<div className="flex-1 flex justify-between sm:hidden">
					{/* Versión móvil */}
					<button
						onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
						disabled={currentPage === 1}
						className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Anterior
					</button>
					<button
						onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
						disabled={currentPage === totalPages}
						className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Siguiente
					</button>
				</div>
				<div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
					<div>
						<p className="text-sm text-gray-700">
							Mostrando <span className="font-medium">{showingStart}</span> al{' '}
							<span className="font-medium">{showingEnd}</span> de{' '}
							<span className="font-medium">{filteredQuestions.length}</span> preguntas
						</p>
					</div>
					<div>
						<nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Paginación">
							{pages}
						</nav>
					</div>
				</div>
			</div>
		);
	}, [currentPage, totalPages, filteredQuestions.length, showingStart, showingEnd, handlePageChange]);

	return (
		<div>
			{/* Mensajes de estado y feedback */}
			{generationStatus && (
				<div className={`mb-4 p-3 rounded-md ${
					generationStatus.includes('❌') 
						? 'bg-red-100 text-red-700 border border-red-300' 
						: generationStatus.includes('✅')
						? 'bg-green-100 text-green-700 border border-green-300'
						: 'bg-blue-100 text-blue-700 border border-blue-300'
				}`}>
					<div className="flex items-center">
						{generationStatus.includes('❌') ? (
							<svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
							</svg>
						) : generationStatus.includes('✅') ? (
							<svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
							</svg>
						) : (
							<svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
							</svg>
						)}
						{generationStatus}
					</div>
				</div>
			)}

			<div className="flex items-center justify-between mb-4">
				<div className="flex-1">
					<SearchBar
						placeholder={
							t("topicDetail.searchQuestionsPlaceholder") ||
							"Buscar preguntas..."
						}
						onSearch={handleSearch}
					/>
				</div>

				<div className="flex space-x-2 items-center">
					{/* Indicador de preguntas seleccionadas */}
					{selectedQuestions.length > 0 && (
						<div className="flex items-center space-x-2">
							<div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
								{selectedQuestions.length} pregunta{selectedQuestions.length !== 1 ? 's' : ''} seleccionada{selectedQuestions.length !== 1 ? 's' : ''}
							</div>
							<button
								onClick={() => {
									setSelectedQuestions([]);
									setSelectAll(false);
								}}
								className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded text-sm"
								title="Deseleccionar todas"
							>
								✕
							</button>
						</div>
					)}
					{renderActionButtons()}
					{renderGenerateNewQuestionsButton()}
				</div>
			</div>

			{/* Filtros y controles */}
			<div className="flex justify-between items-center mb-4">
				<QuestionStatusFilter
					currentFilter={statusFilter}
					onFilterChange={handleStatusFilterChange}
				/>

				<button
					onClick={toggleExpandAllQuestions}
					className="flex items-center text-gray-700 hover:text-blue-600"
					aria-label={
						expandAllQuestions ? "Contraer todas" : "Expandir todas"
					}
				>
					<svg
						className="w-5 h-5 mr-1"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						{expandAllQuestions ? (
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M5 15l7-7 7 7"
							/>
						) : (
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M19 9l-7 7-7-7"
							/>
						)}
					</svg>
					{expandAllQuestions
						? t("topicDetail.collapseAll") || "Contraer todas"
						: t("topicDetail.expandAll") || "Expandir todas"}
				</button>
			</div>

			<div className="bg-white shadow overflow-hidden rounded-md">
				{loading ? (
					<div className="flex justify-center my-8">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
					</div>
				) : error ? (
					<div className="p-4 bg-red-100 text-red-700">
						{t("topicDetail.errorLoadingQuestions") ||
							"Error al cargar las preguntas"}
					</div>
				) : filteredQuestions.length === 0 ? (
					<div className="text-center py-8 text-gray-500">
						<p>
							{t("topicDetail.noQuestionsFound") ||
								"No se encontraron preguntas"}
						</p>
					</div>
				) : (
					<>
						{renderQuestionsTable()}
						{renderPagination()}
					</>
				)}
			</div>

			{/* Modal para generar cuestionario */}
			{renderGenerateQuestionnaireModal()}

			{/* Modal para generar nuevas preguntas */}
			<GenerateQuestionsModal
				isOpen={showGenerateQuestionsModal}
				onClose={() => setShowGenerateQuestionsModal(false)}
				onGenerate={handleGenerateNewQuestions}
				isLoading={generatingNewQuestions}
				subtopics={topic?.subtopics || []}
			/>
		</div>
	);
};

export default QuestionsTab;
