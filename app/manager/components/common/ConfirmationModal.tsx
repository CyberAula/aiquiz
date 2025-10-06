// /app/manager/components/common/ConfirmationModal.tsx
import { useManagerTranslation } from "../../hooks/useManagerTranslation";

interface ConfirmationModalProps {
	isOpen: boolean;
	title: string;
	message: string;
	confirmButtonText?: string;
	cancelButtonText?: string;
	onConfirm: () => void;
	onCancel: () => void;
	isLoading?: boolean;
	isDanger?: boolean;
}

/**
 * Modal de confirmación reutilizable para acciones importantes
 */
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
	isOpen,
	title,
	message,
	confirmButtonText,
	cancelButtonText,
	onConfirm,
	onCancel,
	isLoading = false,
	isDanger = true,
}) => {
	const { t } = useManagerTranslation();

	// No renderizar nada si el modal no está abierto
	if (!isOpen) return null;

	// Determinar clases para el botón de confirmación
	const confirmButtonClassName = `px-4 py-2 ${
		isDanger
			? "bg-red-600 hover:bg-red-700 text-white"
			: "bg-gray-800 hover:bg-gray-700 text-white"
	} rounded-md disabled:opacity-50 flex items-center`;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 w-full max-w-md">
				<div className="flex justify-between items-center mb-4">
					<h2
						className={`text-xl font-semibold ${
							isDanger ? "text-red-600" : "text-gray-900"
						}`}
					>
						{title}
					</h2>
					<button
						onClick={onCancel}
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

				<p className="text-gray-700 mb-6">{message}</p>

				<div className="flex justify-end space-x-2">
					<button
						type="button"
						onClick={onCancel}
						className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
						disabled={isLoading}
					>
						{cancelButtonText || t("common.cancel") || "Cancelar"}
					</button>
					<button
						type="button"
						onClick={onConfirm}
						disabled={isLoading}
						className={confirmButtonClassName}
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
							confirmButtonText ||
							t("common.confirm") ||
							"Confirmar"
						)}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmationModal;
