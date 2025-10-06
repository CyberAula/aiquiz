// /app/manager/components/topic/InformationTab.tsx
import { useCallback } from "react";
import { useManagerTranslation } from "../../hooks/useManagerTranslation";
import { Topic } from "../../contexts/TopicContext";

interface InformationTabProps {
	topic: Topic;
	editMode: boolean;
	editedTopic: Topic;
	onEditToggle: () => void;
	onInputChange: (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => void;
	onSaveChanges: () => void;
	isLoading?: boolean;
}

/**
 * Componente de pestaña de información general de un tema
 */
const InformationTab: React.FC<InformationTabProps> = ({
	topic,
	editMode,
	editedTopic,
	onEditToggle,
	onInputChange,
	onSaveChanges,
	isLoading = false,
}) => {
	const { t } = useManagerTranslation();

	/**
	 * Renderiza los botones de acción según el modo edición
	 */
	const renderActionButtons = useCallback((): JSX.Element => {
		if (editMode) {
			return (
				<div className="flex gap-4 mb-6">
					<button
						className="bg-gray-800 text-white py-2 px-4 rounded-md flex items-center disabled:opacity-50"
						onClick={onSaveChanges}
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
								{t("common.saving")}
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
										d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
									/>
								</svg>
								{t("topicDetail.saveChanges")}
							</>
						)}
					</button>

					<button
						className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md disabled:opacity-50"
						onClick={onEditToggle}
						disabled={isLoading}
					>
						{t("topicDetail.cancel")}
					</button>
				</div>
			);
		} else {
			return (
				<div className="mb-6">
					<button
						className="bg-gray-800 text-white py-2 px-4 rounded-md flex items-center"
						onClick={onEditToggle}
						aria-label="Editar tema"
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
								d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
							/>
						</svg>
						{t("topicDetail.editTopic")}
					</button>
				</div>
			);
		}
	}, [editMode, isLoading, onSaveChanges, onEditToggle, t]);

	/**
	 * Renderiza un campo de formulario según el modo
	 */
	const renderField = useCallback(
		(
			label: string,
			name: string,
			value: string,
			isTextArea: boolean = false
		): JSX.Element => {
			return (
				<div className="mb-6">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						{label}
					</label>
					{editMode ? (
						isTextArea ? (
							<textarea
								name={name}
								value={value}
								onChange={onInputChange}
								className="w-full p-2 border rounded-md h-32"
								disabled={isLoading}
							/>
						) : (
							<input
								type="text"
								name={name}
								value={value}
								onChange={onInputChange}
								className="w-full p-2 border rounded-md"
								disabled={isLoading}
							/>
						)
					) : (
						<div className="p-2 bg-gray-100 rounded-md">
							{value}
						</div>
					)}
				</div>
			);
		},
		[editMode, isLoading, onInputChange]
	);

	return (
		<div>
			{renderActionButtons()}

			<div className="bg-white shadow rounded-lg overflow-hidden">
				<div className="p-6">
					{renderField(
						t("topicDetail.name") || "Nombre",
						"title",
						editMode ? editedTopic.title : topic.title
					)}

					{renderField(
						t("topicDetail.subject") || "Asignatura",
						"subjectTitle",
						topic.subjectTitle
					)}

					{renderField(
						t("topicDetail.description") || "Descripción",
						"description",
						editMode ? editedTopic.description : topic.description,
						true
					)}

					{renderField(
						t("topicDetail.subtopicsCount") || "Número de subtemas",
						"subtopicsCount",
						topic.subtopics
							? topic.subtopics.length.toString()
							: "0"
					)}
				</div>
			</div>
		</div>
	);
};

export default InformationTab;
