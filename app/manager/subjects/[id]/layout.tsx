// /app/manager/subjects/[id]/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import SubjectDetailSidebar from "../../components/topics/SubjectDetailSidebar";
import Header from "../../components/common/Header";
import subjectData from "../../data/subject-details.json";

export default function SubjectDetailLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const params = useParams();
	const subjectId = params.id as string;

	const [loading, setLoading] = useState(true);
	const [subject, setSubject] = useState<any>(null);

	useEffect(() => {
		// Comprobar si el usuario está autenticado
		const token = localStorage.getItem("jwt_token");

		if (!token) {
			router.push("/manager/login");
			return;
		}

		// Cargar datos de la asignatura para la sidebar
		const fetchSubjectData = async () => {
			try {
				// TODO: Reemplazar con llamada real a la API cuando esté implementada
				// const response = await fetch(`/api/subjects/${subjectId}`, {
				//   headers: {
				//     'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
				//   }
				// });
				// const data = await response.json();

				console.log(
					`📤 Simulando petición GET a /api/subjects/${subjectId} (para sidebar)`
				);

				// Simular retardo de red
				setTimeout(() => {
					console.log(`📥 Respuesta simulada recibida para sidebar`);
					setSubject(subjectData);
					setLoading(false);
				}, 300);
			} catch (error) {
				console.error(
					"Error fetching subject data for sidebar:",
					error
				);
				setLoading(false);
			}
		};

		fetchSubjectData();
	}, [router, subjectId]);

	return (
		<div className="flex h-screen overflow-hidden bg-gray-50">
			{/* Header fijo en la parte superior */}
			<div className="fixed top-0 left-0 right-0 z-50">
				<Header />
			</div>

			{/* Sidebar fijo en el lado izquierdo */}
			<div className="fixed top-16 left-0 bottom-0 w-64 z-40">
				{loading ? (
					<div className="bg-white border-r border-gray-200 h-full">
						<div className="p-6 animate-pulse">
							<div className="h-6 bg-gray-200 rounded w-3/4 mb-6"></div>
							<div className="space-y-4">
								<div className="h-4 bg-gray-200 rounded w-full"></div>
								<div className="h-4 bg-gray-200 rounded w-5/6"></div>
								<div className="h-4 bg-gray-200 rounded w-4/6"></div>
							</div>
						</div>
					</div>
				) : (
					<SubjectDetailSidebar
						subjectId={subjectId}
						subjectTitle={subject.title}
						topics={subject.topics}
					/>
				)}
			</div>

			{/* Contenido principal con scroll */}
			<div className="ml-64 mt-16 w-full overflow-y-auto">
				<main className="flex-1 h-full">{children}</main>
			</div>
		</div>
	);
}
