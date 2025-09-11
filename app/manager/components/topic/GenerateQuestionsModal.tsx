// /app/manager/components/topic/GenerateQuestionsModal.tsx
import { useState, useCallback } from "react";
import { useManagerTranslation } from "../../hooks/useManagerTranslation";

interface Subtopic {
	_id: string;
	title: string;
	description?: string;
}

interface GenerateQuestionsModalProps {
	isOpen: boolean;
	onClose: () => void;
	onGenerate: (difficulty: string, count: number, subtopicId?: string) => void;
	isLoading?: boolean;
	subtopics?: Subtopic[];
}

/**
 * Modal para generar preguntas automáticamente
 */
const GenerateQuestionsModal: React.FC<GenerateQuestionsModalProps> = ({
	isOpen,
	onClose,
	onGenerate,
	isLoading = false,
	subtopics = [],
}) => {
	const { t } = useManagerTranslation();

	// Estados para el formulario
	const [difficulty, setDifficulty] = useState<string>("Fácil");
	const [count, setCount] = useState<number>(10);
	const [selectedSubtopic, setSelectedSubtopic] = useState<string>("");

	/**
	 * Maneja el cambio de dificultad
	 */
	const handleDifficultyChange = useCallback((difficulty: string) => {
		setDifficulty(difficulty);
	}, []);

	/**
	 * Maneja el cambio en el número de preguntas
	 */
	const handleCountChange = useCallback((count: number) => {
		setCount(count);
	}, []);

	/**
	 * Maneja el cambio de subtema
	 */
	const handleSubtopicChange = useCallback((subtopicId: string) => {
		setSelectedSubtopic(subtopicId);
	}, []);

	/**
	 * Inicia la generación de preguntas
	 */
	const handleGenerate = useCallback(() => {
		onGenerate(difficulty, count, selectedSubtopic || undefined);
	}, [difficulty, count, selectedSubtopic, onGenerate]);

	// No renderizar nada si el modal no está abierto
	if (!isOpen) return null;

	/**
	 * Genera la clase para el botón de dificultad
	 */
	const getDifficultyButtonClass = (value: string): string => {
		if (value === "Fácil") {
			return `px-4 py-2 rounded-md flex items-center w-full ${
				difficulty === "Fácil"
					? "bg-green-100 text-green-800 border border-green-300"
					: "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
			}`;
		} else if (value === "Medio") {
			return `px-4 py-2 rounded-md flex items-center w-full ${
				difficulty === "Medio"
					? "bg-yellow-100 text-yellow-800 border border-yellow-300"
					: "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
			}`;
		} else {
			return `px-4 py-2 rounded-md flex items-center w-full ${
				difficulty === "Avanzado"
					? "bg-red-100 text-red-800 border border-red-300"
					: "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
			}`;
		}
	};

	/**
	 * Genera la clase para el indicador de dificultad
	 */
	const getIndicatorClass = (value: string): string => {
		if (value === "Fácil") {
			return `w-3 h-3 rounded-full ${
				difficulty === "Fácil" ? "bg-green-500" : "bg-gray-300"
			} mr-2`;
		} else if (value === "Medio") {
			return `w-3 h-3 rounded-full ${
				difficulty === "Medio" ? "bg-yellow-500" : "bg-gray-300"
			} mr-2`;
		} else {
			return `w-3 h-3 rounded-full ${
				difficulty === "Avanzado" ? "bg-red-500" : "bg-gray-300"
			} mr-2`;
		}
	};

	/**
	 * Genera la clase para el botón de cantidad
	 */
	const getCountButtonClass = (value: number): string => {
		return `flex-1 py-2 px-4 rounded-full ${
			count === value
				? "bg-indigo-100 text-indigo-700 border-2 border-indigo-500"
				: "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
		}`;
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 w-full max-w-xl">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-semibold">
						{t("topicDetail.generateQuestionsTitle") ||
							"Generar preguntas"}
					</h2>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700"
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

				{/* Selector de subtema */}
				{subtopics.length > 0 && (
					<div className="mb-6">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							{t("topicDetail.subtopic") || "Subtema (opcional)"}
						</label>
						<select
							value={selectedSubtopic}
							onChange={(e) => handleSubtopicChange(e.target.value)}
							className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							disabled={isLoading}
						>
							<option value="">
								{t("topicDetail.allSubtopics") || "Todos los subtemas"}
							</option>
							{subtopics.map((subtopic) => (
								<option key={subtopic._id} value={subtopic._id}>
									{subtopic.title}
								</option>
							))}
						</select>
					</div>
				)}

				<div className="mb-6">
					<label className="block text-sm font-medium text-gray-700 mb-2">
						{t("topicDetail.difficulty") || "Dificultad"}
					</label>
					<div className="flex flex-wrap md:flex-nowrap gap-2">
						<button
							className={getDifficultyButtonClass("Fácil")}
							onClick={() => handleDifficultyChange("Fácil")}
							aria-label="Dificultad fácil"
							disabled={isLoading}
						>
							<div className={getIndicatorClass("Fácil")}></div>
							{t("topicDetail.easy") || "Fácil"}
						</button>
						<button
							className={getDifficultyButtonClass("Medio")}
							onClick={() => handleDifficultyChange("Medio")}
							aria-label="Dificultad intermedia"
							disabled={isLoading}
						>
							<div
								className={getIndicatorClass("Medio")}
							></div>
							{t("topicDetail.intermediate") || "Medio"}
						</button>
						<button
							className={getDifficultyButtonClass("Avanzado")}
							onClick={() => handleDifficultyChange("Avanzado")}
							aria-label="Dificultad avanzada"
							disabled={isLoading}
						>
							<div
								className={getIndicatorClass("Avanzado")}
							></div>
							{t("topicDetail.advanced") || "Avanzado"}
						</button>
					</div>
				</div>

				<div className="mb-6">
					<label className="block text-sm font-medium text-gray-700 mb-2">
						{t("topicDetail.numberOfQuestions") ||
							"Número de preguntas"}
					</label>
					<div className="flex justify-between gap-2">
						{[5, 10, 15, 20].map((num) => (
							<button
								key={num}
								className={getCountButtonClass(num)}
								onClick={() => handleCountChange(num)}
								aria-label={`${num} preguntas`}
								disabled={isLoading}
							>
								{num}
							</button>
						))}
					</div>
				</div>

				<div className="flex justify-end">
					<button
						className="bg-gray-800 text-white py-2 px-4 rounded-md flex items-center disabled:opacity-50"
						onClick={handleGenerate}
						disabled={isLoading}
						aria-label="Generar preguntas"
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
								{t("common.processing") || "Procesando..."}
							</>
						) : (
							t("topicDetail.generateQuestions") ||
							"Generar preguntas"
						)}
					</button>
				</div>
			</div>
		</div>
	);
};

export default GenerateQuestionsModal;
