// /app/manager/components/subtopic/SettingsTab.tsx
import { useState, useCallback } from "react";
import { useManagerTranslation } from "../../hooks/useManagerTranslation";
import { useRouter } from "next/navigation";
import { Subtopic } from "../../contexts/SubtopicContext";
import { ConfirmationModal } from "../common";

interface SettingsTabProps {
	subtopic: Subtopic;
	subjectId: string;
	topicId: string;
	onSaveChanges: (updatedSubtopic: Partial<Subtopic>) => void;
	onDeleteSubtopic: () => void;
	isLoading?: boolean;
}

/**
 * Componente de pestaña para ajustes de un subtema
 */
const SettingsTab: React.FC<SettingsTabProps> = ({
	subtopic,
	subjectId,
	topicId,
	onSaveChanges,
	onDeleteSubtopic,
	isLoading = false,
}) => {
	const { t } = useManagerTranslation();
	const router = useRouter();

	// Estados para UI
	const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
	const [editMode, setEditMode] = useState<boolean>(false);

	// Estados para formulario
	const [formData, setFormData] = useState({
		title: subtopic.title,
		description: subtopic.description || "",
	});

	/**
	 * Maneja los cambios en los campos del formulario
	 */
	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			const { name, value } = e.target;
			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		},
		[]
	);

	/**
	 * Activa o desactiva el modo edición
	 */
	const handleEditToggle = useCallback(() => {
		if (editMode) {
			// Si estamos saliendo del modo edición sin guardar, restauramos los valores originales
			setFormData({
				title: subtopic.title,
				description: subtopic.description || "",
			});
		}
		setEditMode((prev) => !prev);
	}, [editMode, subtopic]);

	/**
	 * Guarda los cambios en el subtema
	 */
	const handleSave = useCallback(() => {
		onSaveChanges(formData);
		setEditMode(false);
	}, [formData, onSaveChanges]);

	/**
	 * Muestra el modal de confirmación para eliminar
	 */
	const handleDeleteClick = useCallback(() => {
		setShowDeleteModal(true);
	}, []);

	/**
	 * Confirma la eliminación del subtema
	 */
	const handleConfirmDelete = useCallback(() => {
		onDeleteSubtopic();
		setShowDeleteModal(false);
	}, [onDeleteSubtopic]);

	/**
	 * Cierra el modal de confirmación
	 */
	const handleCancelDelete = useCallback(() => {
		setShowDeleteModal(false);
	}, []);

	/**
	 * Renderiza los botones de acción según el modo edición
	 */
	const renderActionButtons = (): JSX.Element => {
		if (editMode) {
			return (
				<div className="flex gap-4 mb-6">
					<button
						className="bg-blue-600 text-white py-2 px-4 rounded-md flex items-center disabled:opacity-50"
						onClick={handleSave}
						disabled={isLoading}
						aria-label="Guardar cambios"
					>
						{isLoading ? (
							<>
								<svg
									className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									aria-hidden="true"
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
								{t("common.saving") || "Guardando..."}
							</>
						) : (
							<>
								<svg
									className="w-5 h-5 mr-1"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M5 13l4 4L19 7"
									/>
								</svg>
								{t("subtopicDetail.saveChanges") ||
									"Guardar cambios"}
							</>
						)}
					</button>

					<button
						className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md disabled:opacity-50"
						onClick={handleEditToggle}
						disabled={isLoading}
						aria-label="Cancelar edición"
					>
						{t("subtopicDetail.cancel") || "Cancelar"}
					</button>
				</div>
			);
		} else {
			return (
				<div className="mb-6">
					<button
						className="bg-gray-800 text-white py-2 px-4 rounded-md flex items-center"
						onClick={handleEditToggle}
						aria-label="Editar subtema"
					>
						<svg
							className="w-5 h-5 mr-1"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
							/>
						</svg>
						{t("subtopicDetail.edit") || "Editar"}
					</button>
				</div>
			);
		}
	};

	/**
	 * Renderiza la sección para eliminar subtema
	 */
	const renderDeleteSection = (): JSX.Element => {
		return (
			<div className="mt-10 p-6 bg-red-50 rounded-md border border-red-200">
				<h3 className="text-lg font-medium text-red-800 mb-2">
					{t("subtopicDetail.deleteSubtopic") || "Eliminar subtema"}
				</h3>
				<p className="text-red-700 mb-4">
					{t("subtopicDetail.deleteWarning") ||
						"Esta acción no se puede deshacer"}
				</p>
				<button
					className="bg-red-600 text-white py-2 px-4 rounded-md flex items-center"
					onClick={handleDeleteClick}
					disabled={isLoading}
					aria-label="Eliminar subtema"
				>
					{isLoading ? (
						<>
							<svg
								className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								aria-hidden="true"
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
							{t("common.processing") || "Procesando..."}
						</>
					) : (
						<>
							<svg
								className="w-5 h-5 mr-1"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
							{t("common.delete") || "Eliminar"}
						</>
					)}
				</button>
			</div>
		);
	};

	return (
		<div>
			{renderActionButtons()}

			<div className="mb-6">
				<label className="block text-sm font-medium text-gray-700 mb-1">
					{t("subtopicDetail.name") || "Nombre"}
				</label>
				{editMode ? (
					<input
						type="text"
						name="title"
						value={formData.title}
						onChange={handleInputChange}
						className="w-full p-2 border rounded-md"
						disabled={isLoading}
					/>
				) : (
					<div className="p-2 bg-gray-100 rounded-md">
						{subtopic.title}
					</div>
				)}
			</div>

			<div className="mb-6">
				<label className="block text-sm font-medium text-gray-700 mb-1">
					{t("subtopicDetail.description") || "Descripción"}
				</label>
				{editMode ? (
					<textarea
						name="description"
						value={formData.description}
						onChange={handleInputChange}
						className="w-full p-2 border rounded-md h-32"
						disabled={isLoading}
					/>
				) : (
					<div className="p-2 bg-gray-100 rounded-md">
						{subtopic.description || (
							<span className="text-gray-500 italic">
								{t("subtopicDetail.noDescription") ||
									"Sin descripción"}
							</span>
						)}
					</div>
				)}
			</div>


			{renderDeleteSection()}

			{/* Modal de confirmación para eliminar subtema */}
			<ConfirmationModal
				isOpen={showDeleteModal}
				title={
					t("confirmation.deleteSubtopic.title") || "Eliminar subtema"
				}
				message={
					t("confirmation.deleteSubtopic.message") ||
					"¿Estás seguro de que deseas eliminar este subtema? Esta acción no se puede deshacer."
				}
				confirmButtonText={t("common.delete") || "Eliminar"}
				onConfirm={handleConfirmDelete}
				onCancel={handleCancelDelete}
				isLoading={isLoading}
				isDanger={true}
			/>
		</div>
	);
};

export default SettingsTab;
