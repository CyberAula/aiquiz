// /app/manager/subjects/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useManagerTranslation } from "../hooks/useManagerTranslation";
import Link from "next/link";
import SubjectCard, {
	SubjectCardProps,
} from "../components/subject/SubjectCard";
import useApiRequest from "../hooks/useApiRequest";
import { LoadingSpinner, FadeIn } from "../components/common/AnimatedComponents";

interface Professor {
	id?: string;
	_id?: string;
	name?: string;
	email?: string;
}

interface Subject extends SubjectCardProps {
	professors?: Professor[];
}

interface CurrentUser {
	id: string;
	role?: string;
	email?: string;
}

export default function SubjectsPage() {
	const { t } = useManagerTranslation();

	const { data, loading: isLoading, error } = useApiRequest(
		"/aiquiz/api/manager/subjects",
		"GET",
		[],
		true
	);

	const subjects = useMemo<Subject[]>(() => {
		if (!Array.isArray(data)) {
			return [];
		}

		return data as Subject[];
	}, [data]);

	const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
	const [isUserLoading, setIsUserLoading] = useState(true);
	const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);

	useEffect(() => {
		if (typeof window === "undefined") {
			setIsUserLoading(false);
			return;
		}

		let resolvedUser: CurrentUser | null = null;

		try {
			const storedUser = window.localStorage.getItem("user_data");

			if (storedUser) {
				const parsedUser = JSON.parse(storedUser);
				resolvedUser = {
					id:
						parsedUser?.id ||
						parsedUser?._id ||
						parsedUser?.userId ||
						"",
					role: parsedUser?.role || "professor",
					email: parsedUser?.email || "",
				};
			} else {
				const token = window.localStorage.getItem("jwt_token");

				if (token) {
					const [, payloadSegment] = token.split(".");

					if (payloadSegment) {
						const payload = JSON.parse(
							window.atob(payloadSegment)
						);

						resolvedUser = {
							id:
								payload?.userId ||
								payload?.id ||
								payload?.sub ||
								"",
							role: payload?.role || "professor",
							email:
								payload?.email ||
								payload?.userEmail ||
								"",
						};
					}
				}
			}
		} catch (userError) {
			console.error("Error obteniendo el usuario actual:", userError);
			resolvedUser = null;
		} finally {
			setCurrentUser(resolvedUser && resolvedUser.id ? resolvedUser : null);
			setIsUserLoading(false);
		}
	}, []);

	useEffect(() => {
		if (isUserLoading) {
			return;
		}

		if (!currentUser) {
			setFilteredSubjects([]);
			return;
		}

		const userRole = currentUser.role?.toLowerCase();

		if (userRole && userRole !== "professor") {
			setFilteredSubjects(subjects);
			return;
		}

		const filtered = subjects.filter((subject) => {
			const subjectProfessors = subject.professors || [];
			const currentUserEmail = currentUser.email
				? currentUser.email.toLowerCase()
				: "";

			return subjectProfessors.some((professor) => {
				const professorId = professor.id || professor._id;
				const matchesId =
					Boolean(professorId) &&
					professorId === currentUser.id;

				const professorEmail = professor.email
					? professor.email.toLowerCase()
					: "";
				const matchesEmail =
					Boolean(professorEmail) &&
					Boolean(currentUserEmail) &&
					professorEmail === currentUserEmail;

				return matchesId || matchesEmail;
			});
		});

		setFilteredSubjects(filtered);
	}, [subjects, currentUser, isUserLoading]);

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold">
					{t("subjects.mySubjects")}
				</h1>
				<Link
					href="/manager/subjects/new"
					className="bg-gray-800 text-white px-4 py-2 rounded-md flex items-center"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="mr-2"
					>
						<line x1="12" y1="5" x2="12" y2="19"></line>
						<line x1="5" y1="12" x2="19" y2="12"></line>
					</svg>
					{t("subjects.newSubject")}
				</Link>
			</div>

			{isLoading || isUserLoading ? (
				<div className="flex justify-center items-center h-64">
					<LoadingSpinner size="xl" />
				</div>
			) : error ? (
				<div className="text-center py-8 text-red-500">
					<p>{t("errors.loadSubjects")}</p>
				</div>
			) : filteredSubjects.length === 0 ? (
				<div className="text-center py-8 text-gray-500">
					<p>
						{t("subjects.noAssignedSubjects") ||
							"No tienes asignaturas asignadas."}
					</p>
				</div>
			) : (
				<FadeIn>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredSubjects.map((subject, index) => (
							<FadeIn key={subject.id} delay={index * 100}>
								<SubjectCard
									id={subject.id}
									title={subject.title}
									description={subject.description}
									administrator={subject.administrator}
									topics={subject.topics}
								/>
							</FadeIn>
						))}
					</div>
				</FadeIn>
			)}
		</div>
	);
}