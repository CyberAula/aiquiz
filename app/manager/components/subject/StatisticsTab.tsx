"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
    type RefObject,
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

type Summary = { total: number; correct: number; wrong: number };

type StatsVM = {
    side: "A" | "B";
    startDate: string;
    setStartDate: (v: string) => void;
    endDate: string;
    setEndDate: (v: string) => void;

    loading: boolean;
    error: string | null;
    errorDetail: string | null;

    chartMode: "topics" | "subtopics";
    setChartMode: (v: "topics" | "subtopics") => void;

    selectedItem: string;
    setSelectedItem: (v: string) => void;

    availableOptions: AggregatedStat[];
    selectedStats: AggregatedStat[];

    displayedSummary: Summary;

    topicStats: AggregatedStat[];
    subtopicsByTopic: { topic: string; stats: AggregatedStat[] }[];

    onUpdate: () => void;
};

const StatisticsTab = ({ subjectAcronym }: StatisticsTabProps) => {
    const { t } = useManagerTranslation();

    const today = useMemo(() => new Date(), []);
    const weekAgo = useMemo(() => {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        return date;
    }, []);

    // ======================= Column A (original) =======================
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

    // ======================= Compare mode + Column B =======================
    const [compareMode, setCompareMode] = useState(false);

    const [startDateB, setStartDateB] = useState(formatDateInput(weekAgo));
    const [endDateB, setEndDateB] = useState(formatDateInput(today));
    const [loadingB, setLoadingB] = useState(false);
    const [errorB, setErrorB] = useState<string | null>(null);
    const [errorDetailB, setErrorDetailB] = useState<string | null>(null);

    const [questionsB, setQuestionsB] = useState<QuestionEntry[]>([]);
    const [topicStatsB, setTopicStatsB] = useState<AggregatedStat[]>([]);
    const [subtopicStatsB, setSubtopicStatsB] = useState<AggregatedStat[]>([]);

    const [chartModeB, setChartModeB] = useState<"topics" | "subtopics">("subtopics");
    const [selectedItemB, setSelectedItemB] = useState<string>("all");

    // ---- PDF UI state (shared) ----
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
                timeline: Array.from(timelineMap.values()).sort((a, b) =>
                    a.date.localeCompare(b.date)
                ),
            }));

            return aggregates.sort((a, b) => b.total - a.total);
        },
        [t]
    );

    // ---------- Derivados A ----------
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

    const displayedSummary = useMemo<Summary>(() => {
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

    // ---------- Derivados B ----------
    const availableOptionsB = useMemo(
        () => (chartModeB === "topics" ? topicStatsB : subtopicStatsB),
        [chartModeB, subtopicStatsB, topicStatsB]
    );

    const selectedStatsB = useMemo(() => {
        const stats = chartModeB === "topics" ? topicStatsB : subtopicStatsB;
        if (selectedItemB === "all") return stats;
        return stats.filter((stat) => stat.label === selectedItemB);
    }, [chartModeB, selectedItemB, subtopicStatsB, topicStatsB]);

    const filteredQuestionsB = useMemo(() => {
        if (selectedItemB === "all") return questionsB;

        if (chartModeB === "topics") {
            return questionsB.filter((question) => getTopicLabel(question) === selectedItemB);
        }

        return questionsB.filter((question) => getSubtopicLabel(question) === selectedItemB);
    }, [chartModeB, getSubtopicLabel, getTopicLabel, questionsB, selectedItemB]);

    const displayedSummaryB = useMemo<Summary>(() => {
        const total = filteredQuestionsB.length;
        const correct = filteredQuestionsB.filter((q) => q.studentAnswer === q.answer).length;
        return { total, correct, wrong: total - correct };
    }, [filteredQuestionsB]);

    const subtopicsByTopicB = useMemo(() => {
        const groups = new Map<string, QuestionEntry[]>();

        questionsB.forEach((question) => {
            const topicLabel = getTopicLabel(question);
            const bucket = groups.get(topicLabel) || [];
            bucket.push(question);
            groups.set(topicLabel, bucket);
        });

        return Array.from(groups.entries()).map(([topic, topicQuestions]) => ({
            topic,
            stats: buildAggregates(topicQuestions, (q) => getSubtopicLabel(q)),
        }));
    }, [buildAggregates, getSubtopicLabel, getTopicLabel, questionsB]);

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
        fetchStatisticsA();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setSelectedItem("all");
    }, [chartMode]);

    useEffect(() => {
        setSelectedItemB("all");
    }, [chartModeB]);

    useEffect(() => {
        const labels = availableOptions.map((option) => option.label);
        if (selectedItem !== "all" && !labels.includes(selectedItem)) {
            setSelectedItem("all");
        }
    }, [availableOptions, selectedItem]);

    useEffect(() => {
        const labels = availableOptionsB.map((option) => option.label);
        if (selectedItemB !== "all" && !labels.includes(selectedItemB)) {
            setSelectedItemB("all");
        }
    }, [availableOptionsB, selectedItemB]);

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

    // Auto-load B when compare is enabled (first time)
    useEffect(() => {
        if (compareMode && questionsB.length === 0 && !loadingB) {
            fetchStatisticsB();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [compareMode]);

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

    type FetchTarget = {
        startDate: string;
        endDate: string;
        setLoading: (v: boolean) => void;
        setError: (v: string | null) => void;
        setErrorDetail: (v: string | null) => void;
        setQuestions: (v: QuestionEntry[]) => void;
        setTopicStats: (v: AggregatedStat[]) => void;
        setSubtopicStats: (v: AggregatedStat[]) => void;
    };

    const fetchStatisticsCore = async (target: FetchTarget) => {
        try {
            target.setLoading(true);
            target.setError(null);
            target.setErrorDetail(null);

            const params = new URLSearchParams();
            if (subjectAcronym) params.append("asignatura", subjectAcronym);
            if (target.startDate) params.append("fechaInicio", target.startDate);
            if (target.endDate) params.append("fechaFin", target.endDate);

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

            target.setQuestions(qs);
            target.setTopicStats(buildAggregates(qs, (q) => getTopicLabel(q)));
            target.setSubtopicStats(buildAggregates(qs, (q) => getSubtopicLabel(q)));
        } catch (err: any) {
            const fallbackMessage = t("subjectDetail.statistics.error");
            const userMessage = err?.userMessage || fallbackMessage;
            const detail = err?.detail || (err?.message !== userMessage ? err?.message : null);

            target.setError(userMessage);
            target.setErrorDetail(detail && detail !== userMessage ? detail : null);
        } finally {
            target.setLoading(false);
        }
    };

    const fetchStatisticsA = () =>
        fetchStatisticsCore({
            startDate,
            endDate,
            setLoading,
            setError,
            setErrorDetail,
            setQuestions,
            setTopicStats,
            setSubtopicStats,
        });

    const fetchStatisticsB = () =>
        fetchStatisticsCore({
            startDate: startDateB,
            endDate: endDateB,
            setLoading: setLoadingB,
            setError: setErrorB,
            setErrorDetail: setErrorDetailB,
            setQuestions: setQuestionsB,
            setTopicStats: setTopicStatsB,
            setSubtopicStats: setSubtopicStatsB,
        });

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
        );
    };

    // ---------- Collapsible sections (UI) PARAMETRIZADAS ----------
    const renderPerformanceSection = (vm: StatsVM, idPrefix: string) => (
        <CollapsibleSection
            id={`${idPrefix}-section-trend`}
            title={t("subjectDetail.statistics.chartTitle")}
            defaultOpen={true}
        >
            {vm.selectedStats.length === 0 ? (
                <p className="text-sm text-gray-500">{t("subjectDetail.statistics.noData")}</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {vm.selectedStats.map((stat) => {
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
                                key={`${vm.side}-${vm.chartMode}-${stat.label}`}
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
                                        <LineChart
                                            data={chartData}
                                            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                                        >
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

    const renderTopicTableSection = (vm: StatsVM, idPrefix: string) => (
        <CollapsibleSection
            id={`${idPrefix}-section-topic-table`}
            title={t("subjectDetail.statistics.topicBreakdown")}
            defaultOpen={false}
        >
            {renderAggregateTableContent(vm.topicStats)}
        </CollapsibleSection>
    );

    const renderSubtopicTableSection = (vm: StatsVM, idPrefix: string) => (
        <CollapsibleSection
            id={`${idPrefix}-section-subtopic-table`}
            title={t("subjectDetail.statistics.subtopicBreakdown")}
            defaultOpen={false}
        >
            {vm.subtopicsByTopic.length === 0 ? (
                <p className="text-sm text-gray-500">{t("subjectDetail.statistics.noData")}</p>
            ) : (
                <div className="space-y-4">
                    {vm.subtopicsByTopic.map(({ topic, stats }) => (
                        <div key={`${vm.side}-subtopic-table-${topic}`} className="border rounded-lg p-4 bg-gray-50">
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

    const renderTopicHistogramSection = (vm: StatsVM, idPrefix: string) => (
        <CollapsibleSection
            id={`${idPrefix}-section-topic-histogram`}
            title={t("subjectDetail.statistics.topicHistogram")}
            defaultOpen={false}
        >
            {vm.topicStats.length === 0 ? (
                <p className="text-sm text-gray-500">{t("subjectDetail.statistics.noData")}</p>
            ) : (
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={vm.topicStats} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
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
                                stackId={`${vm.side}-topics`}
                                name={t("subjectDetail.statistics.correctShort")}
                                fill={HISTOGRAM_COLORS.correct}
                                shape={stackedRoundedShape("correct")}
                            />
                            <Bar
                                dataKey="wrong"
                                stackId={`${vm.side}-topics`}
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

    const renderSubtopicHistogramSection = (vm: StatsVM, idPrefix: string) => (
        <CollapsibleSection
            id={`${idPrefix}-section-subtopic-histogram`}
            title={t("subjectDetail.statistics.subtopicHistogram")}
            defaultOpen={false}
        >
            {vm.subtopicsByTopic.length === 0 ? (
                <p className="text-sm text-gray-500">{t("subjectDetail.statistics.noData")}</p>
            ) : (
                <div className="space-y-8">
                    {vm.subtopicsByTopic.map(({ topic, stats }) => (
                        <div key={`${vm.side}-hist-${topic}`} className="space-y-3">
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
                                                stackId={`${vm.side}-subtopics-${topic}`}
                                                name={t("subjectDetail.statistics.correctShort")}
                                                fill={HISTOGRAM_COLORS.correct}
                                                shape={stackedRoundedShape("correct")}
                                            />
                                            <Bar
                                                dataKey="wrong"
                                                stackId={`${vm.side}-subtopics-${topic}`}
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

    // normal mode refs
    const pdfCoverSummaryRef = useRef<HTMLDivElement | null>(null);
    const pdfSectionRefs = {
        trend: useRef<HTMLDivElement | null>(null),
        tableTopics: useRef<HTMLDivElement | null>(null),
        tableSubtopics: useRef<HTMLDivElement | null>(null),
        histTopics: useRef<HTMLDivElement | null>(null),
        histSubtopics: useRef<HTMLDivElement | null>(null),
    };

    // compare mode refs
    const pdfCompareCoverSummaryRef = useRef<HTMLDivElement | null>(null);
    const pdfCompareSectionRefs = {
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

        if (!compareMode) return `${safeSubject}_${safeStart}_${safeEnd}_estadisticas.pdf`;

        const safeStartB2 = (startDateB || "inicioB").replace(/[^\w\-]+/g, "_");
        const safeEndB2 = (endDateB || "finB").replace(/[^\w\-]+/g, "_");
        return `${safeSubject}_${safeStart}_${safeEnd}_VS_${safeStartB2}_${safeEndB2}_estadisticas.pdf`;
    }, [compareMode, endDate, startDate, subjectAcronym, startDateB, endDateB]);

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

    const settleForCapture = async () => {
        try {
            // @ts-ignore
            await document.fonts?.ready;
        } catch { }

        await new Promise<void>((r) => requestAnimationFrame(() => r()));
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
        await new Promise<void>((r) => setTimeout(() => r(), 60));
    };

    const generatePdf = async () => {
        try {
            setPdfGenerating(true);
            setPdfMenuOpen(false);

            const { jsPDF } = await import("jspdf");
            const html2canvas = (await import("html2canvas")).default;

            const pdf = new jsPDF("p", "mm", "a4");

            const capture = async (el: HTMLElement) => {
                await settleForCapture();
                return await html2canvas(el, {
                    backgroundColor: "#ffffff",
                    scale: 2,
                    useCORS: true,
                    logging: false,
                });
            };

            if (!compareMode) {
                // 1) Cover+Summary
                const coverEl = pdfCoverSummaryRef.current;
                if (coverEl) {
                    const coverCanvas = await capture(coverEl);
                    await addCanvasToPdfMultiPage(pdf, coverCanvas);
                }

                // 2) Sections
                const order: { key: PdfSectionKey; ref: RefObject<HTMLDivElement> }[] = [
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
                    const canvas = await capture(el);
                    await addCanvasToPdfMultiPage(pdf, canvas);
                }

                pdf.save(pdfFileName);
                return;
            }

            // === Compare mode ===
            const compareCoverEl = pdfCompareCoverSummaryRef.current;
            if (compareCoverEl) {
                const compareCoverCanvas = await capture(compareCoverEl);
                await addCanvasToPdfMultiPage(pdf, compareCoverCanvas);
            }

            const orderCompare: { key: PdfSectionKey; ref: RefObject<HTMLDivElement> }[] = [
                { key: "trend", ref: pdfCompareSectionRefs.trend },
                { key: "tableTopics", ref: pdfCompareSectionRefs.tableTopics },
                { key: "tableSubtopics", ref: pdfCompareSectionRefs.tableSubtopics },
                { key: "histTopics", ref: pdfCompareSectionRefs.histTopics },
                { key: "histSubtopics", ref: pdfCompareSectionRefs.histSubtopics },
            ];

            for (const item of orderCompare) {
                if (!pdfSections[item.key]) continue;
                const el = item.ref.current;
                if (!el) continue;

                pdf.addPage();
                const canvas = await capture(el);
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

    const PDF_GAP = 16;
    const PDF_COL_WIDTH = Math.floor((PDF_WIDTH - PDF_GAP) / 2);
    const PDF_COL_INNER_WIDTH = PDF_COL_WIDTH - 32; // approx (column padding 16)

    const PdfBlock = ({ title, children }: { title: string; children: ReactNode }) => (
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
            color: "#16A34A",
            fontWeight: 700,
        };

        const failureStyle: React.CSSProperties = {
            ...cell,
            color: "#DC2626",
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
                                <td style={successStyle}>{successRate}%</td>
                                <td style={failureStyle}>{failureRate}%</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    };

    const renderPdfTrendGrid = (stats: AggregatedStat[], cardWidth: number, cardHeight: number, columns: 1 | 2) => {
        if (stats.length === 0) {
            return <div style={{ fontSize: 12, color: "#6b7280" }}>{t("subjectDetail.statistics.noData")}</div>;
        }

        const gridTemplateColumns = columns === 2 ? "1fr 1fr" : "1fr";

        return (
            <div style={{ display: "grid", gridTemplateColumns, gap: 12 }}>
                {stats.map((stat) => {
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

                            <div style={{ height: cardHeight, marginTop: 8 }}>
                                <LineChart
                                    width={cardWidth}
                                    height={cardHeight}
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
        );
    };

    const renderPdfHistTopics = (data: AggregatedStat[], width: number, height: number, stackId: string) => {
        if (data.length === 0) {
            return <div style={{ fontSize: 12, color: "#6b7280" }}>{t("subjectDetail.statistics.noData")}</div>;
        }

        return (
            <BarChart width={width} height={height} data={data} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
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
                    stackId={stackId}
                    name={t("subjectDetail.statistics.correctShort")}
                    fill={HISTOGRAM_COLORS.correct}
                    shape={stackedRoundedShape("correct")}
                    isAnimationActive={false}
                    animationDuration={0}
                />
                <Bar
                    dataKey="wrong"
                    stackId={stackId}
                    name={t("subjectDetail.statistics.incorrectShort")}
                    fill={HISTOGRAM_COLORS.wrong}
                    shape={stackedRoundedShape("wrong")}
                    isAnimationActive={false}
                    animationDuration={0}
                />
            </BarChart>
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
                {/* ======================= NORMAL PDF (A) ======================= */}
                <div ref={pdfCoverSummaryRef}>
                    {/* Cover */}
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 18, fontWeight: 800 }}>AIQuiz · Estadísticas</div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                            Asignatura:{" "}
                            <span style={{ color: "#111827", fontWeight: 600 }}>{subjectAcronym || "-"}</span>
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

                    {/* Summary */}
                    {pdfSections.summary && (
                        <PdfBlock title="Resumen">
                            <div style={{ display: "flex", gap: 12 }}>
                                <div style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
                                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                                        {t("subjectDetail.statistics.totalAnswered")}
                                    </div>
                                    <div style={{ fontSize: 24, fontWeight: 700 }}>{displayedSummary.total}</div>
                                </div>

                                <div style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
                                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                                        {t("subjectDetail.statistics.successPercentage")}
                                    </div>
                                    <div style={{ fontSize: 24, fontWeight: 700 }}>
                                        {displayedSummary.total
                                            ? Math.round((displayedSummary.correct / displayedSummary.total) * 100)
                                            : 0}
                                        %
                                    </div>
                                </div>

                                <div style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
                                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                                        {t("subjectDetail.statistics.failurePercentage")}
                                    </div>
                                    <div style={{ fontSize: 24, fontWeight: 700 }}>
                                        {displayedSummary.total
                                            ? Math.round((displayedSummary.wrong / displayedSummary.total) * 100)
                                            : 0}
                                        %
                                    </div>
                                </div>
                            </div>
                        </PdfBlock>
                    )}
                </div>

                {/* Trend */}
                {pdfSections.trend && (
                    <div ref={pdfSectionRefs.trend}>
                        <PdfBlock title="Tendencia de respuestas por contenido">
                            {renderPdfTrendGrid(selectedStats, Math.floor(PDF_INNER_WIDTH / 2) - 30, 220, 2)}
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
                                <div style={{ fontSize: 12, color: "#6b7280" }}>{t("subjectDetail.statistics.noData")}</div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {subtopicsByTopic.map(({ topic, stats }) => (
                                        <div key={`pdf-subtopic-table-${topic}`} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
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
                            {renderPdfHistTopics(topicStats, PDF_INNER_WIDTH, 280, "topics")}
                        </PdfBlock>
                    </div>
                )}

                {pdfSections.histSubtopics && (
                    <div ref={pdfSectionRefs.histSubtopics}>
                        <PdfBlock title="Histograma por subtemas">
                            {subtopicsByTopic.length === 0 ? (
                                <div style={{ fontSize: 12, color: "#6b7280" }}>{t("subjectDetail.statistics.noData")}</div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                    {subtopicsByTopic.map(({ topic, stats }) => (
                                        <div key={`pdf-subhist-${topic}`} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
                                            <div style={{ fontWeight: 700, marginBottom: 8 }}>{topic}</div>
                                            {stats.length === 0 ? (
                                                <div style={{ fontSize: 12, color: "#6b7280" }}>{t("subjectDetail.statistics.noData")}</div>
                                            ) : (
                                                renderPdfHistTopics(stats, PDF_INNER_WIDTH, 260, `pdf-subtopics-${topic}`)
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </PdfBlock>
                    </div>
                )}

                {/* ======================= COMPARE PDF (A vs B) ======================= */}
                {compareMode && (
                    <>
                        <div style={{ height: 1 }} />

                        {/* Cover+Summary compare */}
                        <div
                            ref={pdfCompareCoverSummaryRef}
                            style={{ display: "flex", gap: PDF_GAP, alignItems: "flex-start" }}
                        >
                            <div style={{ width: PDF_COL_WIDTH }}>
                                <div style={{ marginBottom: 10 }}>
                                    <div style={{ fontSize: 16, fontWeight: 800 }}>AIQuiz · Comparación</div>
                                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                                        Asignatura:{" "}
                                        <span style={{ color: "#111827", fontWeight: 600 }}>{subjectAcronym || "-"}</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                                        Periodo A:{" "}
                                        <span style={{ color: "#111827", fontWeight: 600 }}>
                                            {startDate} → {endDate}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                                        Modo A:{" "}
                                        <span style={{ color: "#111827", fontWeight: 600 }}>
                                            {chartMode === "topics" ? "Temas" : "Subtemas"}
                                        </span>
                                        {" · "}
                                        Filtro A:{" "}
                                        <span style={{ color: "#111827", fontWeight: 600 }}>
                                            {selectedItem === "all" ? "Todos" : selectedItem}
                                        </span>
                                    </div>
                                </div>

                                {pdfSections.summary && (
                                    <PdfBlock title="Resumen (A)">
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <div style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 10, padding: 10 }}>
                                                <div style={{ fontSize: 11, color: "#6b7280" }}>{t("subjectDetail.statistics.totalAnswered")}</div>
                                                <div style={{ fontSize: 18, fontWeight: 800 }}>{displayedSummary.total}</div>
                                            </div>
                                            <div style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 10, padding: 10 }}>
                                                <div style={{ fontSize: 11, color: "#6b7280" }}>{t("subjectDetail.statistics.successPercentage")}</div>
                                                <div style={{ fontSize: 18, fontWeight: 800 }}>
                                                    {displayedSummary.total ? Math.round((displayedSummary.correct / displayedSummary.total) * 100) : 0}%
                                                </div>
                                            </div>
                                            <div style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 10, padding: 10 }}>
                                                <div style={{ fontSize: 11, color: "#6b7280" }}>{t("subjectDetail.statistics.failurePercentage")}</div>
                                                <div style={{ fontSize: 18, fontWeight: 800 }}>
                                                    {displayedSummary.total ? Math.round((displayedSummary.wrong / displayedSummary.total) * 100) : 0}%
                                                </div>
                                            </div>
                                        </div>
                                    </PdfBlock>
                                )}
                            </div>

                            <div style={{ width: PDF_COL_WIDTH }}>
                                <div style={{ marginBottom: 10 }}>
                                    <div style={{ fontSize: 16, fontWeight: 800 }}>&nbsp;</div>
                                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>&nbsp;</div>
                                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                                        Periodo B:{" "}
                                        <span style={{ color: "#111827", fontWeight: 600 }}>
                                            {startDateB} → {endDateB}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                                        Modo B:{" "}
                                        <span style={{ color: "#111827", fontWeight: 600 }}>
                                            {chartModeB === "topics" ? "Temas" : "Subtemas"}
                                        </span>
                                        {" · "}
                                        Filtro B:{" "}
                                        <span style={{ color: "#111827", fontWeight: 600 }}>
                                            {selectedItemB === "all" ? "Todos" : selectedItemB}
                                        </span>
                                    </div>
                                </div>

                                {pdfSections.summary && (
                                    <PdfBlock title="Resumen (B)">
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <div style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 10, padding: 10 }}>
                                                <div style={{ fontSize: 11, color: "#6b7280" }}>{t("subjectDetail.statistics.totalAnswered")}</div>
                                                <div style={{ fontSize: 18, fontWeight: 800 }}>{displayedSummaryB.total}</div>
                                            </div>
                                            <div style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 10, padding: 10 }}>
                                                <div style={{ fontSize: 11, color: "#6b7280" }}>{t("subjectDetail.statistics.successPercentage")}</div>
                                                <div style={{ fontSize: 18, fontWeight: 800 }}>
                                                    {displayedSummaryB.total ? Math.round((displayedSummaryB.correct / displayedSummaryB.total) * 100) : 0}%
                                                </div>
                                            </div>
                                            <div style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 10, padding: 10 }}>
                                                <div style={{ fontSize: 11, color: "#6b7280" }}>{t("subjectDetail.statistics.failurePercentage")}</div>
                                                <div style={{ fontSize: 18, fontWeight: 800 }}>
                                                    {displayedSummaryB.total ? Math.round((displayedSummaryB.wrong / displayedSummaryB.total) * 100) : 0}%
                                                </div>
                                            </div>
                                        </div>
                                    </PdfBlock>
                                )}
                            </div>
                        </div>

                        {/* Trend compare */}
                        {pdfSections.trend && (
                            <div ref={pdfCompareSectionRefs.trend} style={{ display: "flex", gap: PDF_GAP, alignItems: "flex-start" }}>
                                <div style={{ width: PDF_COL_WIDTH }}>
                                    <PdfBlock title="Tendencia (A)">
                                        {renderPdfTrendGrid(selectedStats, PDF_COL_INNER_WIDTH, 200, 1)}
                                    </PdfBlock>
                                </div>
                                <div style={{ width: PDF_COL_WIDTH }}>
                                    <PdfBlock title="Tendencia (B)">
                                        {renderPdfTrendGrid(selectedStatsB, PDF_COL_INNER_WIDTH, 200, 1)}
                                    </PdfBlock>
                                </div>
                            </div>
                        )}

                        {/* Tables compare */}
                        {pdfSections.tableTopics && (
                            <div ref={pdfCompareSectionRefs.tableTopics} style={{ display: "flex", gap: PDF_GAP, alignItems: "flex-start" }}>
                                <div style={{ width: PDF_COL_WIDTH }}>
                                    <PdfBlock title="Tabla por temas (A)">
                                        <PdfTable data={topicStats} />
                                    </PdfBlock>
                                </div>
                                <div style={{ width: PDF_COL_WIDTH }}>
                                    <PdfBlock title="Tabla por temas (B)">
                                        <PdfTable data={topicStatsB} />
                                    </PdfBlock>
                                </div>
                            </div>
                        )}

                        {pdfSections.tableSubtopics && (
                            <div ref={pdfCompareSectionRefs.tableSubtopics} style={{ display: "flex", gap: PDF_GAP, alignItems: "flex-start" }}>
                                <div style={{ width: PDF_COL_WIDTH }}>
                                    <PdfBlock title="Tabla por subtemas (A)">
                                        {subtopicsByTopic.length === 0 ? (
                                            <div style={{ fontSize: 12, color: "#6b7280" }}>{t("subjectDetail.statistics.noData")}</div>
                                        ) : (
                                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                                {subtopicsByTopic.map(({ topic, stats }) => (
                                                    <div key={`pdfA-subtopic-${topic}`} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
                                                        <div style={{ fontWeight: 700, marginBottom: 8 }}>{topic}</div>
                                                        <PdfTable data={stats} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </PdfBlock>
                                </div>

                                <div style={{ width: PDF_COL_WIDTH }}>
                                    <PdfBlock title="Tabla por subtemas (B)">
                                        {subtopicsByTopicB.length === 0 ? (
                                            <div style={{ fontSize: 12, color: "#6b7280" }}>{t("subjectDetail.statistics.noData")}</div>
                                        ) : (
                                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                                {subtopicsByTopicB.map(({ topic, stats }) => (
                                                    <div key={`pdfB-subtopic-${topic}`} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
                                                        <div style={{ fontWeight: 700, marginBottom: 8 }}>{topic}</div>
                                                        <PdfTable data={stats} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </PdfBlock>
                                </div>
                            </div>
                        )}

                        {/* Histograms compare */}
                        {pdfSections.histTopics && (
                            <div ref={pdfCompareSectionRefs.histTopics} style={{ display: "flex", gap: PDF_GAP, alignItems: "flex-start" }}>
                                <div style={{ width: PDF_COL_WIDTH }}>
                                    <PdfBlock title="Histograma por temas (A)">
                                        {renderPdfHistTopics(topicStats, PDF_COL_INNER_WIDTH, 260, "cmp-topics-A")}
                                    </PdfBlock>
                                </div>
                                <div style={{ width: PDF_COL_WIDTH }}>
                                    <PdfBlock title="Histograma por temas (B)">
                                        {renderPdfHistTopics(topicStatsB, PDF_COL_INNER_WIDTH, 260, "cmp-topics-B")}
                                    </PdfBlock>
                                </div>
                            </div>
                        )}

                        {pdfSections.histSubtopics && (
                            <div ref={pdfCompareSectionRefs.histSubtopics} style={{ display: "flex", gap: PDF_GAP, alignItems: "flex-start" }}>
                                <div style={{ width: PDF_COL_WIDTH }}>
                                    <PdfBlock title="Histograma por subtemas (A)">
                                        {subtopicsByTopic.length === 0 ? (
                                            <div style={{ fontSize: 12, color: "#6b7280" }}>{t("subjectDetail.statistics.noData")}</div>
                                        ) : (
                                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                                {subtopicsByTopic.map(({ topic, stats }) => (
                                                    <div key={`pdfA-subhist-${topic}`} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
                                                        <div style={{ fontWeight: 700, marginBottom: 8 }}>{topic}</div>
                                                        {stats.length === 0 ? (
                                                            <div style={{ fontSize: 12, color: "#6b7280" }}>{t("subjectDetail.statistics.noData")}</div>
                                                        ) : (
                                                            renderPdfHistTopics(stats, PDF_COL_INNER_WIDTH, 240, `cmp-sub-A-${topic}`)
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </PdfBlock>
                                </div>

                                <div style={{ width: PDF_COL_WIDTH }}>
                                    <PdfBlock title="Histograma por subtemas (B)">
                                        {subtopicsByTopicB.length === 0 ? (
                                            <div style={{ fontSize: 12, color: "#6b7280" }}>{t("subjectDetail.statistics.noData")}</div>
                                        ) : (
                                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                                {subtopicsByTopicB.map(({ topic, stats }) => (
                                                    <div key={`pdfB-subhist-${topic}`} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
                                                        <div style={{ fontWeight: 700, marginBottom: 8 }}>{topic}</div>
                                                        {stats.length === 0 ? (
                                                            <div style={{ fontSize: 12, color: "#6b7280" }}>{t("subjectDetail.statistics.noData")}</div>
                                                        ) : (
                                                            renderPdfHistTopics(stats, PDF_COL_INNER_WIDTH, 240, `cmp-sub-B-${topic}`)
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </PdfBlock>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

    // ===================== ViewModels for UI =====================
    const vmA: StatsVM = {
        side: "A",
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        loading,
        error,
        errorDetail,
        chartMode,
        setChartMode,
        selectedItem,
        setSelectedItem,
        availableOptions,
        selectedStats,
        displayedSummary,
        topicStats,
        subtopicsByTopic,
        onUpdate: fetchStatisticsA,
    };

    const vmB: StatsVM = {
        side: "B",
        startDate: startDateB,
        setStartDate: setStartDateB,
        endDate: endDateB,
        setEndDate: setEndDateB,
        loading: loadingB,
        error: errorB,
        errorDetail: errorDetailB,
        chartMode: chartModeB,
        setChartMode: setChartModeB,
        selectedItem: selectedItemB,
        setSelectedItem: setSelectedItemB,
        availableOptions: availableOptionsB,
        selectedStats: selectedStatsB,
        displayedSummary: displayedSummaryB,
        topicStats: topicStatsB,
        subtopicsByTopic: subtopicsByTopicB,
        onUpdate: fetchStatisticsB,
    };

    const renderColumn = (vm: StatsVM, opts: { showPdf: boolean; showCompareBtn: boolean }) => {
        const disabledAll = vm.loading || pdfGenerating || (vm.side === "A" ? false : loading);

        return (
            <div className="space-y-6">
                {/* Filters + Actions */}
                <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-4 space-y-4 lg:space-y-0">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("subjectDetail.statistics.startDate")}
                        </label>
                        <input
                            type="date"
                            value={vm.startDate}
                            onChange={(e) => vm.setStartDate(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            disabled={pdfGenerating}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("subjectDetail.statistics.endDate")}
                        </label>
                        <input
                            type="date"
                            value={vm.endDate}
                            onChange={(e) => vm.setEndDate(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            disabled={pdfGenerating}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={vm.onUpdate}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            disabled={disabledAll}
                        >
                            {vm.loading ? t("common.loading") : t("subjectDetail.statistics.update")}
                        </button>

                        {opts.showCompareBtn && (
                            <button
                                type="button"
                                onClick={() => setCompareMode((v) => !v)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                disabled={loading || pdfGenerating || loadingB}
                            >
                                {compareMode ? "Cerrar comparación" : "Comparar"}
                            </button>
                        )}

                        {opts.showPdf && (
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
                        )}
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
                            value={vm.chartMode}
                            onChange={(event) => vm.setChartMode(event.target.value as "topics" | "subtopics")}
                            disabled={pdfGenerating}
                        >
                            <option value="topics">{t("subjectDetail.statistics.topicsOption")}</option>
                            <option value="subtopics">{t("subjectDetail.statistics.subtopicsOption")}</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-gray-700">
                            {vm.chartMode === "topics"
                                ? t("subjectDetail.statistics.topicSelectorLabel")
                                : t("subjectDetail.statistics.subtopicSelectorLabel")}
                        </label>
                        <select
                            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={vm.selectedItem}
                            onChange={(event) => vm.setSelectedItem(event.target.value)}
                            disabled={pdfGenerating}
                        >
                            <option value="all">
                                {vm.chartMode === "topics"
                                    ? t("subjectDetail.statistics.allTopicsOption")
                                    : t("subjectDetail.statistics.allSubtopicsOption")}
                            </option>
                            {vm.availableOptions.map((option) => (
                                <option key={`${vm.side}-${vm.chartMode}-${option.label}`} value={option.label}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Error */}
                {vm.error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    {t("subjectDetail.statistics.error")}
                                </h3>
                                {vm.errorDetail && (
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>{vm.errorDetail}</p>
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
                            {vm.displayedSummary.total}
                        </dd>
                    </div>
                    <div className="bg-white shadow rounded-lg p-4">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                            {t("subjectDetail.statistics.successPercentage")}
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold text-green-600">
                            {vm.displayedSummary.total
                                ? Math.round((vm.displayedSummary.correct / vm.displayedSummary.total) * 100)
                                : 0}
                            %
                        </dd>
                    </div>
                    <div className="bg-white shadow rounded-lg p-4">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                            {t("subjectDetail.statistics.failurePercentage")}
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold text-red-600">
                            {vm.displayedSummary.total
                                ? Math.round((vm.displayedSummary.wrong / vm.displayedSummary.total) * 100)
                                : 0}
                            %
                        </dd>
                    </div>
                </div>

                {/* Collapsible sections (UI) */}
                {renderPerformanceSection(vm, vm.side)}
                {renderTopicTableSection(vm, vm.side)}
                {renderSubtopicTableSection(vm, vm.side)}
                {renderTopicHistogramSection(vm, vm.side)}
                {renderSubtopicHistogramSection(vm, vm.side)}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Offscreen PDF renderer */}
            <PdfOffscreen />

            {/* Two-column compare layout */}
            <div className={compareMode ? "grid grid-cols-1 xl:grid-cols-2 gap-6" : "space-y-6"}>
                {/* Column A */}
                {renderColumn(vmA, { showPdf: true, showCompareBtn: true })}

                {/* Column B */}
                {compareMode ? (
                    <div>
                        <div className="text-sm font-semibold text-gray-700 mb-2">Comparación (B)</div>
                        {renderColumn(vmB, { showPdf: false, showCompareBtn: false })}
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default StatisticsTab;
