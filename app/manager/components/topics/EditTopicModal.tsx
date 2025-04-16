// /app/manager/components/subject/EditTopicModal.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface EditTopicModalProps {
	topic: {
		id: string;
		title: string;
	};
	onClose: () => void;
	onSave: (topicId: string, newTitle: string) => void;
}

const EditTopicModal = ({ topic, onClose, onSave }: EditTopicModalProps) => {
	const { t } = useTranslation();
	const [title, setTitle] = useState(topic.title);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) return;

		setIsSubmitting(true);
		onSave(topic.id, title);
		// Close is handled by parent
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 w-full max-w-md">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-semibold">
						{t("subjectDetail.editTopic")}
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
					<div className="mb-6">
						<label
							htmlFor="topicTitle"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							{t("subjectDetail.name")}
						</label>
						<input
							type="text"
							id="topicTitle"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
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
							disabled={isSubmitting || !title.trim()}
							className="px-4 py-2 bg-gray-800 text-white rounded-md disabled:opacity-50"
						>
							{t("subjectDetail.saveChanges")}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default EditTopicModal;
