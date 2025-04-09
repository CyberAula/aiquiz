"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function SwaggerPage() {
	const [spec, setSpec] = useState(null);

	useEffect(() => {
		async function fetchSpec() {
			const response = await fetch("/api/swagger");
			const data = await response.json();
			setSpec(data);
		}

		fetchSpec();
	}, []);

	return (
		<div className="container-layout">
			<Header />
			<div className="container-content">
				<h1 className="text-2xl font-bold mb-4">API Documentation</h1>
				{spec ? (
					<SwaggerUI spec={spec} />
				) : (
					<p>Loading API documentation...</p>
				)}
			</div>
			<Footer />
		</div>
	);
}
