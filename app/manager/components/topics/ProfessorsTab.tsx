// /app/manager/components/subject/ProfessorsTab.tsx
import { useTranslation } from "react-i18next";

interface Professor {
	id: string;
	name: string;
	email: string;
}

interface ProfessorsTabProps {
	professors: Professor[];
	onRemoveProfessor: (professorId: string) => void;
}

const ProfessorsTab = ({
	professors,
	onRemoveProfessor,
}: ProfessorsTabProps) => {
	const { t } = useTranslation();

	return (
		<div>
			{/* Lista de profesores */}
			<h3 className="text-lg font-medium mb-4">
				{t("subjectDetail.professors")}
			</h3>

			{professors.length === 0 ? (
				<p className="text-gray-500 italic">
					{t("subjectDetail.noProfessors")}
				</p>
			) : (
				professors.map((professor) => (
					<div
						key={professor.id}
						className="flex items-center justify-between p-4 border-b last:border-b-0"
					>
						<div className="flex-grow">
							<div className="font-medium">{professor.name}</div>
							<div className="text-gray-600">
								{professor.email}
							</div>
						</div>

						<div className="flex items-center">
							<button
								className="text-red-500 hover:text-red-700"
								title={t("subjectDetail.delete")}
								onClick={() => onRemoveProfessor(professor.id)}
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
										d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
									/>
								</svg>
							</button>
						</div>
					</div>
				))
			)}
		</div>
	);
};

export default ProfessorsTab;
