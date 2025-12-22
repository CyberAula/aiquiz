"use client";

import { useEffect, useMemo, useState } from "react";
import { useManagerTranslation } from "../../hooks/useManagerTranslation";

interface StatisticsTabProps {
    subjectAcronym: string;
}

interface QuestionEntry {
    topic?: string;
    subTopic?: string;
    subtopic?: string;
    subtopicTitle?: string;
    answer?: number;
    studentAnswer?: number;
}

interface AggregatedStat {
    label: string;
    total: number;
    correct: number;
}

const formatDateInput = (date: Date) => date.toISOString().split("T")[0];

const StatisticsTab = ({ subjectAcronym }: StatisticsTabProps) => {
    const { t } = useManagerTranslation();
    const today = useMemo(() => new Date(), []);
    const weekAgo = useMemo(() => {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        return date;
    }, []);

    const [startDate, setStartDate] = useState(formatDateInput(weekAgo));
    const [endDate, setEndDate] = useState(formatDateInput(today));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errorDetail, setErrorDetail] = useState<string | null>(null);
    const [summary, setSummary] = useState({ total: 0, correct: 0, wrong: 0 });
    const [topicStats, setTopicStats] = useState<AggregatedStat[]>([]);
    const [subtopicStats, setSubtopicStats] = useState<AggregatedStat[]>([]);

    useEffect(() => {
        fetchStatistics();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const buildAggregates = (
        items: QuestionEntry[],
        getLabel: (question: QuestionEntry) => string
    ): AggregatedStat[] => {
        const accumulator = new Map<string, AggregatedStat>();

        items.forEach((question) => {
            const label = getLabel(question) || t("subjectDetail.statistics.unknown");
            const current = accumulator.get(label) || {
                label,
                total: 0,
                correct: 0,
            };

            const isCorrect = question.studentAnswer === question.answer;
            current.total += 1;
            current.correct += isCorrect ? 1 : 0;
            accumulator.set(label, current);
        });

        const aggregates = Array.from(accumulator.values());

        return aggregates.sort((a, b) => b.total - a.total);
    };

    const parseQuestions = (data: any): QuestionEntry[] => {
        if (!data) return [];
        const questions = data.preguntas || [];

        return questions.map((question: any) => ({
            topic: question.topic,
            subTopic: question.subTopic,
            subtopic: question.subtopic,
            subtopicTitle: question.subtopicTitle,
            answer: typeof question.answer === "number" ? question.answer : Number(question.answer),
            studentAnswer:
                typeof question.studentAnswer === "number"
                    ? question.studentAnswer
                    : Number(question.studentAnswer),
        }));
    };

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            setError(null);
            setErrorDetail(null);

            const params = new URLSearchParams();
            if (subjectAcronym) {
                params.append("asignatura", subjectAcronym);
            }
            if (startDate) {
                params.append("fechaInicio", startDate);
            }
            if (endDate) {
                params.append("fechaFin", endDate);
            }

            const token =
                (typeof window !== "undefined" &&
                    (localStorage.getItem("jwt_token") ||
                        localStorage.getItem("auth_token"))) ||
                null;

            const headers: Record<string, string> = {};
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const response = await fetch(`/aiquiz/api/reports?${params.toString()}`, {
                credentials: "include",
                headers,
            });

            if (!response.ok) {
                const message =
                    response.status === 401
                        ? t("subjectDetail.statistics.unauthorized")
                        : t("subjectDetail.statistics.error");

                let detail: string | null = null;
                try {
                    const result = await response.json();
                    detail = result?.message || result?.error || null;
                } catch (jsonError) {
                    const text = await response.text();
                    detail = text || null;
                }

                throw { userMessage: message, detail };
            }

            const data = await response.json();
            const questions = parseQuestions(data);
            const total = questions.length;
            const correct = questions.filter(
                (question) => question.studentAnswer === question.answer
            ).length;
            const wrong = total - correct;

            setSummary({ total, correct, wrong });

            setTopicStats(
                buildAggregates(questions, (question) => question.topic || "")
            );
            setSubtopicStats(
                buildAggregates(questions, (question) => {
                    return (
                        question.subTopic ||
                        question.subtopicTitle ||
                        question.subtopic ||
                        t("subjectDetail.statistics.noSubtopic")
                    );
                })
            );
        } catch (err: any) {
            const fallbackMessage = t("subjectDetail.statistics.error");
            const userMessage = err?.userMessage || fallbackMessage;
            const detail = err?.detail || (err?.message !== userMessage ? err?.message : null);

            setError(userMessage);
            setErrorDetail(detail && detail !== userMessage ? detail : null);
        } finally {
            setLoading(false);
        }
    };

    const renderAggregateTable = (title: string, data: AggregatedStat[]) => (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <span className="text-sm text-gray-500">
                    {t("subjectDetail.statistics.itemsCount", { count: data.length })}
                </span>
            </div>
            {data.length === 0 ? (
                <p className="text-sm text-gray-500">
                    {t("subjectDetail.statistics.noData")}
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {t("subjectDetail.statistics.name")}
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {t("subjectDetail.statistics.answered")}
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {t("subjectDetail.statistics.successRate")}
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {t("subjectDetail.statistics.failureRate")}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.map((item) => {
                                const successRate = item.total
                                    ? Math.round((item.correct / item.total) * 100)
                                    : 0;
                                const failureRate = 100 - successRate;
                                return (
                                    <tr key={item.label}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                            {item.label}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                            {item.total}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600">
                                            {successRate}%
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600">
                                            {failureRate}%
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-4 space-y-4 lg:space-y-0">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("subjectDetail.statistics.startDate")}
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("subjectDetail.statistics.endDate")}
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <button
                        onClick={fetchStatistics}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        disabled={loading}
                    >
                        {loading
                            ? t("common.loading")
                            : t("subjectDetail.statistics.update")}
                    </button>
                </div>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                                {t("subjectDetail.statistics.error")}
                            </h3>
                            {errorDetail && (
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{errorDetail}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white shadow rounded-lg p-4">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                        {t("subjectDetail.statistics.totalAnswered")}
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{summary.total}</dd>
                </div>
                <div className="bg-white shadow rounded-lg p-4">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                        {t("subjectDetail.statistics.successPercentage")}
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-green-600">
                        {summary.total
                            ? Math.round((summary.correct / summary.total) * 100)
                            : 0}
                        %
                    </dd>
                </div>
                <div className="bg-white shadow rounded-lg p-4">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                        {t("subjectDetail.statistics.failurePercentage")}
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-red-600">
                        {summary.total
                            ? Math.round((summary.wrong / summary.total) * 100)
                            : 0}
                        %
                    </dd>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderAggregateTable(
                    t("subjectDetail.statistics.topicBreakdown"),
                    topicStats
                )}
                {renderAggregateTable(
                    t("subjectDetail.statistics.subtopicBreakdown"),
                    subtopicStats
                )}
            </div>
        </div>
    );
};

export default StatisticsTab;