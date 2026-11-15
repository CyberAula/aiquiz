"use client";

import { Fragment, useEffect, useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { useManagerTranslation } from "../../hooks/useManagerTranslation";
import CollapsibleSection from "./CollapsibleSection";

interface StatisticsInsightsProps {
    subjectAcronym: string;
    startDate: string;
    endDate: string;
    /** Cambia cada vez que el profesor pulsa "Actualizar" */
    refreshKey: number;
}

type Kpis = {
    totalGlobal: number;
    totalPeriodo: number;
    studentReportsPeriodo: number;
    evaluadasPeriodo: number;
};

type DifficultyRow = { label: string; total: number; correct: number; wrong: number; rate: number };
type MonthRow = { label: string; total: number };
type DayRow = { dia: string; count: number };
type StudentRow = { studentEmail: string; totalTests: number; totalCorrect: number };
type StudentDetail = { totalTests: number; totalCorrect: number; difficulty: number };

const API_BASE = "/aiquiz/api";
const STUDENTS_PREVIEW = 10;

const COLORS = {
    correct: "rgba(22, 163, 74, 0.95)",
    wrong: "rgba(220, 38, 38, 0.95)",
    activity: "rgba(79, 70, 229, 0.9)",
};

const authHeaders = (): Record<string, string> => {
    const token =
        (typeof window !== "undefined" &&
            (localStorage.getItem("jwt_token") || localStorage.getItem("auth_token"))) ||
        null;
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const percent = (part: number, total: number) => (total ? Math.round((part / total) * 100) : 0);

const StatisticsInsights = ({ subjectAcronym, startDate, endDate, refreshKey }: StatisticsInsightsProps) => {
    const { t: translate } = useManagerTranslation();
    const t = (key: string, options?: any): string => String(translate(key, options));
    const tr = (key: string, options?: any): string => t(`subjectDetail.statistics.insights.${key}`, options);

    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(false);

    const [kpis, setKpis] = useState<Kpis | null>(null);
    const [difficulty, setDifficulty] = useState<DifficultyRow[]>([]);
    const [monthly, setMonthly] = useState<MonthRow[]>([]);
    const [daily, setDaily] = useState<DayRow[]>([]);
    const [students, setStudents] = useState<StudentRow[]>([]);

    const [showAllStudents, setShowAllStudents] = useState(false);
    const [openStudent, setOpenStudent] = useState<string | null>(null);
    const [studentDetails, setStudentDetails] = useState<Record<string, StudentDetail | "loading" | "error">>({});

    useEffect(() => {
        let cancelled = false;

        const getJson = async (path: string, params: URLSearchParams) => {
            const response = await fetch(`${API_BASE}${path}?${params.toString()}`, {
                credentials: "include",
                headers: authHeaders(),
            });
            if (!response.ok) throw new Error(`${path}: ${response.status}`);
            return response.json();
        };

        const load = async () => {
            setLoading(true);
            setFailed(false);
            setOpenStudent(null);
            setStudentDetails({});

            const period = new URLSearchParams();
            if (subjectAcronym) period.append("asignatura", subjectAcronym);
            if (startDate) period.append("fechaInicio", startDate);
            if (endDate) period.append("fechaFin", endDate);

            // La evolución mensual siempre cubre los últimos 12 meses, sin filtro de fechas
            const yearly = new URLSearchParams();
            if (subjectAcronym) yearly.append("asignatura", subjectAcronym);

            const studentsRequest = fetch(`${API_BASE}/students-summary`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json", ...authHeaders() },
                body: JSON.stringify({
                    subject: subjectAcronym,
                    fechaInicio: startDate || undefined,
                    fechaFin: endDate || undefined,
                }),
            }).then((response) => {
                if (!response.ok) throw new Error(`students-summary: ${response.status}`);
                return response.json();
            });

            const [kpisRes, difficultyRes, monthlyRes, dailyRes, studentsRes] = await Promise.allSettled([
                getJson("/reports/kpis", period),
                getJson("/reports/difficulty", period),
                getJson("/reports/evolution", yearly),
                getJson("/reports/daily", period),
                studentsRequest,
            ]);

            if (cancelled) return;

            setKpis(kpisRes.status === "fulfilled" ? kpisRes.value : null);
            setDifficulty(
                difficultyRes.status === "fulfilled"
                    ? (difficultyRes.value.dificultadResumen || []).map((row: any) => {
                        const correct =
                            typeof row.correctas === "number"
                                ? row.correctas
                                : Math.round((row.total * row.porcentaje) / 100);
                        return {
                            label: row.label,
                            total: row.total,
                            correct,
                            wrong: row.total - correct,
                            rate: percent(correct, row.total),
                        };
                    })
                    : []
            );
            setMonthly(monthlyRes.status === "fulfilled" ? monthlyRes.value.evolucionMensual || [] : []);
            setDaily(dailyRes.status === "fulfilled" ? dailyRes.value.diario || [] : []);
            setStudents(
                studentsRes.status === "fulfilled" && Array.isArray(studentsRes.value) ? studentsRes.value : []
            );

            setFailed(
                [kpisRes, difficultyRes, monthlyRes, dailyRes, studentsRes].some(
                    (result) => result.status === "rejected"
                )
            );
            setLoading(false);
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [subjectAcronym, startDate, endDate, refreshKey]);

    const toggleStudent = async (studentEmail: string) => {
        if (openStudent === studentEmail) {
            setOpenStudent(null);
            return;
        }
        setOpenStudent(studentEmail);
        if (studentDetails[studentEmail] && studentDetails[studentEmail] !== "error") return;

        setStudentDetails((prev) => ({ ...prev, [studentEmail]: "loading" }));
        try {
            const response = await fetch(`${API_BASE}/student-detail`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json", ...authHeaders() },
                body: JSON.stringify({ studentID: studentEmail, subject: subjectAcronym }),
            });
            if (!response.ok) throw new Error(String(response.status));
            const data = await response.json();
            setStudentDetails((prev) => ({
                ...prev,
                [studentEmail]: {
                    totalTests: data.totalTests ?? 0,
                    totalCorrect: data.totalCorrect ?? 0,
                    difficulty: data.difficulty ?? 0,
                },
            }));
        } catch {
            setStudentDetails((prev) => ({ ...prev, [studentEmail]: "error" }));
        }
    };

    const noData = <p className="text-sm text-gray-500">{t("subjectDetail.statistics.noData")}</p>;
    const monthlyTotal = monthly.reduce((sum, row) => sum + row.total, 0);
    const visibleStudents = showAllStudents ? students : students.slice(0, STUDENTS_PREVIEW);

    const kpiCards: { label: string; value: number | undefined; tone: string }[] = [
        { label: tr("kpiTotalGlobal"), value: kpis?.totalGlobal, tone: "text-gray-900" },
        { label: tr("kpiTotalPeriod"), value: kpis?.totalPeriodo, tone: "text-gray-900" },
        { label: tr("kpiReported"), value: kpis?.studentReportsPeriodo, tone: "text-amber-600" },
        { label: tr("kpiEvaluated"), value: kpis?.evaluadasPeriodo, tone: "text-indigo-600" },
    ];

    return (
        <div className="space-y-6">
            <div className="pt-2">
                <h2 className="text-base font-semibold text-gray-900">{tr("title")}</h2>
                <p className="text-sm text-gray-500 mt-1">
                    {loading ? t("common.loading") : tr("subtitle")}
                </p>
            </div>

            {failed && !loading ? (
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">{tr("partialError")}</div>
            ) : null}

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((card) => (
                    <div key={card.label} className="bg-white shadow rounded-lg p-4">
                        <dt className="text-sm font-medium text-gray-500">{card.label}</dt>
                        <dd className={`mt-1 text-3xl font-semibold ${card.tone}`}>{card.value ?? "–"}</dd>
                    </div>
                ))}
            </div>

            {/* Dificultad */}
            <CollapsibleSection
                id="insights-difficulty"
                title={tr("difficultyTitle")}
                description={tr("difficultyDescription")}
            >
                {difficulty.length === 0 ? (
                    noData
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={difficulty} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar
                                        dataKey="correct"
                                        stackId="difficulty"
                                        name={t("subjectDetail.statistics.correctShort")}
                                        fill={COLORS.correct}
                                    />
                                    <Bar
                                        dataKey="wrong"
                                        stackId="difficulty"
                                        name={t("subjectDetail.statistics.incorrectShort")}
                                        fill={COLORS.wrong}
                                        radius={[6, 6, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {[
                                            tr("difficultyColumn"),
                                            t("subjectDetail.statistics.answered"),
                                            t("subjectDetail.statistics.successRate"),
                                        ].map((heading) => (
                                            <th
                                                key={heading}
                                                scope="col"
                                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {difficulty.map((row) => (
                                        <tr key={row.label}>
                                            <td className="px-4 py-3 text-sm text-gray-900">{row.label}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{row.total}</td>
                                            <td className="px-4 py-3 text-sm text-green-600">{row.rate}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </CollapsibleSection>

            {/* Uso de la herramienta */}
            <CollapsibleSection id="insights-usage" title={tr("usageTitle")} description={tr("usageDescription")}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">{tr("monthlyTitle")}</h4>
                        {monthlyTotal === 0 ? (
                            noData
                        ) : (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthly} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={1} />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                        <Tooltip />
                                        <Bar
                                            dataKey="total"
                                            name={tr("questionsAnswered")}
                                            fill={COLORS.activity}
                                            radius={[6, 6, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">{tr("dailyTitle")}</h4>
                        {daily.length === 0 ? (
                            noData
                        ) : (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={daily} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis
                                            dataKey="dia"
                                            tick={{ fontSize: 11 }}
                                            tickFormatter={(value: string) => String(value).slice(5)}
                                            minTickGap={16}
                                        />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                        <Tooltip />
                                        <Bar
                                            dataKey="count"
                                            name={tr("questionsAnswered")}
                                            fill={COLORS.activity}
                                            radius={[6, 6, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </div>
            </CollapsibleSection>

            {/* Alumnos */}
            <CollapsibleSection
                id="insights-students"
                title={tr("studentsTitle")}
                description={tr("studentsDescription")}
                right={students.length ? tr("studentsCount", { count: students.length }) : undefined}
            >
                {students.length === 0 ? (
                    noData
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {[
                                            tr("studentColumn"),
                                            t("subjectDetail.statistics.answered"),
                                            t("subjectDetail.statistics.successRate"),
                                            "",
                                        ].map((heading, index) => (
                                            <th
                                                key={`students-heading-${index}`}
                                                scope="col"
                                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {visibleStudents.map((student) => {
                                        const isOpen = openStudent === student.studentEmail;
                                        const detail = studentDetails[student.studentEmail];

                                        return (
                                            <Fragment key={student.studentEmail}>
                                                <tr>
                                                    <td className="px-4 py-3 text-sm text-gray-900 break-all">
                                                        {student.studentEmail}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">
                                                        {student.totalTests}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-green-600">
                                                        {percent(student.totalCorrect, student.totalTests)}%
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-right whitespace-nowrap">
                                                        <button
                                                            type="button"
                                                            className="text-indigo-600 hover:text-indigo-800"
                                                            onClick={() => toggleStudent(student.studentEmail)}
                                                            aria-expanded={isOpen}
                                                        >
                                                            {isOpen ? tr("hideDetail") : tr("showDetail")}
                                                        </button>
                                                    </td>
                                                </tr>
                                                {isOpen ? (
                                                    <tr>
                                                        <td colSpan={4} className="px-4 py-3 bg-gray-50 text-sm text-gray-700">
                                                            {detail === "loading" || !detail ? (
                                                                t("common.loading")
                                                            ) : detail === "error" ? (
                                                                tr("detailError")
                                                            ) : (
                                                                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                                    <div>
                                                                        <dt className="text-xs text-gray-500">
                                                                            {tr("detailTotal")}
                                                                        </dt>
                                                                        <dd className="text-lg font-semibold text-gray-900">
                                                                            {detail.totalTests}
                                                                        </dd>
                                                                    </div>
                                                                    <div>
                                                                        <dt className="text-xs text-gray-500">
                                                                            {tr("detailSuccess")}
                                                                        </dt>
                                                                        <dd className="text-lg font-semibold text-green-600">
                                                                            {percent(detail.totalCorrect, detail.totalTests)}%
                                                                        </dd>
                                                                    </div>
                                                                    <div>
                                                                        <dt className="text-xs text-gray-500">
                                                                            {tr("detailDifficulty")}
                                                                        </dt>
                                                                        <dd className="text-lg font-semibold text-gray-900">
                                                                            {Math.round(detail.difficulty)}%
                                                                        </dd>
                                                                    </div>
                                                                </dl>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ) : null}
                                            </Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {students.length > STUDENTS_PREVIEW ? (
                            <button
                                type="button"
                                className="mt-3 text-sm text-indigo-600 hover:text-indigo-800"
                                onClick={() => setShowAllStudents((value) => !value)}
                            >
                                {showAllStudents
                                    ? tr("showFewerStudents")
                                    : tr("showAllStudents", { count: students.length })}
                            </button>
                        ) : null}
                    </>
                )}
            </CollapsibleSection>
        </div>
    );
};

export default StatisticsInsights;
