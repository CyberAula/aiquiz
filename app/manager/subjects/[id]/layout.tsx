// /app/manager/subjects/[id]/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/common/Header";
import { SubjectProvider } from "../../contexts/SubjectContext";
import SubjectDetailSidebar from "../../components/common/SubjectDetailSidebar";
import { useSubject } from "../../contexts/SubjectContext";

// Contenido interno que usa el contexto de la asignatura
const SubjectLayoutContent = ({ children }: { children: React.ReactNode }) => {
	const { subject, loading } = useSubject();

	// Estado de carga inicial
	if (loading) {
		return (
			<div className="ml-0 md:ml-64 mt-16 w-full overflow-y-auto">
				<div className="flex justify-center items-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
				</div>
			</div>
		);
	}

	// Si no hay datos de la asignatura
	if (!subject) {
		return (
			<div className="ml-0 md:ml-64 mt-16 w-full overflow-y-auto">
				<div className="p-6 sm:p-8">
					<div className="text-center">
						<h2 className="text-xl font-semibold text-gray-700">
							Asignatura no encontrada
						</h2>
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			{/* Sidebar fijo en el lado izquierdo SIEMPRE visible */}
			<div className="fixed top-16 left-0 bottom-0 w-64 z-40 hidden md:block">
				<SubjectDetailSidebar
					subjectId={subject.id || subject._id}
					subjectTitle={subject.title}
					topics={subject.topics || []}
				/>
			</div>

			{/* Contenido principal con margen para la barra lateral */}
			<div className="ml-0 md:ml-64 mt-16 w-full overflow-y-auto">
				{children}
			</div>
		</>
	);
};

export default function SubjectDetailLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Comprobar si el usuario está autenticado
		const token = localStorage.getItem("jwt_token");
		if (!token) {
			router.push("/manager/login");
		} else {
			setIsLoading(false);
		}
	}, [router]);

	if (isLoading) {
		return (
			<div className="flex h-screen overflow-hidden bg-gray-50">
				<div className="fixed top-0 left-0 right-0 z-50">
					<Header />
				</div>
				<div className="ml-0 md:ml-64 mt-16 w-full overflow-y-auto">
					<div className="flex justify-center items-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-screen overflow-hidden bg-gray-50">
			{/* Header fijo en la parte superior */}
			<div className="fixed top-0 left-0 right-0 z-50">
				<Header />
			</div>

			{/* Contenido con el provider de contexto */}
			<SubjectProvider>
				<SubjectLayoutContent>{children}</SubjectLayoutContent>
			</SubjectProvider>
		</div>
	);
}
