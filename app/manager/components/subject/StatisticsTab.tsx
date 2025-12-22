"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
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

// Lines
const LINE_COLORS = {
    correct: "rgba(22, 163, 74, 0.78)",
    wrong: "rgba(220, 38, 38, 0.78)",
};

// Histograms (a bit more intense)
const HISTOGRAM_COLORS = {
    correct: "rgba(22, 163, 74, 0.95)",
    wrong: "rgba(220, 38, 38, 0.95)",
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
    right?: ReactNode;
    defaultOpen?: boolean;
    children: ReactNode;
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

type PdfSectionKey =
    | "summary"
    | "trend"
    | "tableTopics"
    | "tableSubtopics"
    | "histTopics"
    | "histSubtopics";

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

    // ---- PDF UI state ----
    const [pdfMenuOpen, setPdfMenuOpen] = useState(false);
    const [pdfGenerating, setPdfGenerating] = useState(false);
    const pdfMenuRef = useRef<HTMLDivElement | null>(null);

    const [pdfSections, setPdfSections] = useState<Record<PdfSectionKey, boolean>>({
        summary: true,
        trend: true,
        tableTopics: true,
        tableSubtopics: true,
        histTopics: true,
        histSubtopics: true,
    });

    const getTopicLabel = useCallback(
        (question: QuestionEntry) =>
            capitalizeFirstLetter(question.topic || "") || t("subjectDetail.statistics.unknown"),
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
            const accumulator = new Map<string, { stat: AggregatedStat; timelineMap: Map<string, ChartPoint> }>();

            items.forEach((question) => {
                const label = getLabel(question) || t("subjectDetail.statistics.unknown");
                const isCorrect = question.studentAnswer === question.answer;

                if (!accumulator.has(label)) {
                    accumulator.set(label, {
                        stat: { label, total: 0, correct: 0, wrong: 0, timeline: [] },
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
        const correct = filteredQuestions.filter((q) => q.studentAnswer === q.answer).length;
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
            stats: buildAggregates(topicQuestions, (q) => getSubtopicLabel(q)),
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

    // Close PDF dropdown on outside click
    useEffect(() => {
        const onDown = (e: MouseEvent) => {
            if (!pdfMenuOpen) return;
            const target = e.target as Node | null;
            if (pdfMenuRef.current && target && !pdfMenuRef.current.contains(target)) {
                setPdfMenuOpen(false);
            }
        };
        window.addEventListener("mousedown", onDown);
        return () => window.removeEventListener("mousedown", onDown);
    }, [pdfMenuOpen]);

    const parseQuestions = (data: any): QuestionEntry[] => {
        if (!data) return [];
        const preguntas = data.preguntas || [];
        return preguntas.map((question: any) => ({
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
                } catch {
                    const text = await response.text();
                    detail = text || null;
                }

                throw { userMessage: message, detail };
            }

            const data = await response.json();
            const qs = parseQuestions(data);

            setQuestions(qs);
            setTopicStats(buildAggregates(qs, (q) => getTopicLabel(q)));
            setSubtopicStats(buildAggregates(qs, (q) => getSubtopicLabel(q)));
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

    // ---------- Collapsible sections (UI) ----------
    const renderPerformanceSection = () => (
        <CollapsibleSection
            id="section-trend"
            title={t("subjectDetail.statistics.chartTitle")} // "Tendencia de respuestas por contenido"
            defaultOpen={true} // ✅ esta empieza desplegada
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
                                            <XAxis dataKey="date" tick={{ fontSize: 12 }} height={20} />
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
            title={t("subjectDetail.statistics.topicBreakdown")} // "Tabla de estadísticas por temas"
            defaultOpen={false}
        >
            {renderAggregateTableContent(topicStats)}
        </CollapsibleSection>
    );

    const renderSubtopicTableSection = () => (
        <CollapsibleSection
            id="section-subtopic-table"
            title={t("subjectDetail.statistics.subtopicBreakdown")} // "Tabla de estadísticas por subtemas"
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
            title={t("subjectDetail.statistics.topicHistogram")} // "Histograma por temas"
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
            title={t("subjectDetail.statistics.subtopicHistogram")} // "Histograma por subtemas"
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
                                            <Tooltip content={({ label, payload }) => renderStackedTooltip(label, payload)} />
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

    // ===================== PDF RENDER (offscreen) =====================
    const pdfRootRef = useRef<HTMLDivElement | null>(null);
    const pdfCoverSummaryRef = useRef<HTMLDivElement | null>(null);
    const pdfSectionRefs = {
        summary: useRef<HTMLDivElement | null>(null),
        trend: useRef<HTMLDivElement | null>(null),
        tableTopics: useRef<HTMLDivElement | null>(null),
        tableSubtopics: useRef<HTMLDivElement | null>(null),
        histTopics: useRef<HTMLDivElement | null>(null),
        histSubtopics: useRef<HTMLDivElement | null>(null),
    };

    const pdfFileName = useMemo(() => {
        const safeSubject = (subjectAcronym || "asignatura").replace(/[^\w\-]+/g, "_");
        const safeStart = (startDate || "inicio").replace(/[^\w\-]+/g, "_");
        const safeEnd = (endDate || "fin").replace(/[^\w\-]+/g, "_");
        return `${safeSubject}_${safeStart}_${safeEnd}_estadisticas.pdf`;
    }, [endDate, startDate, subjectAcronym]);

    const addCanvasToPdfMultiPage = async (pdf: any, canvas: HTMLCanvasElement) => {
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;

        const usableWidth = pageWidth - margin * 2;
        const usableHeight = pageHeight - margin * 2;

        const scale = usableWidth / canvas.width;
        const scaledHeight = canvas.height * scale;

        // If it fits, add directly
        if (scaledHeight <= usableHeight) {
            const imgData = canvas.toDataURL("image/png");
            pdf.addImage(imgData, "PNG", margin, margin, usableWidth, scaledHeight);
            return;
        }

        // Otherwise, slice the canvas by page-height chunks
        const sliceHeightPx = Math.floor(usableHeight / scale);
        let y = 0;

        while (y < canvas.height) {
            const remaining = canvas.height - y;
            const currentSliceHeight = Math.min(sliceHeightPx, remaining);

            const sliceCanvas = document.createElement("canvas");
            sliceCanvas.width = canvas.width;
            sliceCanvas.height = currentSliceHeight;

            const ctx = sliceCanvas.getContext("2d");
            if (!ctx) break;

            ctx.drawImage(
                canvas,
                0,
                y,
                canvas.width,
                currentSliceHeight,
                0,
                0,
                canvas.width,
                currentSliceHeight
            );

            const imgData = sliceCanvas.toDataURL("image/png");
            const sliceScaledHeight = currentSliceHeight * scale;

            pdf.addImage(imgData, "PNG", margin, margin, usableWidth, sliceScaledHeight);

            y += currentSliceHeight;

            if (y < canvas.height) pdf.addPage();
        }
    };

    const generatePdf = async () => {
        try {
            setPdfGenerating(true);
            setPdfMenuOpen(false);

            const { jsPDF } = await import("jspdf");
            const html2canvas = (await import("html2canvas")).default;

            const pdf = new jsPDF("p", "mm", "a4");

            // 1) ✅ Portada + Resumen juntos
            const coverEl = pdfCoverSummaryRef.current;
            if (coverEl) {
                const coverCanvas = await html2canvas(coverEl, {
                    backgroundColor: "#ffffff",
                    scale: 2,
                    useCORS: true,
                    logging: false,
                });

                await addCanvasToPdfMultiPage(pdf, coverCanvas);
            }

            // 2) ✅ Resto de secciones: cada una en su(s) página(s)
            const order: { key: PdfSectionKey; ref: React.RefObject<HTMLDivElement> }[] = [
                { key: "trend", ref: pdfSectionRefs.trend },
                { key: "tableTopics", ref: pdfSectionRefs.tableTopics },
                { key: "tableSubtopics", ref: pdfSectionRefs.tableSubtopics },
                { key: "histTopics", ref: pdfSectionRefs.histTopics },
                { key: "histSubtopics", ref: pdfSectionRefs.histSubtopics },
            ];

            for (const item of order) {
                if (!pdfSections[item.key]) continue;

                const el = item.ref.current;
                if (!el) continue;

                pdf.addPage();

                const canvas = await html2canvas(el, {
                    backgroundColor: "#ffffff",
                    scale: 2,
                    useCORS: true,
                    logging: false,
                });

                await addCanvasToPdfMultiPage(pdf, canvas);
            }

            pdf.save(pdfFileName);
        } catch (e) {
            console.error("PDF generation error:", e);
        } finally {
            setPdfGenerating(false);
        }
    };


    const toggleAllPdfSections = (value: boolean) => {
        setPdfSections({
            summary: value,
            trend: value,
            tableTopics: value,
            tableSubtopics: value,
            histTopics: value,
            histSubtopics: value,
        });
    };

    // Fixed-size charts for PDF (avoid ResponsiveContainer issues in offscreen render)
    const PDF_WIDTH = 820;
    const PDF_INNER_WIDTH = 780;

    const PdfBlock = ({
        title,
        children,
    }: {
        title: string;
        children: ReactNode;
    }) => (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{title}</div>
            </div>
            {children}
        </div>
    );

    const PdfTable = ({ data }: { data: AggregatedStat[] }) => {
        if (data.length === 0) {
            return (
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                    {t("subjectDetail.statistics.noData")}
                </div>
            );
        }

        const headerCell: React.CSSProperties = {
            textAlign: "left",
            padding: "8px 10px",
            borderBottom: "1px solid #e5e7eb",
            fontWeight: 700,
            color: "#111827",
        };

        const cell: React.CSSProperties = {
            padding: "8px 10px",
            borderBottom: "1px solid #f3f4f6",
            color: "#111827",
        };

        const successStyle: React.CSSProperties = {
            ...cell,
            color: "#16A34A",           // verde
            fontWeight: 700,
        };

        const failureStyle: React.CSSProperties = {
            ...cell,
            color: "#DC2626",           // rojo
            fontWeight: 700,
        };

        return (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                    <tr style={{ background: "#f9fafb" }}>
                        <th style={headerCell}>{t("subjectDetail.statistics.name")}</th>
                        <th style={headerCell}>{t("subjectDetail.statistics.answered")}</th>
                        <th style={headerCell}>{t("subjectDetail.statistics.successRate")}</th>
                        <th style={headerCell}>{t("subjectDetail.statistics.failureRate")}</th>
                    </tr>
                </thead>

                <tbody>
                    {data.map((item) => {
                        const successRate = item.total ? Math.round((item.correct / item.total) * 100) : 0;
                        const failureRate = 100 - successRate;

                        return (
                            <tr key={`pdf-row-${item.label}`}>
                                <td style={cell}>{item.label}</td>
                                <td style={{ ...cell, color: "#6b7280" }}>{item.total}</td>

                                {/* ✅ Acierto en verde */}
                                <td style={successStyle}>{successRate}%</td>

                                {/* ✅ Error en rojo */}
                                <td style={failureStyle}>{failureRate}%</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    };

    const PdfOffscreen = () => {
        return (
            <div
                ref={pdfRootRef}
                style={{
                    position: "fixed",
                    left: -10000,
                    top: 0,
                    width: PDF_WIDTH,
                    background: "#ffffff",
                    color: "#111827",
                    padding: 16,
                    zIndex: -1,
                }}
            >
                {/* ✅ Portada + Resumen juntos (en el mismo bloque capturable) */}
                <div ref={pdfCoverSummaryRef}>
                    {/* Portada */}
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 18, fontWeight: 800 }}>AIQuiz · Estadísticas</div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                            Asignatura:{" "}
                            <span style={{ color: "#111827", fontWeight: 600 }}>
                                {subjectAcronym || "-"}
                            </span>
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                            Periodo:{" "}
                            <span style={{ color: "#111827", fontWeight: 600 }}>
                                {startDate} → {endDate}
                            </span>
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                            Modo:{" "}
                            <span style={{ color: "#111827", fontWeight: 600 }}>
                                {chartMode === "topics" ? "Temas" : "Subtemas"}
                            </span>
                            {" · "}
                            Filtro:{" "}
                            <span style={{ color: "#111827", fontWeight: 600 }}>
                                {selectedItem === "all" ? "Todos" : selectedItem}
                            </span>
                        </div>
                    </div>

                    {/* Summary (dentro del mismo bloque que la portada) */}
                    {pdfSections.summary && (
                        <div ref={pdfSectionRefs.summary}>
                            <PdfBlock title="Resumen">
                                <div style={{ display: "flex", gap: 12 }}>
                                    <div
                                        style={{
                                            flex: 1,
                                            border: "1px solid #e5e7eb",
                                            borderRadius: 12,
                                            padding: 12,
                                        }}
                                    >
                                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                                            {t("subjectDetail.statistics.totalAnswered")}
                                        </div>
                                        <div style={{ fontSize: 24, fontWeight: 700 }}>
                                            {displayedSummary.total}
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            flex: 1,
                                            border: "1px solid #e5e7eb",
                                            borderRadius: 12,
                                            padding: 12,
                                        }}
                                    >
                                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                                            {t("subjectDetail.statistics.successPercentage")}
                                        </div>
                                        <div style={{ fontSize: 24, fontWeight: 700 }}>
                                            {displayedSummary.total
                                                ? Math.round(
                                                    (displayedSummary.correct / displayedSummary.total) * 100
                                                )
                                                : 0}
                                            %
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            flex: 1,
                                            border: "1px solid #e5e7eb",
                                            borderRadius: 12,
                                            padding: 12,
                                        }}
                                    >
                                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                                            {t("subjectDetail.statistics.failurePercentage")}
                                        </div>
                                        <div style={{ fontSize: 24, fontWeight: 700 }}>
                                            {displayedSummary.total
                                                ? Math.round(
                                                    (displayedSummary.wrong / displayedSummary.total) * 100
                                                )
                                                : 0}
                                            %
                                        </div>
                                    </div>
                                </div>
                            </PdfBlock>
                        </div>
                    )}
                </div>

                {/* Trend (ya fuera del bloque portada+resumen) */}
                {pdfSections.trend && (
                    <div ref={pdfSectionRefs.trend}>
                        <PdfBlock title="Tendencia de respuestas por contenido">
                            {selectedStats.length === 0 ? (
                                <div style={{ fontSize: 12, color: "#6b7280" }}>
                                    {t("subjectDetail.statistics.noData")}
                                </div>
                            ) : (
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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

                                        return (
                                            <div
                                                key={`pdf-trend-${stat.label}`}
                                                style={{
                                                    border: "1px solid #e5e7eb",
                                                    borderRadius: 12,
                                                    padding: 12,
                                                }}
                                            >
                                                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                                    <div>
                                                        <div style={{ fontWeight: 700 }}>{stat.label}</div>
                                                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                                                            {t("subjectDetail.statistics.chartItemAnswered", { count: stat.total })}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ height: 220, marginTop: 8 }}>
                                                    <LineChart
                                                        width={PDF_INNER_WIDTH / 2 - 30}
                                                        height={220}
                                                        data={chartData}
                                                        margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                                        <XAxis dataKey="date" tick={{ fontSize: 10 }} height={18} />
                                                        <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                                                        <Legend />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="correct"
                                                            name={t("subjectDetail.statistics.correctLine")}
                                                            stroke={LINE_COLORS.correct}
                                                            strokeWidth={2}
                                                            dot={false}
                                                            activeDot={{ r: 0 }}
                                                            isAnimationActive={false}
                                                            animationDuration={0}
                                                        />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="wrong"
                                                            name={t("subjectDetail.statistics.wrongLine")}
                                                            stroke={LINE_COLORS.wrong}
                                                            strokeWidth={2}
                                                            dot={false}
                                                            activeDot={{ r: 0 }}
                                                            isAnimationActive={false}
                                                            animationDuration={0}
                                                        />
                                                    </LineChart>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* ✅ Quité la nota de "solo 6 tarjetas" porque ya no aplica */}
                        </PdfBlock>
                    </div>
                )}

                {/* Tables */}
                {pdfSections.tableTopics && (
                    <div ref={pdfSectionRefs.tableTopics}>
                        <PdfBlock title="Tabla de estadísticas por temas">
                            <PdfTable data={topicStats} />
                        </PdfBlock>
                    </div>
                )}

                {pdfSections.tableSubtopics && (
                    <div ref={pdfSectionRefs.tableSubtopics}>
                        <PdfBlock title="Tabla de estadísticas por subtemas">
                            {subtopicsByTopic.length === 0 ? (
                                <div style={{ fontSize: 12, color: "#6b7280" }}>
                                    {t("subjectDetail.statistics.noData")}
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {subtopicsByTopic.map(({ topic, stats }) => (
                                        <div
                                            key={`pdf-subtopic-table-${topic}`}
                                            style={{
                                                border: "1px solid #e5e7eb",
                                                borderRadius: 12,
                                                padding: 12,
                                            }}
                                        >
                                            <div style={{ fontWeight: 700, marginBottom: 8 }}>{topic}</div>
                                            <PdfTable data={stats} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </PdfBlock>
                    </div>
                )}

                {/* Histograms */}
                {pdfSections.histTopics && (
                    <div ref={pdfSectionRefs.histTopics}>
                        <PdfBlock title="Histograma por temas">
                            {topicStats.length === 0 ? (
                                <div style={{ fontSize: 12, color: "#6b7280" }}>
                                    {t("subjectDetail.statistics.noData")}
                                </div>
                            ) : (
                                <BarChart
                                    width={PDF_INNER_WIDTH}
                                    height={280}
                                    data={topicStats}
                                    margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="label"
                                        tick={{ fontSize: 11 }}
                                        interval={0}
                                        angle={-25}
                                        textAnchor="end"
                                        height={60}
                                        tickFormatter={(value) => truncateAxisLabel(value)}
                                    />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                    <Legend />
                                    <Bar
                                        dataKey="correct"
                                        stackId="topics"
                                        name={t("subjectDetail.statistics.correctShort")}
                                        fill={HISTOGRAM_COLORS.correct}
                                        shape={stackedRoundedShape("correct")}
                                        isAnimationActive={false}
                                        animationDuration={0}
                                    />
                                    <Bar
                                        dataKey="wrong"
                                        stackId="topics"
                                        name={t("subjectDetail.statistics.incorrectShort")}
                                        fill={HISTOGRAM_COLORS.wrong}
                                        shape={stackedRoundedShape("wrong")}
                                        isAnimationActive={false}
                                        animationDuration={0}
                                    />
                                </BarChart>
                            )}
                        </PdfBlock>
                    </div>
                )}

                {pdfSections.histSubtopics && (
                    <div ref={pdfSectionRefs.histSubtopics}>
                        <PdfBlock title="Histograma por subtemas">
                            {subtopicsByTopic.length === 0 ? (
                                <div style={{ fontSize: 12, color: "#6b7280" }}>
                                    {t("subjectDetail.statistics.noData")}
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                    {subtopicsByTopic.map(({ topic, stats }) => (
                                        <div
                                            key={`pdf-subhist-${topic}`}
                                            style={{
                                                border: "1px solid #e5e7eb",
                                                borderRadius: 12,
                                                padding: 12,
                                            }}
                                        >
                                            <div style={{ fontWeight: 700, marginBottom: 8 }}>{topic}</div>
                                            {stats.length === 0 ? (
                                                <div style={{ fontSize: 12, color: "#6b7280" }}>
                                                    {t("subjectDetail.statistics.noData")}
                                                </div>
                                            ) : (
                                                <BarChart
                                                    width={PDF_INNER_WIDTH}
                                                    height={260}
                                                    data={stats}
                                                    margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                                    <XAxis
                                                        dataKey="label"
                                                        tick={{ fontSize: 11 }}
                                                        interval={0}
                                                        angle={-25}
                                                        textAnchor="end"
                                                        height={60}
                                                        tickFormatter={(value) => truncateAxisLabel(value)}
                                                    />
                                                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                                    <Legend />
                                                    <Bar
                                                        dataKey="correct"
                                                        stackId={`pdf-subtopics-${topic}`}
                                                        name={t("subjectDetail.statistics.correctShort")}
                                                        fill={HISTOGRAM_COLORS.correct}
                                                        shape={stackedRoundedShape("correct")}
                                                        isAnimationActive={false}
                                                        animationDuration={0}
                                                    />
                                                    <Bar
                                                        dataKey="wrong"
                                                        stackId={`pdf-subtopics-${topic}`}
                                                        name={t("subjectDetail.statistics.incorrectShort")}
                                                        fill={HISTOGRAM_COLORS.wrong}
                                                        shape={stackedRoundedShape("wrong")}
                                                        isAnimationActive={false}
                                                        animationDuration={0}
                                                    />
                                                </BarChart>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </PdfBlock>
                    </div>
                )}
            </div>
        );
    };

    // ======================================================

    return (
        <div className="space-y-6">
            {/* Offscreen PDF renderer */}
            <PdfOffscreen />

            {/* Filters + Actions */}
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

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchStatistics}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        disabled={loading || pdfGenerating}
                    >
                        {loading ? t("common.loading") : t("subjectDetail.statistics.update")}
                    </button>

                    {/* Download PDF button + dropdown */}
                    <div className="relative" ref={pdfMenuRef}>
                        <button
                            type="button"
                            onClick={() => setPdfMenuOpen((v) => !v)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            disabled={loading || pdfGenerating}
                        >
                            {pdfGenerating ? "Generando..." : "Descargar"}
                            <span className="ml-2 text-xs">▾</span>
                        </button>

                        {pdfMenuOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg p-3 z-30">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-semibold text-gray-900">Secciones del PDF</p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            className="text-xs text-indigo-600 hover:text-indigo-800"
                                            onClick={() => toggleAllPdfSections(true)}
                                        >
                                            Todo
                                        </button>
                                        <button
                                            type="button"
                                            className="text-xs text-indigo-600 hover:text-indigo-800"
                                            onClick={() => toggleAllPdfSections(false)}
                                        >
                                            Nada
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {(
                                        [
                                            { key: "summary", label: "Resumen" },
                                            { key: "trend", label: "Tendencia de respuestas por contenido" },
                                            { key: "tableTopics", label: "Tabla por temas" },
                                            { key: "tableSubtopics", label: "Tabla por subtemas" },
                                            { key: "histTopics", label: "Histograma por temas" },
                                            { key: "histSubtopics", label: "Histograma por subtemas" },
                                        ] as { key: PdfSectionKey; label: string }[]
                                    ).map((s) => (
                                        <label key={`pdf-opt-${s.key}`} className="flex items-center gap-2 text-sm text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={pdfSections[s.key]}
                                                onChange={(e) =>
                                                    setPdfSections((prev) => ({ ...prev, [s.key]: e.target.checked }))
                                                }
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span>{s.label}</span>
                                        </label>
                                    ))}
                                </div>

                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-500 mb-2">
                                        Archivo: <span className="font-mono">{pdfFileName}</span>
                                    </p>
                                    <button
                                        type="button"
                                        onClick={generatePdf}
                                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        disabled={pdfGenerating}
                                    >
                                        {pdfGenerating ? "Generando PDF..." : "Generar PDF"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
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

            {/* Summary cards (UI) */}
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

            {/* Collapsible sections (UI) */}
            {renderPerformanceSection()}
            {renderTopicTableSection()}
            {renderSubtopicTableSection()}
            {renderTopicHistogramSection()}
            {renderSubtopicHistogramSection()}
        </div>
    );
};

export default StatisticsTab;
