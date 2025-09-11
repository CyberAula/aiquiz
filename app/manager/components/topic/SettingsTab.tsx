// /app/manager/components/topic/SettingsTab.tsx
import { useState, useCallback, useEffect } from "react";
import { useManagerTranslation } from "../../hooks/useManagerTranslation";
import { Topic, Subtopic } from "../../contexts/TopicContext";
import { ConfirmationModal } from "../common";

interface SettingsTabProps {
	topic: Topic;
	onUpdateTopic: (title: string, description: string) => void;
	onDeleteSubtopic: (subtopicId: string) => void;
	isLoading?: boolean;
}

/**
 * Componente de pestaña para ajustes de un tema
 */
const SettingsTab: React.FC<SettingsTabProps> = ({
	topic,
	onUpdateTopic,
	onDeleteSubtopic,
	isLoading = false,
}) => {
	const { t } = useManagerTranslation();

	// Estados para edición del tema
	const [editMode, setEditMode] = useState(false);
	const [editedTitle, setEditedTitle] = useState(topic.title);
	const [editedDescription, setEditedDescription] = useState(topic.description || "");

	// Estados para el modal de confirmación
	const [showDeleteSubtopicModal, setShowDeleteSubtopicModal] =
		useState<boolean>(false);
	const [subtopicToDelete, setSubtopicToDelete] = useState<string>("");

	// Sincronizar con los props cuando cambie el tema
	useEffect(() => {
		setEditedTitle(topic.title);
		setEditedDescription(topic.description || "");
	}, [topic]);

	/**
	 * Maneja el guardado de cambios del tema
	 */
	const handleSave = useCallback(() => {
		onUpdateTopic(editedTitle, editedDescription);
		setEditMode(false);
	}, [editedTitle, editedDescription, onUpdateTopic]);

	/**
	 * Cancela la edición
	 */
	const handleCancel = useCallback(() => {
		setEditedTitle(topic.title);
		setEditedDescription(topic.description || "");
		setEditMode(false);
	}, [topic.title, topic.description]);

	/**
	 * Solicita confirmación para eliminar un subtema
	 */
	const confirmDeleteSubtopic = useCallback((subtopicId: string) => {
		setSubtopicToDelete(subtopicId);
		setShowDeleteSubtopicModal(true);
	}, []);

	/**
	 * Ejecuta la eliminación del subtema
	 */
	const handleDeleteSubtopic = useCallback(() => {
		if (subtopicToDelete) {
			onDeleteSubtopic(subtopicToDelete);
			setShowDeleteSubtopicModal(false);
			setSubtopicToDelete("");
		}
	}, [subtopicToDelete, onDeleteSubtopic]);

	/**
	 * Renderiza los botones de acción
	 */
	const renderActionButtons = useCallback(() => {
		if (editMode) {
			return (
				<div className="flex gap-3 mb-6">
					<button
						onClick={handleSave}
						disabled={isLoading || !editedTitle.trim()}
						className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
					>
						{isLoading ? (
							<>
								<svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								{t("common.saving") || "Guardando..."}
							</>
						) : (
							t("common.save") || "Guardar"
						)}
					</button>
					<button
						onClick={handleCancel}
						disabled={isLoading}
						className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50"
					>
						{t("common.cancel") || "Cancelar"}
					</button>
				</div>
			);
		} else {
			return (
				<div className="mb-6">
					<button
						onClick={() => setEditMode(true)}
						className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 flex items-center"
					>
						<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
						</svg>
						{t("topicDetail.editTopic") || "Editar tema"}
					</button>
				</div>
			);
		}
	}, [editMode, isLoading, editedTitle, handleSave, handleCancel, t]);

	/**
	 * Renderiza la lista de subtemas (solo lectura con opción de eliminar)
	 */
	const renderSubtopicsList = useCallback((): JSX.Element => {
		return (
			<div className="mb-10">
				<h3 className="text-lg font-medium mb-2">
					{t("topicDetail.subtopicsList") || "Lista de subtemas"} ({topic.subtopics?.length || 0})
				</h3>
				{(!topic.subtopics || topic.subtopics.length === 0) ? (
					<div className="p-4 bg-gray-50 rounded-md text-center text-gray-500">
						{t("topicDetail.noSubtopicsFound") || "No hay subtemas creados"}
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{topic.subtopics.map((subtopic) => (
							<div
								key={subtopic.id || subtopic._id}
								className="p-4 bg-gray-50 rounded-md border flex justify-between items-center"
							>
								<div className="flex-1">
									<div className="font-medium">{subtopic.title}</div>
									{subtopic.description && (
										<div className="text-sm text-gray-600 mt-1">
											{subtopic.description}
										</div>
									)}
								</div>
								<button
									className="text-red-500 hover:text-red-700 disabled:opacity-50 ml-2"
									onClick={() => confirmDeleteSubtopic(subtopic.id || subtopic._id)}
									disabled={isLoading}
									aria-label={`Eliminar subtema ${subtopic.title}`}
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
						))}
					</div>
				)}
			</div>
		);
	}, [topic.subtopics, isLoading, t, confirmDeleteSubtopic]);

	return (
		<div>
			{renderActionButtons()}

			<div className="bg-white shadow rounded-lg overflow-hidden">
				<div className="p-6">
					{/* Información del tema */}
					<div className="mb-8">
						<h2 className="text-xl font-semibold mb-4 text-gray-900">
							{t("topicDetail.information") || "Información del tema"}
						</h2>
						
						<div className="grid grid-cols-1 gap-4">
							{/* Nombre del tema */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									{t("topicDetail.name") || "Nombre"}
								</label>
								{editMode ? (
									<input
										type="text"
										value={editedTitle}
										onChange={(e) => setEditedTitle(e.target.value)}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										disabled={isLoading}
									/>
								) : (
									<div className="px-3 py-2 bg-gray-50 border rounded-md">
										{topic.title}
									</div>
								)}
							</div>

							{/* Descripción del tema */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									{t("topicDetail.description") || "Descripción"}
								</label>
								{editMode ? (
									<textarea
										value={editedDescription}
										onChange={(e) => setEditedDescription(e.target.value)}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										rows={3}
										disabled={isLoading}
									/>
								) : (
									<div className="px-3 py-2 bg-gray-50 border rounded-md">
										{topic.description || "Sin descripción"}
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Lista de subtemas */}
					{renderSubtopicsList()}
				</div>
			</div>

			{/* Modal de confirmación para eliminar subtema */}
			<ConfirmationModal
				isOpen={showDeleteSubtopicModal}
				title={
					t("confirmation.deleteSubtopic.title") || "Eliminar subtema"
				}
				message={
					t("confirmation.deleteSubtopic.message") ||
					"¿Estás seguro de que deseas eliminar este subtema? Esta acción no se puede deshacer."
				}
				confirmButtonText={t("common.delete") || "Eliminar"}
				onConfirm={handleDeleteSubtopic}
				onCancel={() => setShowDeleteSubtopicModal(false)}
				isLoading={isLoading}
				isDanger={true}
			/>
		</div>
	);
};

export default SettingsTab;
