// /app/manager/components/subject/ProfessorsTab.tsx
import { useManagerTranslation } from "../../hooks/useManagerTranslation";

interface Professor {
	id: string;
	name: string;
	email: string;
	role?: string;
}

interface ProfessorsTabProps {
	professors: Professor[];
	administrators: Professor[];
	currentUser: { role: string; id: string } | null;
	onRemoveProfessor: (professorId: string) => void;
	isLoading?: boolean;
}

/**
 * Componente de pestaña para gestionar profesores de una asignatura
 */
const ProfessorsTab: React.FC<ProfessorsTabProps> = ({
	professors,
	administrators,
	currentUser,
	onRemoveProfessor,
	isLoading = false,
}) => {
	const { t } = useManagerTranslation();

	/**
	 * Verifica si un profesor puede ser eliminado
	 */
	const canRemoveProfessor = (professorId: string): boolean => {
		// Solo los administradores pueden eliminar profesores
		if (currentUser?.role !== 'admin') {
			return false;
		}

		// Los administradores de la asignatura no pueden ser eliminados
		const isAdministrator = administrators.some(admin => 
			(admin.id || admin._id) === professorId
		);
		
		return !isAdministrator;
	};

	/**
	 * Verifica si un usuario es administrador de la asignatura
	 */
	const isProfessorAdmin = (professorId: string): boolean => {
		return administrators.some(admin => 
			(admin.id || admin._id) === professorId
		);
	};

	/**
	 * Renderiza el botón de eliminar profesor
	 */
	const renderDeleteButton = (professorId: string): JSX.Element => {
		const canRemove = canRemoveProfessor(professorId);
		const isAdmin = isProfessorAdmin(professorId);

		if (!canRemove) {
			if (isAdmin) {
				return (
					<span className="text-gray-400 text-sm flex items-center">
						<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						Administrador
					</span>
				);
			}
			return null; // No mostrar botón si no tiene permisos
		}
		return (
			<button
				className="text-red-500 hover:text-red-700 disabled:opacity-50 flex items-center"
				title={t("subjectDetail.delete")}
				onClick={() => onRemoveProfessor(professorId)}
				disabled={isLoading}
				aria-label="Eliminar profesor"
			>
				{isLoading ? (
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
		);
	};

	// Renderizar mensaje si no hay profesores
	if (professors.length === 0) {
		return (
			<div className="text-center py-6">
				<p className="text-gray-500 italic">
					{t("subjectDetail.noProfessors")}
				</p>
			</div>
		);
	}

	return (
		<div>
			<h3 className="text-lg font-medium mb-4">
				{t("subjectDetail.professors")}
			</h3>

			<div className="divide-y divide-gray-200">
				{(professors || []).map((professor, index) => (
					<div
						key={professor.id || professor._id || `professor-${index}`}
						className="flex items-center justify-between p-4 border-b last:border-b-0"
					>
						<div className="flex-grow">
							<div className="font-medium">{professor.name}</div>
							<div className="text-gray-600">
								{professor.email}
							</div>
						</div>

						<div className="flex items-center">
							{renderDeleteButton(professor.id || professor._id)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default ProfessorsTab;
