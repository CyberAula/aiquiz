// /app/manager/components/subject/SettingsTab.tsx
import { useState, useCallback } from "react";
import { useManagerTranslation } from "../../hooks/useManagerTranslation";
import { useRouter } from "next/navigation";
import { Subject, Topic } from "../../contexts/SubjectContext";

interface SettingsTabProps {
	subject: Subject;
	editMode: boolean;
	editedSubject: Subject;
	onEditToggle: () => void;
	onInputChange: (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => void;
	onSaveChanges: () => void;
	onEditTopic: (topicId: string, newTitle: string) => void;
	onDeleteTopic: (topicId: string) => void;
	onDeleteSubject: () => void;
	isLoading?: boolean;
	isDeletingTopic?: boolean;
}

/**
 * Componente de pestaña para ajustes de una asignatura
 */
const SettingsTab: React.FC<SettingsTabProps> = ({
	subject,
	editMode,
	editedSubject,
	onEditToggle,
	onInputChange,
	onSaveChanges,
	onEditTopic,
	onDeleteTopic,
	onDeleteSubject,
	isLoading = false,
	isDeletingTopic = false,
}) => {
	const { t } = useManagerTranslation();
	const router = useRouter();

	// Estados para edición de temas
	const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
	const [editingTopicTitle, setEditingTopicTitle] = useState<string>("");

	/**
	 * Prepara el tema para su edición
	 */
	const handleStartEditTopic = useCallback((topic: Topic) => {
		setEditingTopicId(topic.id);
		setEditingTopicTitle(topic.title);
	}, []);

	/**
	 * Guarda los cambios en el tema
	 */
	const handleSaveTopicEdit = useCallback(() => {
		if (editingTopicId && editingTopicTitle.trim()) {
			onEditTopic(editingTopicId, editingTopicTitle);
			setEditingTopicId(null);
			setEditingTopicTitle("");
		}
	}, [editingTopicId, editingTopicTitle, onEditTopic]);

	/**
	 * Cancela la edición del tema
	 */
	const handleCancelTopicEdit = useCallback(() => {
		setEditingTopicId(null);
		setEditingTopicTitle("");
	}, []);

	/**
	 * Renderiza los botones de acción del modo edición
	 */
	const renderEditButtons = (): JSX.Element => {
		return (
			<div className="flex gap-4 mb-6">
				<button
					className="bg-gray-800 text-white py-2 px-4 rounded-md flex items-center disabled:opacity-50"
					onClick={onSaveChanges}
					disabled={isLoading}
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
							{t("subjectDetail.saveChanges")}
						</>
					)}
				</button>

				<button
					className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md disabled:opacity-50"
					onClick={onEditToggle}
					disabled={isLoading}
				>
					{t("subjectDetail.cancel")}
				</button>
			</div>
		);
	};

	/**
	 * Renderiza el botón de editar
	 */
	const renderEditButton = (): JSX.Element => {
		return (
			<div className="mb-6">
				<button
					className="bg-gray-800 text-white py-2 px-4 rounded-md flex items-center"
					onClick={onEditToggle}
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
					{t("subjectDetail.editSubject")}
				</button>
			</div>
		);
	};

	/**
	 * Renderiza el campo de título
	 */
	const renderTitleField = (): JSX.Element => {
		return (
			<div className="mb-6">
				<label className="block text-sm font-medium text-gray-700 mb-1">
					{t("subjectDetail.name")}
				</label>
				{editMode ? (
					<input
						type="text"
						name="title"
						value={editedSubject.title}
						onChange={onInputChange}
						className="w-full p-2 border rounded-md"
						disabled={isLoading}
					/>
				) : (
					<div className="p-2 bg-gray-100 rounded-md">
						{subject.title}
					</div>
				)}
			</div>
		);
	};

	/**
	 * Renderiza el campo de siglas
	 */
	const renderAcronymField = (): JSX.Element => {
		return (
			<div className="mb-6">
				<label className="block text-sm font-medium text-gray-700 mb-1">
					{t("subjectDetail.acronym")}
				</label>
				{editMode ? (
					<input
						type="text"
						name="acronym"
						value={editedSubject.acronym}
						onChange={onInputChange}
						className="w-full p-2 border rounded-md"
						disabled={isLoading}
					/>
				) : (
					<div className="p-2 bg-gray-100 rounded-md">
						{subject.acronym}
					</div>
				)}
			</div>
		);
	};

	/**
	 * Renderiza el campo de descripción
	 */
	const renderDescriptionField = (): JSX.Element => {
		return (
			<div className="mb-6">
				<label className="block text-sm font-medium text-gray-700 mb-1">
					{t("subjectDetail.description")}
				</label>
				{editMode ? (
					<textarea
						name="description"
						value={editedSubject.description}
						onChange={onInputChange}
						className="w-full p-2 border rounded-md h-32"
						disabled={isLoading}
					/>
				) : (
					<div className="p-2 bg-gray-100 rounded-md">
						{subject.description}
					</div>
				)}
			</div>
		);
	};

	/**
	 * Renderiza la lista de temas
	 */
	const renderTopicsList = (): JSX.Element => {
		return (
			<div className="mb-10">
				<h3 className="text-lg font-medium mb-2">
					{t("subjectDetail.topicsList")}
				</h3>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{(subject.topics || []).map((topic) => (
						<div
							key={topic.id}
							className="p-4 bg-gray-100 rounded-md"
						>
							{editingTopicId === topic.id ? (
								<div className="flex flex-col">
									<input
										type="text"
										value={editingTopicTitle}
										onChange={(e) =>
											setEditingTopicTitle(e.target.value)
										}
										className="w-full p-2 border rounded-md mb-2"
									/>
									<div className="flex justify-end space-x-2">
										<button
											onClick={handleSaveTopicEdit}
											className="text-green-600 hover:text-green-800"
										>
											{t("subjectDetail.save") ||
												"Guardar"}
										</button>
										<button
											onClick={handleCancelTopicEdit}
											className="text-gray-500 hover:text-gray-700"
										>
											{t("subjectDetail.cancel") ||
												"Cancelar"}
										</button>
									</div>
								</div>
							) : (
								<div className="flex justify-between items-center">
									<span>{topic.title}</span>
									{editMode && (
										<div className="flex">
											<button
												className="text-gray-600 hover:text-gray-800 mr-2 disabled:opacity-50"
												onClick={() =>
													handleStartEditTopic(topic)
												}
												disabled={isLoading}
												aria-label="Editar tema"
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
														d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
													/>
												</svg>
											</button>
											<button
												className="text-red-500 hover:text-red-700 disabled:opacity-50"
												onClick={() =>
													onDeleteTopic(topic.id)
												}
												disabled={
													isLoading || isDeletingTopic
												}
												aria-label="Eliminar tema"
											>
												{isDeletingTopic ? (
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
										</div>
									)}
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		);
	};

	/**
	 * Renderiza la sección para eliminar asignatura
	 */
	const renderDeleteSection = (): JSX.Element => {
		return (
			<div className="mt-16 p-6 bg-red-50 rounded-md border border-red-200">
				<h3 className="text-lg font-medium text-red-800 mb-2">
					{t("subjectDetail.deleteSubject")}
				</h3>
				<p className="text-red-700 mb-4">
					{t("subjectDetail.deleteWarning")}
				</p>
				<button
					className="bg-red-800 text-white py-2 px-4 rounded-md flex items-center disabled:opacity-50"
					onClick={onDeleteSubject}
					disabled={isLoading}
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
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
							{t("common.delete")}
						</>
					)}
				</button>
			</div>
		);
	};

	return (
		<div>
			{editMode ? renderEditButtons() : renderEditButton()}

			{renderTitleField()}
			{renderAcronymField()}
			{renderDescriptionField()}
			{renderTopicsList()}
			{renderDeleteSection()}
		</div>
	);
};

export default SettingsTab;
