// /app/manager/components/topic/QuestionStatusFilter.tsx
import { useCallback } from "react";
import { useManagerTranslation } from "../../hooks/useManagerTranslation";

export type StatusFilter = "all" | "unverified" | "verified" | "rejected";

interface QuestionStatusFilterProps {
	currentFilter: StatusFilter;
	onFilterChange: (filter: StatusFilter) => void;
}

/**
 * Componente para filtrar preguntas por estado
 */
const QuestionStatusFilter: React.FC<QuestionStatusFilterProps> = ({
	currentFilter,
	onFilterChange,
}) => {
	const { t } = useManagerTranslation();

	/**
	 * Determina la clase del botón según el filtro activo
	 */
	const getButtonClassName = useCallback(
		(filter: StatusFilter): string => {
			return `px-3 py-1 text-sm ${
				currentFilter === filter
					? "bg-gray-100 text-gray-900 font-medium"
					: "text-gray-700 hover:bg-gray-50"
			}`;
		},
		[currentFilter]
	);

	/**
	 * Maneja el cambio de filtro
	 */
	const handleFilterChange = useCallback(
		(filter: StatusFilter) => {
			onFilterChange(filter);
		},
		[onFilterChange]
	);

	return (
		<div className="flex space-x-2 items-center">
			<span className="text-sm font-medium text-gray-700">
				{t("topicDetail.filterByStatus") || "Filtrar por estado:"}
			</span>
			<div className="bg-white border border-gray-300 rounded-md flex divide-x">
				<button
					className={getButtonClassName("unverified")}
					onClick={() => handleFilterChange("unverified")}
					aria-label="Filtrar preguntas no verificadas"
				>
					{t("topicDetail.unverified") || "No verificadas"}
				</button>
				<button
					className={getButtonClassName("verified")}
					onClick={() => handleFilterChange("verified")}
					aria-label="Filtrar preguntas verificadas"
				>
					{t("topicDetail.verified") || "Verificadas"}
				</button>
				<button
					className={getButtonClassName("rejected")}
					onClick={() => handleFilterChange("rejected")}
					aria-label="Filtrar preguntas rechazadas"
				>
					{t("topicDetail.rejected") || "Rechazadas"}
				</button>
				<button
					className={getButtonClassName("all")}
					onClick={() => handleFilterChange("all")}
					aria-label="Mostrar todas las preguntas"
				>
					{t("topicDetail.allQuestions") || "Todas"}
				</button>
			</div>
		</div>
	);
};

export default QuestionStatusFilter;
