// /app/manager/components/topic/QuestionnarieTab.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useManagerTranslation } from "../../hooks/useManagerTranslation";
import useApiRequest from "../../hooks/useApiRequest";
import SearchBar from "../subject/SearchBar";
import { ConfirmationModal } from "../common";

interface Questionnaire {
	_id: string;
	id: string;
	title: string;
	description: string;
	questions: number;
	createdAt: string;
	downloadCount: number;
}

interface QuestionnaireTabProps {
	topicId: string;
	subjectId: string;
}

/**
 * Componente de pestaña para gestionar cuestionarios
 */
const QuestionnaireTab: React.FC<QuestionnaireTabProps> = ({
	topicId,
	subjectId,
}) => {
	const { t } = useManagerTranslation();

	// Estados para UI
	const [filteredQuestionnaires, setFilteredQuestionnaires] = useState<
		Questionnaire[]
	>([]);
	const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<
		string | null
	>(null);
	const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
	const [questionnaireToDelete, setQuestionnaireToDelete] =
		useState<string>("");
	const [showFormatOptions, setShowFormatOptions] = useState<string | null>(
		null
	);
	const [dropdownPosition, setDropdownPosition] = useState<{
		top: number;
		left: number;
	} | null>(null);
	const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

	// API para obtener cuestionarios
	const {
		data: questionnaires,
		loading,
		error,
		makeRequest: fetchQuestionnaires,
	} = useApiRequest(
		`/api/manager/subjects/${subjectId}/topics/${topicId}/questionnaires`,
		"GET",
		null,
		true
	);

	// API para eliminar cuestionario
	const { makeRequest: deleteQuestionnaire, loading: deletingQuestionnaire } =
		useApiRequest("", "DELETE", null, false);

	// API para descargar cuestionario
	const {
		makeRequest: downloadQuestionnaire,
		loading: downloadingQuestionnaire,
	} = useApiRequest("", "GET", null, false);

	/**
	 * Actualiza los cuestionarios filtrados cuando cambian los cuestionarios originales
	 */
	useEffect(() => {
		console.log('[QuestionnarieTab] Datos recibidos:', questionnaires);
		
		if (questionnaires) {
			// La API devuelve {success: true, questionnaires: [...]}
			const questionnairesList = questionnaires.questionnaires || questionnaires;
			console.log('[QuestionnarieTab] Lista de cuestionarios:', questionnairesList);
			
			if (Array.isArray(questionnairesList)) {
				setFilteredQuestionnaires(questionnairesList);
			} else {
				console.warn('[QuestionnarieTab] Los datos no son un array:', questionnairesList);
				setFilteredQuestionnaires([]);
			}
		}
	}, [questionnaires]);

	/**
	 * Cierra el dropdown en scroll o resize
	 */
	useEffect(() => {
		const handleCloseDropdown = () => {
			if (showFormatOptions) {
				setShowFormatOptions(null);
				setDropdownPosition(null);
			}
		};

		if (showFormatOptions) {
			window.addEventListener('scroll', handleCloseDropdown, true);
			window.addEventListener('resize', handleCloseDropdown);

			return () => {
				window.removeEventListener('scroll', handleCloseDropdown, true);
				window.removeEventListener('resize', handleCloseDropdown);
			};
		}
	}, [showFormatOptions]);

	/**
	 * Maneja la búsqueda de cuestionarios
	 */
	const handleSearch = useCallback(
		(query: string) => {
			// Obtener la lista correcta de cuestionarios
			const questionnairesList = questionnaires?.questionnaires || questionnaires || [];
			
			if (!query) {
				setFilteredQuestionnaires(Array.isArray(questionnairesList) ? questionnairesList : []);
				return;
			}

			const queryLower = query.toLowerCase();
			const filtered = (Array.isArray(questionnairesList) ? questionnairesList : []).filter(
				(questionnaire) =>
					questionnaire.title.toLowerCase().includes(queryLower) ||
					(questionnaire.description && questionnaire.description.toLowerCase().includes(queryLower))
			);

			setFilteredQuestionnaires(filtered);
		},
		[questionnaires]
	);

	/**
	 * Solicita confirmación para eliminar un cuestionario
	 */
	const confirmDeleteQuestionnaire = useCallback((id: string) => {
		setQuestionnaireToDelete(id);
		setShowDeleteModal(true);
	}, []);

	/**
	 * Ejecuta la eliminación del cuestionario
	 */
	const handleDeleteQuestionnaire = useCallback(async () => {
		if (!questionnaireToDelete) return;

		try {
			setSelectedQuestionnaire(questionnaireToDelete);

			const response = await deleteQuestionnaire(
				null,
				false,
				`/api/manager/subjects/${subjectId}/topics/${topicId}/questionnaires/${questionnaireToDelete}`
			);

			if (response.success) {
				await fetchQuestionnaires();
			}
		} catch (error) {
			console.error("Error al eliminar cuestionario:", error);
		} finally {
			setSelectedQuestionnaire(null);
			setQuestionnaireToDelete("");
			setShowDeleteModal(false);
		}
	}, [
		questionnaireToDelete,
		deleteQuestionnaire,
		subjectId,
		topicId,
		fetchQuestionnaires,
	]);

	/**
	 * Alterna la visibilidad del menú de formatos de descarga
	 */
	const toggleFormatOptions = useCallback(
		(id: string) => {
			if (showFormatOptions === id) {
				setShowFormatOptions(null);
				setDropdownPosition(null);
			} else {
				setShowFormatOptions(id);
				
				// Calcular posición del dropdown
				const button = buttonRefs.current[id];
				if (button) {
					const rect = button.getBoundingClientRect();
					const scrollY = window.scrollY;
					const scrollX = window.scrollX;
					
					setDropdownPosition({
						top: rect.bottom + scrollY + 8, // 8px de margen
						left: rect.right + scrollX - 192 // 192px = w-48 (12rem)
					});
				}
			}
		},
		[showFormatOptions]
	);

	/**
	 * Descarga un cuestionario en el formato especificado
	 */
	const handleDownloadQuestionnaire = useCallback(
		async (id: string, format: string) => {
			try {
				setSelectedQuestionnaire(id);
				setShowFormatOptions(null);
				setDropdownPosition(null);

				console.log(`[QuestionnarieTab] Iniciando descarga cuestionario ${id} formato ${format}`);

				const endpoint = `/api/manager/subjects/${subjectId}/topics/${topicId}/questionnaires/${id}/download?format=${format}`;
				
				// Llamar al endpoint con manejo de descarga de archivos
				await downloadQuestionnaire(
					null,
					false, // false porque el endpoint se maneja por patrón
					endpoint
				);

				console.log(`[QuestionnarieTab] Descarga completada para cuestionario ${id}`);
			} catch (error) {
				console.error("Error al descargar cuestionario:", error);
			} finally {
				setSelectedQuestionnaire(null);
			}
		},
		[downloadQuestionnaire, subjectId, topicId]
	);

	/**
	 * Renderiza la tabla de cuestionarios
	 */
	const renderQuestionnairesTable = useCallback((): JSX.Element => {
		return (
			<div className="bg-white shadow rounded-md">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								{t("topicDetail.title") || "Título"}
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								{t("topicDetail.description") || "Descripción"}
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								{t("topicDetail.questions") || "Preguntas"}
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								{t("topicDetail.createdAt") ||
									"Fecha de creación"}
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								{t("topicDetail.downloads") || "Descargas"}
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								{t("topicDetail.actions") || "Acciones"}
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{(Array.isArray(filteredQuestionnaires) ? filteredQuestionnaires : []).map((questionnaire) => (
							<tr
								key={questionnaire.id}
								className="hover:bg-gray-50"
							>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-xs">
									{questionnaire.title}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">
									{questionnaire.description}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{questionnaire.questions}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{new Date(
										questionnaire.createdAt
									).toLocaleDateString()}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{questionnaire.downloadCount}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
									<div className="flex justify-end space-x-3">
										{renderFormatMenu(questionnaire)}
										{renderDeleteButton(questionnaire)}
									</div>
								</td>
							</tr>
						))}
					</tbody>
					</table>
				</div>
			</div>
		);
	}, [filteredQuestionnaires, showFormatOptions, selectedQuestionnaire, t]);

	/**
	 * Renderiza el menú de formatos de descarga
	 */
	const renderFormatMenu = useCallback(
		(questionnaire: Questionnaire): JSX.Element => {
			const isSelected =
				selectedQuestionnaire === questionnaire.id &&
				downloadingQuestionnaire;

			return (
				<>
					<button
						ref={(el) => {
							buttonRefs.current[questionnaire.id] = el;
						}}
						className="text-blue-600 hover:text-blue-900 flex items-center transition-colors duration-150"
						title={t("topicDetail.download") || "Descargar"}
						onClick={() => toggleFormatOptions(questionnaire.id)}
						disabled={isSelected}
						aria-label={`Descargar cuestionario ${questionnaire.title}`}
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
								d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
							/>
						</svg>
						<svg
							className={`w-4 h-4 ml-1 transition-transform duration-200 ${
								showFormatOptions === questionnaire.id
									? "rotate-180"
									: ""
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
				</>
			);
		},
		[
			showFormatOptions,
			selectedQuestionnaire,
			downloadingQuestionnaire,
			toggleFormatOptions,
			t,
		]
	);

	/**
	 * Renderiza el botón de eliminar cuestionario
	 */
	const renderDeleteButton = useCallback(
		(questionnaire: Questionnaire): JSX.Element => {
			const isDeleting =
				selectedQuestionnaire === questionnaire.id &&
				deletingQuestionnaire;

			return (
				<button
					onClick={() => confirmDeleteQuestionnaire(questionnaire.id)}
					className="text-red-600 hover:text-red-900"
					title={t("topicDetail.delete") || "Eliminar"}
					disabled={isDeleting}
					aria-label={`Eliminar cuestionario ${questionnaire.title}`}
				>
					{isDeleting ? (
						<svg
							className="animate-spin w-5 h-5"
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
								d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
							/>
						</svg>
					)}
				</button>
			);
		},
		[
			selectedQuestionnaire,
			deletingQuestionnaire,
			confirmDeleteQuestionnaire,
			t,
		]
	);

	return (
		<div>
			<div className="flex items-center mb-4">
				<SearchBar
					placeholder={
						t("topicDetail.searchQuestionnairesPlaceholder") ||
						"Buscar cuestionarios..."
					}
					onSearch={handleSearch}
				/>
			</div>

			{loading ? (
				<div className="flex justify-center my-8">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
				</div>
			) : error ? (
				<div className="bg-red-100 p-4 rounded-md text-red-700">
					{t("topicDetail.errorLoadingQuestionnaires") ||
						"Error al cargar los cuestionarios"}
				</div>
			) : (!Array.isArray(filteredQuestionnaires) || filteredQuestionnaires.length === 0) ? (
				<div className="text-center py-8 text-gray-500">
					<p>
						{t("topicDetail.noQuestionnairesFound") ||
							"No se encontraron cuestionarios"}
					</p>
				</div>
			) : (
				renderQuestionnairesTable()
			)}

			{/* Modal de confirmación para eliminar cuestionario */}
			<ConfirmationModal
				isOpen={showDeleteModal}
				title={
					t("confirmation.deleteQuestionnaire.title") ||
					"Eliminar cuestionario"
				}
				message={
					t("confirmation.deleteQuestionnaire.message") ||
					"¿Estás seguro de que deseas eliminar este cuestionario? Esta acción no se puede deshacer."
				}
				confirmButtonText={t("common.delete") || "Eliminar"}
				onConfirm={handleDeleteQuestionnaire}
				onCancel={() => setShowDeleteModal(false)}
				isLoading={deletingQuestionnaire}
				isDanger={true}
			/>

			{/* Dropdown flotante para opciones de descarga */}
			{showFormatOptions && dropdownPosition && (
				<>
					{/* Overlay para cerrar el dropdown al hacer click fuera */}
					<div
						className="fixed inset-0 z-40"
						onClick={() => {
							setShowFormatOptions(null);
							setDropdownPosition(null);
						}}
					/>
					{/* Dropdown menu flotante */}
					<div
						className="fixed w-48 bg-white rounded-md shadow-xl border border-gray-200 py-1 z-50 transform transition-all duration-200 ease-out"
						style={{
							top: `${dropdownPosition.top}px`,
							left: `${dropdownPosition.left}px`,
						}}
					>
						<button
							onClick={() =>
								handleDownloadQuestionnaire(
									showFormatOptions,
									"pdf"
								)
							}
							className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
							disabled={selectedQuestionnaire === showFormatOptions && downloadingQuestionnaire}
						>
							<svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
							</svg>
							{t("topicDetail.pdf") || "PDF"}
						</button>
						<button
							onClick={() =>
								handleDownloadQuestionnaire(
									showFormatOptions,
									"moodle"
								)
							}
							className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
							disabled={selectedQuestionnaire === showFormatOptions && downloadingQuestionnaire}
						>
							<svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
							{t("topicDetail.moodle") || "Moodle XML"}
						</button>
					</div>
				</>
			)}
		</div>
	);
};

export default QuestionnaireTab;
