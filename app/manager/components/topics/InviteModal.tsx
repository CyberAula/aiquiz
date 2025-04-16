// /app/manager/components/subject/InviteModal.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface InviteModalProps {
	onClose: () => void;
	onInvite: (name: string, email: string) => void;
}

const InviteModal = ({ onClose, onInvite }: InviteModalProps) => {
	const { t } = useTranslation();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name || !email) return;

		setIsSubmitting(true);
		onInvite(name, email);

		// Reset form and close modal (handled by parent component)
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
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder={t("subjectDetail.namePlaceholder")}
							className="w-full p-2 border rounded-md"
							required
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
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder={t("subjectDetail.emailPlaceholder")}
							className="w-full p-2 border rounded-md"
							required
						/>
					</div>

					<div className="flex justify-end space-x-2">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
						>
							{t("subjectDetail.cancel")}
						</button>
						<button
							type="submit"
							disabled={isSubmitting || !name || !email}
							className="px-4 py-2 bg-gray-800 text-white rounded-md disabled:opacity-50"
						>
							{t("subjectDetail.invite")}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default InviteModal;
