// /app/manager/components/topic/EditSubtopicModal.tsx
import { useState, useEffect, useCallback } from "react";
import { useManagerTranslation } from "../../hooks/useManagerTranslation";
import { Subtopic } from "../../contexts/TopicContext";

interface EditSubtopicModalProps {
	subtopic: Subtopic;
	onClose: () => void;
	onSave: (subtopicId: string, title: string, description: string) => void;
	isLoading?: boolean;
}

/**
 * Modal para editar un subtema existente
 */
const EditSubtopicModal: React.FC<EditSubtopicModalProps> = ({
	subtopic,
	onClose,
	onSave,
	isLoading = false,
}) => {
	const { t } = useManagerTranslation();

	// Estado unificado para el formulario
	const [formData, setFormData] = useState({
		title: subtopic.title,
		description: subtopic.description || "",
	});

	/**
	 * Actualiza el formulario cuando cambia el subtema
	 */
	useEffect(() => {
		setFormData({
			title: subtopic.title,
			description: subtopic.description || "",
		});
	}, [subtopic]);

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
	 * Maneja el envío del formulario
	 */
	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			if (!formData.title.trim()) return;

			onSave(subtopic.id, formData.title, formData.description);
		},
		[subtopic.id, formData, onSave]
	);

	/**
	 * Verifica si el formulario es válido
	 */
	const isFormValid = (): boolean => {
		return Boolean(formData.title.trim());
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 w-full max-w-md">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-semibold">
						{t("topicDetail.editSubtopic") || "Editar subtema"}
					</h2>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700"
						disabled={isLoading}
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

				<form onSubmit={handleSubmit}>
					<div className="mb-4">
						<label
							htmlFor="title"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							{t("topicDetail.name") || "Nombre"}
						</label>
						<input
							type="text"
							id="title"
							name="title"
							value={formData.title}
							onChange={handleInputChange}
							className="w-full p-2 border rounded-md"
							required
							disabled={isLoading}
						/>
					</div>

					<div className="mb-6">
						<label
							htmlFor="description"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							{t("topicDetail.description") || "Descripción"}
						</label>
						<textarea
							id="description"
							name="description"
							value={formData.description}
							onChange={handleInputChange}
							className="w-full p-2 border rounded-md h-32"
							disabled={isLoading}
						/>
					</div>

					<div className="flex justify-end space-x-2">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
							disabled={isLoading}
						>
							{t("topicDetail.cancel") || "Cancelar"}
						</button>
						<button
							type="submit"
							disabled={isLoading || !isFormValid()}
							className="px-4 py-2 bg-gray-800 text-white rounded-md disabled:opacity-50 flex items-center"
						>
							{isLoading ? (
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
									{t("common.processing") || "Procesando..."}
								</>
							) : (
								t("topicDetail.saveChanges") ||
								"Guardar cambios"
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default EditSubtopicModal;
