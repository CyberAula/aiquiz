// /app/manager/account/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AccountLayout({
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
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
			</div>
		);
	}

	return <div className="min-h-screen bg-gray-50">{children}</div>;
}
