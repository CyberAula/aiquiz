"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    Rectangle,
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

const capitalizeFirstLetter = (text: string) => {
    if (!text) return text;
    const trimmed = text.trim();
    if (!trimmed) return text;
    return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`;
};

const formatDateInput = (date: Date) => date.toISOString().split("T")[0];

// ====== UI helpers (labels + colors + rounded bars) ======
const MAX_AXIS_LABEL = 12;
const truncateAxisLabel = (value: any, max = MAX_AXIS_LABEL) => {
    const str = String(value ?? "");
    if (str.length <= max) return str;
    return `${str.slice(0, max - 3)}...`; // total length <= 12
};

const BAR_RADIUS = 6;

// Lines (tendencia) keep a bit softer
const LINE_COLORS = {
    correct: "rgba(22, 163, 74, 0.75)",
    wrong: "rgba(220, 38, 38, 0.75)",
};

// Histograms a bit more intense (as requested)
const HISTOGRAM_COLORS = {
    correct: "rgba(22, 163, 74, 0.9)",
    wrong: "rgba(220, 38, 38, 0.9)",
};

// For stacked bars: only round the outer corners (top for wrong, bottom for correct).
// If only one segment exists, round all corners.
const stackedRoundedShape =
    (segment: "correct" | "wrong") =>
        (props: any) => {
            const { payload } = props;
            const correct = payload?.correct ?? 0;
            const wrong = payload?.wrong ?? 0;

            const isSingle = segment === "correct" ? wrong === 0 : correct === 0;

            const radius: [number, number, number, number] =
                segment === "correct"
                    ? isSingle
                        ? [BAR_RADIUS, BAR_RADIUS, BAR_RADIUS, BAR_RADIUS]
                        : [0, 0, BAR_RADIUS, BAR_RADIUS] // bottom corners
                    : isSingle
                        ? [BAR_RADIUS, BAR_RADIUS, BAR_RADIUS, BAR_RADIUS]
                        : [BAR_RADIUS, BAR_RADIUS, 0, 0]; // top corners

            return <Rectangle {...props} radius={radius} />;
        };

type CollapsibleSectionProps = {
    id: string;
    title: string;
    description?: string;
    right?: React.ReactNode;
    defaultOpen?: boolean;
    children: React.ReactNode;
};

const CollapsibleSection = ({
    id,
    title,
    description,
    right,
    defaultOpen = true,
    children,
}: CollapsibleSectionProps) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="bg-white shadow rounded-lg">
            <button
                type="button"
                className="w-full p-6 flex items-start justify-between gap-4"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls={id}
            >
                <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    {description ? (
                        <p className="text-sm text-gray-500 mt-1">{description}</p>
                    ) : null}
                </div>

                <div className="flex items-center gap-4">
                    {right ? <div className="text-sm text-gray-500">{right}</div> : null}
                    <span className="text-gray-400 text-xl leading-none select-none">
                        {open ? "−" : "+"}
                    </span>
                </div>
            </button>

            {open ? (
                <div id={id} className="px-6 pb-6">
                    {children}
                </div>
            ) : null}
        </div>
    );
};
// =========================================================

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
    const [questions, setQuestions] = useState<QuestionEntry[]>([]);
    const [topicStats, setTopicStats] = useState<AggregatedStat[]>([]);
    const [subtopicStats, setSubtopicStats] = useState<AggregatedStat[]>([]);
    const [chartMode, setChartMode] = useState<"topics" | "subtopics">("subtopics");
    const [selectedItem, setSelectedItem] = useState<string>("all");

    const getTopicLabel = useCallback(
        (question: QuestionEntry) =>
            capitalizeFirstLetter(question.topic || "") ||
            t("subjectDetail.statistics.unknown"),
        [t]
    );

    const getSubtopicLabel = useCallback(
        (question: QuestionEntry) =>
            capitalizeFirstLetter(
                question.subTopic ||
                question.subtopicTitle ||
                question.subtopic ||
                t("subjectDetail.statistics.noSubtopic")
            ),
        [t]
    );

    const buildAggregates = useCallback(
        (items: QuestionEntry[], getLabel: (question: QuestionEntry) => string): AggregatedStat[] => {
            const accumulator = new Map<
                string,
                { stat: AggregatedStat; timelineMap: Map<string, ChartPoint> }
            >();

            items.forEach((question) => {
                const label = getLabel(question) || t("subjectDetail.statistics.unknown");
                const isCorrect = question.studentAnswer === question.answer;

                if (!accumulator.has(label)) {
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
        },
        [t]
    );

    const availableOptions = useMemo(
        () => (chartMode === "topics" ? topicStats : subtopicStats),
        [chartMode, subtopicStats, topicStats]
    );

    const selectedStats = useMemo(() => {
        const stats = chartMode === "topics" ? topicStats : subtopicStats;
        if (selectedItem === "all") return stats;
        return stats.filter((stat) => stat.label === selectedItem);
    }, [chartMode, selectedItem, subtopicStats, topicStats]);

    const filteredQuestions = useMemo(() => {
        if (selectedItem === "all") return questions;

        if (chartMode === "topics") {
            return questions.filter((question) => getTopicLabel(question) === selectedItem);
        }

        return questions.filter((question) => getSubtopicLabel(question) === selectedItem);
    }, [chartMode, getSubtopicLabel, getTopicLabel, questions, selectedItem]);

    const displayedSummary = useMemo(() => {
        const total = filteredQuestions.length;
        const correct = filteredQuestions.filter(
            (question) => question.studentAnswer === question.answer
        ).length;

        return { total, correct, wrong: total - correct };
    }, [filteredQuestions]);

    const subtopicsByTopic = useMemo(() => {
        const groups = new Map<string, QuestionEntry[]>();

        questions.forEach((question) => {
            const topicLabel = getTopicLabel(question);
            const bucket = groups.get(topicLabel) || [];
            bucket.push(question);
            groups.set(topicLabel, bucket);
        });

        return Array.from(groups.entries()).map(([topic, topicQuestions]) => ({
            topic,
            stats: buildAggregates(topicQuestions, (question) => getSubtopicLabel(question)),
        }));
    }, [buildAggregates, getSubtopicLabel, getTopicLabel, questions]);

    const renderStackedTooltip = (label?: string, payload?: any[]) => {
        if (!payload || payload.length === 0) return null;

        const data = payload[0]?.payload;
        if (!data) return null;

        return (
            <div className="bg-white border shadow-sm rounded p-3 text-sm text-gray-800">
                <p className="font-semibold mb-1">{label || data.label}</p>
                <p>{t("subjectDetail.statistics.tooltipTotal", { count: data.total })}</p>
                <p className="text-green-700">
                    {t("subjectDetail.statistics.tooltipCorrect", { count: data.correct })}
                </p>
                <p className="text-red-700">
                    {t("subjectDetail.statistics.tooltipWrong", { count: data.wrong })}
                </p>
            </div>
        );
    };

    useEffect(() => {
        fetchStatistics();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setSelectedItem("all");
    }, [chartMode]);

    useEffect(() => {
        const labels = availableOptions.map((option) => option.label);
        if (selectedItem !== "all" && !labels.includes(selectedItem)) {
            setSelectedItem("all");
        }
    }, [availableOptions, selectedItem]);

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
            if (subjectAcronym) params.append("asignatura", subjectAcronym);
            if (startDate) params.append("fechaInicio", startDate);
            if (endDate) params.append("fechaFin", endDate);

            const token =
                (typeof window !== "undefined" &&
                    (localStorage.getItem("jwt_token") || localStorage.getItem("auth_token"))) ||
                null;

            const headers: Record<string, string> = {};
            if (token) headers["Authorization"] = `Bearer ${token}`;

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

            setQuestions(questions);
            setTopicStats(buildAggregates(questions, (q) => getTopicLabel(q)));
            setSubtopicStats(buildAggregates(questions, (q) => getSubtopicLabel(q)));
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

    // ---------- Table content (no outer card; the section provides container) ----------
    const renderAggregateTableContent = (data: AggregatedStat[]) => {
        if (data.length === 0) {
            return <p className="text-sm text-gray-500">{t("subjectDetail.statistics.noData")}</p>;
        }

        return (
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
                            const successRate = item.total ? Math.round((item.correct / item.total) * 100) : 0;
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
        );
    };

    // ---------- Sections ----------
    const renderPerformanceSection = () => (
        <CollapsibleSection
            id="section-trend"
            title={t("subjectDetail.statistics.chartTitle")}
            right={
                <span>
                    {t("subjectDetail.statistics.itemsCount", { count: selectedStats.length })}
                </span>
            }
            defaultOpen
        >
            {selectedStats.length === 0 ? (
                <p className="text-sm text-gray-500">{t("subjectDetail.statistics.noData")}</p>
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

                        const successRate = stat.total ? Math.round((stat.correct / stat.total) * 100) : 0;
                        const failureRate = 100 - successRate;

                        return (
                            <div
                                key={`${chartMode}-${stat.label}`}
                                className="border rounded-lg p-4 flex flex-col gap-3"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h4 className="text-md font-semibold text-gray-900">{stat.label}</h4>
                                        <p className="text-xs text-gray-500">
                                            {t("subjectDetail.statistics.chartItemAnswered", { count: stat.total })}
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
                                        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
                                                stroke={LINE_COLORS.correct}
                                                strokeWidth={2}
                                                dot={false}
                                                activeDot={{ r: 0 }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="wrong"
                                                name={t("subjectDetail.statistics.wrongLine")}
                                                stroke={LINE_COLORS.wrong}
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
        </CollapsibleSection>
    );

    const renderTopicTableSection = () => (
        <CollapsibleSection
            id="section-topic-table"
            title={t("subjectDetail.statistics.topicBreakdown")}
            right={<span>{t("subjectDetail.statistics.itemsCount", { count: topicStats.length })}</span>}
            defaultOpen={false}
        >
            {renderAggregateTableContent(topicStats)}
        </CollapsibleSection>
    );

    const renderSubtopicTableSection = () => (
        <CollapsibleSection
            id="section-subtopic-table"
            title={t("subjectDetail.statistics.subtopicBreakdown")}
            right={<span>{t("subjectDetail.statistics.itemsCount", { count: subtopicsByTopic.length })}</span>}
            defaultOpen={false}
        >
            {subtopicsByTopic.length === 0 ? (
                <p className="text-sm text-gray-500">{t("subjectDetail.statistics.noData")}</p>
            ) : (
                <div className="space-y-4">
                    {subtopicsByTopic.map(({ topic, stats }) => (
                        <div key={`subtopic-table-${topic}`} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-md font-semibold text-gray-900">{topic}</h4>
                                <span className="text-sm text-gray-500">
                                    {t("subjectDetail.statistics.itemsCount", { count: stats.length })}
                                </span>
                            </div>
                            {renderAggregateTableContent(stats)}
                        </div>
                    ))}
                </div>
            )}
        </CollapsibleSection>
    );

    const renderTopicHistogramSection = () => (
        <CollapsibleSection
            id="section-topic-histogram"
            title={t("subjectDetail.statistics.topicHistogram")}
            right={<span>{t("subjectDetail.statistics.itemsCount", { count: topicStats.length })}</span>}
            defaultOpen={false}

        >
            {topicStats.length === 0 ? (
                <p className="text-sm text-gray-500">{t("subjectDetail.statistics.noData")}</p>
            ) : (
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topicStats} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis
                                dataKey="label"
                                tick={{ fontSize: 12 }}
                                interval={0}
                                angle={-25}
                                textAnchor="end"
                                height={60}
                                tickFormatter={(value) => truncateAxisLabel(value)}
                            />
                            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                            <Tooltip content={({ label, payload }) => renderStackedTooltip(label, payload)} />
                            <Legend />
                            <Bar
                                dataKey="correct"
                                stackId="topics"
                                name={t("subjectDetail.statistics.correctShort")}
                                fill={HISTOGRAM_COLORS.correct}
                                shape={stackedRoundedShape("correct")}
                            />
                            <Bar
                                dataKey="wrong"
                                stackId="topics"
                                name={t("subjectDetail.statistics.incorrectShort")}
                                fill={HISTOGRAM_COLORS.wrong}
                                shape={stackedRoundedShape("wrong")}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </CollapsibleSection>
    );

    const renderSubtopicHistogramSection = () => (
        <CollapsibleSection
            id="section-subtopic-histogram"
            title={t("subjectDetail.statistics.subtopicHistogram")}
            right={<span>{t("subjectDetail.statistics.itemsCount", { count: subtopicsByTopic.length })}</span>}
            defaultOpen={false}
        >
            {subtopicsByTopic.length === 0 ? (
                <p className="text-sm text-gray-500">{t("subjectDetail.statistics.noData")}</p>
            ) : (
                <div className="space-y-8">
                    {subtopicsByTopic.map(({ topic, stats }) => (
                        <div key={`hist-${topic}`} className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-md font-semibold text-gray-900">{topic}</h4>
                                <span className="text-sm text-gray-500">
                                    {t("subjectDetail.statistics.itemsCount", { count: stats.length })}
                                </span>
                            </div>

                            {stats.length === 0 ? (
                                <p className="text-sm text-gray-500">{t("subjectDetail.statistics.noData")}</p>
                            ) : (
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                            <XAxis
                                                dataKey="label"
                                                tick={{ fontSize: 12 }}
                                                interval={0}
                                                angle={-25}
                                                textAnchor="end"
                                                height={60}
                                                tickFormatter={(value) => truncateAxisLabel(value)}
                                            />
                                            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                            <Tooltip
                                                content={({ label, payload }) => renderStackedTooltip(label, payload)}
                                            />
                                            <Legend />
                                            <Bar
                                                dataKey="correct"
                                                stackId={`subtopics-${topic}`}
                                                name={t("subjectDetail.statistics.correctShort")}
                                                fill={HISTOGRAM_COLORS.correct}
                                                shape={stackedRoundedShape("correct")}
                                            />
                                            <Bar
                                                dataKey="wrong"
                                                stackId={`subtopics-${topic}`}
                                                name={t("subjectDetail.statistics.incorrectShort")}
                                                fill={HISTOGRAM_COLORS.wrong}
                                                shape={stackedRoundedShape("wrong")}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </CollapsibleSection>
    );

    return (
        <div className="space-y-6">
            {/* Filters */}
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
                        {loading ? t("common.loading") : t("subjectDetail.statistics.update")}
                    </button>
                </div>
            </div>

            {/* Chart mode + selector */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">
                        {t("subjectDetail.statistics.chartMode")}
                    </label>
                    <select
                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={chartMode}
                        onChange={(event) => setChartMode(event.target.value as "topics" | "subtopics")}
                    >
                        <option value="topics">{t("subjectDetail.statistics.topicsOption")}</option>
                        <option value="subtopics">{t("subjectDetail.statistics.subtopicsOption")}</option>
                    </select>
                </div>

                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">
                        {chartMode === "topics"
                            ? t("subjectDetail.statistics.topicSelectorLabel")
                            : t("subjectDetail.statistics.subtopicSelectorLabel")}
                    </label>
                    <select
                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={selectedItem}
                        onChange={(event) => setSelectedItem(event.target.value)}
                    >
                        <option value="all">
                            {chartMode === "topics"
                                ? t("subjectDetail.statistics.allTopicsOption")
                                : t("subjectDetail.statistics.allSubtopicsOption")}
                        </option>
                        {availableOptions.map((option) => (
                            <option key={`${chartMode}-${option.label}`} value={option.label}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Error */}
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

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white shadow rounded-lg p-4">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                        {t("subjectDetail.statistics.totalAnswered")}
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {displayedSummary.total}
                    </dd>
                </div>
                <div className="bg-white shadow rounded-lg p-4">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                        {t("subjectDetail.statistics.successPercentage")}
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-green-600">
                        {displayedSummary.total
                            ? Math.round((displayedSummary.correct / displayedSummary.total) * 100)
                            : 0}
                        %
                    </dd>
                </div>
                <div className="bg-white shadow rounded-lg p-4">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                        {t("subjectDetail.statistics.failurePercentage")}
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-red-600">
                        {displayedSummary.total
                            ? Math.round((displayedSummary.wrong / displayedSummary.total) * 100)
                            : 0}
                        %
                    </dd>
                </div>
            </div>

            {/* Collapsible sections */}
            {renderPerformanceSection()}
            {renderTopicTableSection()}
            {renderSubtopicTableSection()}
            {renderTopicHistogramSection()}
            {renderSubtopicHistogramSection()}
        </div>
    );
};

export default StatisticsTab;
