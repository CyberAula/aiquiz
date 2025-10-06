// /app/manager/components/subject/InviteModal.tsx
import { useState, useCallback } from "react";
import { useManagerTranslation } from "../../hooks/useManagerTranslation";

interface InviteModalProps {
	onClose: () => void;
	onInvite: (name: string, email: string) => void;
	isLoading?: boolean;
}

/**
 * Modal para invitar a un profesor a una asignatura
 */
const InviteModal: React.FC<InviteModalProps> = ({
	onClose,
	onInvite,
	isLoading = false,
}) => {
	const { t } = useManagerTranslation();

	// Estado unificado para el formulario
	const [formData, setFormData] = useState({
		name: "",
		email: "",
	});

	/**
	 * Maneja los cambios en los campos del formulario
	 */
	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
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

			const { name, email } = formData;
			if (!name || !email) return;

			onInvite(name, email);
		},
		[formData, onInvite]
	);

	/**
	 * Verifica si el formulario es válido
	 */
	const isFormValid = (): boolean => {
		return Boolean(formData.name.trim() && formData.email.trim());
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 w-full max-w-md">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-semibold">
						{t("subjectDetail.inviteProfessor")}
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
							htmlFor="name"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							{t("subjectDetail.name")}
						</label>
						<input
							type="text"
							id="name"
							name="name"
							value={formData.name}
							onChange={handleInputChange}
							placeholder={t("subjectDetail.namePlaceholder")}
							className="w-full p-2 border rounded-md"
							required
							disabled={isLoading}
						/>
					</div>

					<div className="mb-6">
						<label
							htmlFor="email"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							{t("subjectDetail.email")}
						</label>
						<input
							type="email"
							id="email"
							name="email"
							value={formData.email}
							onChange={handleInputChange}
							placeholder={t("subjectDetail.emailPlaceholder")}
							className="w-full p-2 border rounded-md"
							required
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
							{t("subjectDetail.cancel")}
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
									{t("common.processing")}
								</>
							) : (
								t("subjectDetail.invite")
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default InviteModal;
