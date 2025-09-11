"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";
import "./swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { 
	ssr: false,
	loading: () => <div className="flex justify-center items-center py-8">Cargando Swagger UI...</div>
});

export default function SwaggerPage() {
	const [spec, setSpec] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		async function fetchSpec() {
			try {
				const response = await fetch("/api/manager/swagger");
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const data = await response.json();
				setSpec(data);
			} catch (err) {
				setError(err.message);
				console.error("Error fetching Swagger spec:", err);
			} finally {
				setLoading(false);
			}
		}

		fetchSpec();
	}, []);

	if (loading) {
		return (
			<div className="container-layout">
				<Header />
				<div className="container-content">
					<div className="text-center py-12">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
						<p className="text-gray-600">Cargando documentación de la API...</p>
					</div>
				</div>
				<Footer />
			</div>
		);
	}

	if (error) {
		return (
			<div className="container-layout">
				<Header />
				<div className="container-content">
					<div className="text-center py-12">
						<div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
							<div className="text-red-500 text-4xl mb-4">⚠️</div>
							<h2 className="text-xl font-semibold text-red-800 mb-2">Error al cargar Swagger</h2>
							<p className="text-red-600 mb-4">No se pudo cargar la documentación de la API</p>
							<p className="text-sm text-red-500 mb-4">Error: {error}</p>
							<button
								onClick={() => window.location.reload()}
								className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
							>
								Reintentar
							</button>
							<div className="mt-4 text-sm text-gray-600">
								<p>Asegúrate de que el servidor esté ejecutándose:</p>
								<code className="bg-gray-100 px-2 py-1 rounded text-xs">npm run dev</code>
							</div>
						</div>
					</div>
				</div>
				<Footer />
			</div>
		);
	}

	return (
		<div className="container-layout">
			<Header />
			<div className="container-content">
				<div className="mb-6">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">AIQuiz Manager API</h1>
					<p className="text-gray-600">Documentación completa de la API del gestor de AIQuiz</p>
					<div className="mt-4 flex items-center space-x-4">
						<span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
							API Real Activa
						</span>
						<span className="text-sm text-gray-500">v1.0.0</span>
						<a
							href="/manager"
							className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
						>
							← Volver al Manager
						</a>
					</div>
				</div>
				
				<div className="swagger-container bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					
					{spec && (
						<SwaggerUI
							spec={spec}
							deepLinking={true}
							displayRequestDuration={true}
							defaultModelsExpandDepth={2}
							defaultModelExpandDepth={2}
							docExpansion="list"
							filter={true}
							showExtensions={true}
							showCommonExtensions={true}
							tryItOutEnabled={true}
							requestInterceptor={(req) => {
								// Añadir token de autenticación si existe
								const token = localStorage.getItem('auth_token');
								if (token) {
									req.headers.Authorization = `Bearer ${token}`;
								}
								return req;
							}}
							responseInterceptor={(res) => {
								// Log de respuestas para debugging
								console.log('Swagger API Response:', res);
								return res;
							}}
							onComplete={() => {
								console.log('Swagger UI loaded successfully for AIQuiz Manager API');
							}}
						/>
					)}
				</div>
			</div>
			<Footer />
		</div>
	);
}
