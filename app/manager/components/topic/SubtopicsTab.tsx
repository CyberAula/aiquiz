// /app/manager/components/topic/SubtopicsTab.tsx
import { useState, useCallback, useEffect } from "react";
import { useManagerTranslation } from "../../hooks/useManagerTranslation";
import { Subtopic } from "../../contexts/TopicContext";
import SearchBar from "../subject/SearchBar";

interface SubtopicsTabProps {
	topicId: string;
	subjectId: string;
	subtopics: Subtopic[];
	handleAddSubtopic: () => void;
	isLoading?: boolean;
}

/**
 * Componente de pestaña para gestionar subtemas
 */
const SubtopicsTab: React.FC<SubtopicsTabProps> = ({
	topicId,
	subjectId,
	subtopics = [],
	handleAddSubtopic,
	isLoading = false,
}) => {
	const { t } = useManagerTranslation();
	const [filteredSubtopics, setFilteredSubtopics] =
		useState<Subtopic[]>(subtopics);

	/**
	 * Actualiza los subtemas filtrados cuando cambian los subtemas originales
	 */
	useEffect(() => {
		setFilteredSubtopics(subtopics);
	}, [subtopics]);

	/**
	 * Maneja la búsqueda de subtemas
	 */
	const handleSearch = useCallback(
		(query: string) => {
			if (!query) {
				setFilteredSubtopics(subtopics);
				return;
			}

			const queryLower = query.toLowerCase();
			const filtered = subtopics.filter(
				(subtopic) =>
					subtopic.title.toLowerCase().includes(queryLower) ||
					(subtopic.description?.toLowerCase() || "").includes(
						queryLower
					)
			);
			setFilteredSubtopics(filtered);
		},
		[subtopics]
	);

	/**
	 * Renderiza el botón de añadir subtema
	 */
	const renderAddButton = useCallback((): JSX.Element => {
		return (
			<button
				onClick={handleAddSubtopic}
				className="ml-4 bg-gray-800 text-white py-2 px-4 rounded-md flex items-center disabled:opacity-50"
				disabled={isLoading}
				aria-label="Añadir subtema"
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
						{t("common.adding")}
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
								d="M12 4v16m8-8H4"
							/>
						</svg>
						{t("topicDetail.newSubtopic")}
					</>
				)}
			</button>
		);
	}, [handleAddSubtopic, isLoading, t]);

	/**
	 * Renderiza un subtema individual
	 */
	const renderSubtopic = useCallback(
		(subtopic: Subtopic): JSX.Element => {
			return (
				<li key={subtopic.id} className="hover:bg-gray-50">
					<div className="px-6 py-4">
						<div>
							<h3 className="text-lg font-medium text-gray-900">
								{subtopic.title}
							</h3>
							<p className="text-gray-600 mt-1 max-w-2xl">
								{subtopic.description}
							</p>
						</div>
						<div className="mt-3">
							<a
								href={`/manager/subjects/${subjectId}/topics/${topicId}/subtopics/${subtopic.id}`}
								className="text-blue-600 hover:text-blue-800 flex items-center w-fit"
								aria-label={`Ver detalles de ${subtopic.title}`}
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
										d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
									/>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
									/>
								</svg>
								{t("topicDetail.viewDetails")}
							</a>
						</div>
					</div>
				</li>
			);
		},
		[subjectId, topicId, t]
	);

	return (
		<div>
			<div className="flex items-center mb-4">
				<SearchBar
					placeholder={
						t("topicDetail.searchSubtopicsPlaceholder") ||
						"Buscar subtemas..."
					}
					onSearch={handleSearch}
				/>

				{renderAddButton()}
			</div>

			{filteredSubtopics.length === 0 ? (
				<div className="text-center py-8 text-gray-500">
					<p>
						{t("topicDetail.noSubtopicsFound") ||
							"No se encontraron subtemas"}
					</p>
				</div>
			) : (
				<div className="bg-white shadow overflow-hidden rounded-md">
					<ul className="divide-y divide-gray-200">
						{filteredSubtopics.map(renderSubtopic)}
					</ul>
				</div>
			)}
		</div>
	);
};

export default SubtopicsTab;
