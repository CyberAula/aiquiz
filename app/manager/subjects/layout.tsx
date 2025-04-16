// /app/manager/subjects/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Header from "../components/common/Header";

export default function SubjectsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const pathname = usePathname();

	// Comprobar si estamos en una página de detalle de asignatura
	const pathParts = pathname.split("/");
	const isDetailPage =
		pathParts.length > 3 &&
		pathParts[1] === "manager" &&
		pathParts[2] === "subjects";

	useEffect(() => {
		// Comprobar si el usuario está autenticado
		const token = localStorage.getItem("jwt_token");

		if (!token) {
			router.push("/manager/login");
		}
	}, [router]);

	// Si estamos en una página de detalle, devolver directamente los hijos
	// ya que el layout específico de la página de detalle se encargará de la estructura
	if (isDetailPage) {
		return children;
	}

	// Para la página principal de asignaturas
	return (
		<div className="min-h-screen bg-gray-50">
			<Header />
			<main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
				{children}
			</main>
		</div>
	);
}
