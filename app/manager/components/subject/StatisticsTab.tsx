"use client";

import { useEffect, useMemo, useState } from "react";
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
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
    createdAt?: string;
}

interface AggregatedStat {
    label: string;
    total: number;
    correct: number;
    wrong: number;
    timeline: ChartPoint[];
}
interface ChartPoint {
    date: string;
    total: number;
    correct: number;
    wrong: number;
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
    const [chartMode, setChartMode] = useState<"topics" | "subtopics">("subtopics");

    const selectedStats = useMemo(
        () => (chartMode === "topics" ? topicStats : subtopicStats),
        [chartMode, subtopicStats, topicStats]
    );

    useEffect(() => {
        fetchStatistics();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const buildAggregates = (
        items: QuestionEntry[],
        getLabel: (question: QuestionEntry) => string
    ): AggregatedStat[] => {
        const accumulator = new Map<
            string,
            { stat: AggregatedStat; timelineMap: Map<string, ChartPoint> }
        >();
        items.forEach((question) => {
            const label = getLabel(question) || t("subjectDetail.statistics.unknown");
            const isCorrect = question.studentAnswer === question.answer;
            const existing = accumulator.get(label);

            if (!existing) {
                accumulator.set(label, {
                    stat: {
                        label,
                        total: 0,
                        correct: 0,
                        wrong: 0,
                        timeline: [],
                    },
                    timelineMap: new Map(),
                });
            }

            const entry = accumulator.get(label)!;
            entry.stat.total += 1;
            entry.stat.correct += isCorrect ? 1 : 0;
            entry.stat.wrong += isCorrect ? 0 : 1;

            const dateValue = question.createdAt ? new Date(question.createdAt) : null;
            if (!Number.isNaN(dateValue?.getTime())) {
                const dateKey = dateValue!.toISOString().split("T")[0];
                const point =
                    entry.timelineMap.get(dateKey) ||
                    ({ date: dateKey, total: 0, correct: 0, wrong: 0 } as ChartPoint);

                point.total += 1;
                point.correct += isCorrect ? 1 : 0;
                point.wrong += isCorrect ? 0 : 1;
                entry.timelineMap.set(dateKey, point);
            }
        });

        const aggregates = Array.from(accumulator.values()).map(({ stat, timelineMap }) => ({
            ...stat,
            timeline: Array.from(timelineMap.values()).sort((a, b) => a.date.localeCompare(b.date)),
        }));

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
            createdAt: question.createdAt || question.created_at,
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

    const renderPerformanceChart = () => (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {t("subjectDetail.statistics.chartTitle")}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {t("subjectDetail.statistics.chartDescription")}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-gray-700">
                            {t("subjectDetail.statistics.chartMode")}
                        </label>
                        <select
                            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={chartMode}
                            onChange={(event) =>
                                setChartMode(event.target.value as "topics" | "subtopics")
                            }
                        >
                            <option value="topics">
                                {t("subjectDetail.statistics.topicsOption")}
                            </option>
                            <option value="subtopics">
                                {t("subjectDetail.statistics.subtopicsOption")}
                            </option>
                        </select>
                    </div>
                </div>

                {selectedStats.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        {t("subjectDetail.statistics.noData")}
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {selectedStats.map((stat) => {
                            const chartData =
                                stat.timeline.length > 0
                                    ? stat.timeline
                                    : ([
                                        {
                                            date: t("subjectDetail.statistics.chartRangeLabel"),
                                            total: stat.total,
                                            correct: stat.correct,
                                            wrong: stat.wrong,
                                        },
                                    ] as ChartPoint[]);
                            const successRate = stat.total
                                ? Math.round((stat.correct / stat.total) * 100)
                                : 0;
                            const failureRate = 100 - successRate;

                            return (
                                <div
                                    key={`${chartMode}-${stat.label}`}
                                    className="border rounded-lg p-4 flex flex-col gap-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h4 className="text-md font-semibold text-gray-900">
                                                {stat.label}
                                            </h4>
                                            <p className="text-xs text-gray-500">
                                                {t("subjectDetail.statistics.chartItemAnswered", {
                                                    count: stat.total,
                                                })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-green-600">
                                                {t("subjectDetail.statistics.correctShort")}: {successRate}%
                                            </p>
                                            <p className="text-xs text-red-600">
                                                {t("subjectDetail.statistics.incorrectShort")}: {failureRate}%
                                            </p>
                                        </div>
                                    </div>

                                    <div className="h-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart
                                                data={chartData}
                                                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                                <XAxis
                                                    dataKey="date"
                                                    tick={{ fontSize: 12 }}
                                                    height={20}
                                                    tickFormatter={(value) => value}
                                                />
                                                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                                <Tooltip
                                                    formatter={(value: number) => value.toLocaleString()}
                                                    labelStyle={{ fontWeight: 600 }}
                                                />
                                                <Legend />
                                                <Line
                                                    type="monotone"
                                                    dataKey="correct"
                                                    name={t("subjectDetail.statistics.correctLine")}
                                                    stroke="#16A34A"
                                                    strokeWidth={2}
                                                    dot={false}
                                                    activeDot={{ r: 0 }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="wrong"
                                                    name={t("subjectDetail.statistics.wrongLine")}
                                                    stroke="#DC2626"
                                                    strokeWidth={2}
                                                    dot={false}
                                                    activeDot={{ r: 0 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
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

            {renderPerformanceChart()}

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