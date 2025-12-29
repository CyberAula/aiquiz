"use client";

import { useEffect, useMemo, useState } from "react";
import { useManagerTranslation } from "../../hooks/useManagerTranslation";
import useApiRequest from "../../hooks/useApiRequest";

interface CorrectionQuestion {
    _id: string;
    text?: string;
    query?: string;
    choices: Array<{ text: string; isCorrect?: boolean } | string>;
    answer?: number;
    studentAnswer?: number;
    teacherComments?: string[];
    createdAt?: string;
    correctedQuestion?: boolean;
    professorAnswer?: number;
}

interface CorrectionsTabProps {
    subjectId: string;
    subjectAcronym?: string;
}

const REASONS_KEYS = [
    "subjectDetail.corrections.reasons.wrongAnswer",
    "subjectDetail.corrections.reasons.badStatement",
    "subjectDetail.corrections.reasons.incompleteOptions",
    "subjectDetail.corrections.reasons.offTopic",
];

const CorrectionsTab: React.FC<CorrectionsTabProps> = ({ subjectId }) => {
    const { t } = useManagerTranslation();

    const [activeSection, setActiveSection] = useState<"reported" | "corrected">(
        "reported"
    );
    const [sectionData, setSectionData] = useState<{
        reported: CorrectionQuestion[];
        corrected: CorrectionQuestion[];
    }>({ reported: [], corrected: [] });
    const [loadingSection, setLoadingSection] = useState<boolean>(false);
    const [loadedSections, setLoadedSections] = useState({
        reported: false,
        corrected: false,
    });
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [modalQuestion, setModalQuestion] = useState<CorrectionQuestion | null>(
        null
    );
    const [markAsCorrect, setMarkAsCorrect] = useState<boolean>(true);
    const [selectedReason, setSelectedReason] = useState<string>("");
    const [customReason, setCustomReason] = useState<string>("");
    const [selectedProfessorAnswer, setSelectedProfessorAnswer] = useState<number>(-1);
    const [feedback, setFeedback] = useState<string>("");
    const [saving, setSaving] = useState<boolean>(false);
    const [deleting, setDeleting] = useState<boolean>(false);
    const [downloading, setDownloading] = useState<boolean>(false);

    const { makeRequest: fetchCorrections } = useApiRequest(
        `/aiquiz/api/manager/subjects/${subjectId}/corrections?status=reported`,
        "GET",
        null,
        false
    );

    const { makeRequest: updateCorrection } = useApiRequest(
        `/aiquiz/api/manager/subjects/${subjectId}/corrections`,
        "PATCH",
        null,
        false
    );

    const { makeRequest: deleteCorrections } = useApiRequest(
        `/aiquiz/api/manager/subjects/${subjectId}/corrections`,
        "DELETE",
        null,
        false
    );

    const { makeRequest: downloadCorrections } = useApiRequest(
        `/aiquiz/api/manager/subjects/${subjectId}/corrections/download`,
        "POST",
        null,
        false
    );

    const reasonOptions = useMemo(
        () =>
            REASONS_KEYS.map(
                (key, index) =>
                    t(key) ||
                    [
                        "Respuesta correcta incorrecta",
                        "Enunciado confuso o con erratas",
                        "Opciones incompletas o ambiguas",
                        "Contenido fuera del temario",
                    ][index]
            ),
        [t]
    );

    const currentQuestions = sectionData[activeSection] || [];

    const loadSection = async (section: "reported" | "corrected") => {
        setLoadingSection(true);
        try {
            const response = await fetchCorrections(
                null,
                true,
                `/aiquiz/api/manager/subjects/${subjectId}/corrections?status=${section}`
            );

            if (response?.questions) {
                setSectionData((prev) => ({
                    ...prev,
                    [section]: response.questions,
                }));
                setLoadedSections((prev) => ({ ...prev, [section]: true }));
            }
        } catch (error) {
            console.error("Error cargando correcciones", error);
        } finally {
            setLoadingSection(false);
        }
    };

    const handleSectionChange = (section: "reported" | "corrected") => {
        setActiveSection(section);
        if (!loadedSections[section]) {
            loadSection(section);
        }
    };

    useEffect(() => {
        loadSection("reported");
    }, []);

    useEffect(() => {
        setSelectedIds(new Set());
    }, [activeSection]);

    const toggleSelection = (id: string) => {
        setSelectedIds((prev) => {
            const updated = new Set(prev);
            if (updated.has(id)) {
                updated.delete(id);
            } else {
                updated.add(id);
            }
            return updated;
        });
    };

    const toggleAll = () => {
        if (currentQuestions.length === 0) return;
        const allSelected = selectedIds.size === currentQuestions.length;
        if (allSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(currentQuestions.map((q) => q._id)));
        }
    };

    const openQuestionModal = (question: CorrectionQuestion) => {
        setModalQuestion(question);
        setMarkAsCorrect(!question.correctedQuestion);
        setSelectedReason("");
        setCustomReason("");
        setFeedback("");
        setSelectedProfessorAnswer(
            typeof question.professorAnswer === "number" ? question.professorAnswer : -1
        );
    };

    const handleUpdateCorrection = async () => {
        if (!modalQuestion) return;

        if (!markAsCorrect && selectedProfessorAnswer < 0) {
            setFeedback(
                t("subjectDetail.corrections.selectProfessorAnswer") ||
                "Selecciona la respuesta correcta"
            );
            return;
        }

        if (!markAsCorrect && !selectedReason && !customReason.trim()) {
            setFeedback(
                t("subjectDetail.corrections.selectReason") ||
                "Selecciona o escribe un motivo"
            );
            return;
        }

        try {
            setSaving(true);
            setFeedback("");

            const response = await updateCorrection({
                questionId: modalQuestion._id,
                isCorrect: markAsCorrect,
                reason: selectedReason,
                customReason,
                professorAnswer: markAsCorrect ? -1 : selectedProfessorAnswer,
            });

            if (response?.question) {
                const updatedQuestion: CorrectionQuestion = response.question;
                setSectionData((prev) => {
                    const updatedReported = prev.reported.filter(
                        (question) => question._id !== updatedQuestion._id
                    );
                    const updatedCorrected = updatedQuestion.correctedQuestion
                        ? [
                            updatedQuestion,
                            ...prev.corrected.filter(
                                (question) =>
                                    question._id !== updatedQuestion._id
                            ),
                        ]
                        : prev.corrected.filter(
                            (question) => question._id !== updatedQuestion._id
                        );

                    return {
                        reported: updatedReported,
                        corrected: updatedCorrected,
                    };
                });
            } else {
                await loadSection("reported");
                await loadSection("corrected");
            }

            setModalQuestion(null);
        } catch (error: any) {
            setFeedback(error?.message || "No se pudo actualizar la corrección");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteSelected = async () => {
        const ids = Array.from(selectedIds);
        if (ids.length === 0) return;

        try {
            setDeleting(true);
            await deleteCorrections({ ids });
            await loadSection(activeSection);
            setSelectedIds(new Set());
        } catch (error) {
            console.error("Error eliminando preguntas", error);
        } finally {
            setDeleting(false);
        }
    };

    const handleDownloadSelected = async () => {
        const ids = Array.from(selectedIds);
        if (ids.length === 0) return;

        try {
            setDownloading(true);
            await downloadCorrections({ questionIds: ids });
        } catch (error) {
            console.error("Error descargando correcciones", error);
        } finally {
            setDownloading(false);
        }
    };

    const renderChoices = (question: CorrectionQuestion) => (
        <div className="space-y-2">
            {question.choices?.map((choice, index) => {
                const choiceText = typeof choice === "string" ? choice : choice.text;
                const isCorrectChoice =
                    typeof choice === "string"
                        ? question.answer === index
                        : choice.isCorrect;
                const isStudentAnswer = question.studentAnswer === index;
                const isProfessorAnswer = question.professorAnswer === index;

                return (
                    <div
                        key={`${question._id}-${index}`}
                        className={`rounded-md border px-3 py-2 ${isCorrectChoice
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200"
                            } ${isStudentAnswer ? "ring-2 ring-blue-400" : ""}`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="font-medium text-gray-800">
                                {String.fromCharCode(65 + index)}. {choiceText}
                            </div>
                            <div className="flex flex-col items-end gap-1 text-right text-sm font-semibold">
                                {isCorrectChoice && (
                                    <span className="text-green-700">
                                        {t("subjectDetail.corrections.correctAnswer") ||
                                            "Respuesta correcta"}
                                    </span>
                                )}
                                {isProfessorAnswer && (
                                    <span className="text-indigo-700">
                                        {t("subjectDetail.corrections.professorAnswer") ||
                                            "Corrección del profesor"}
                                    </span>
                                )}
                            </div>
                        </div>
                        {isStudentAnswer && (
                            <div className="mt-1 text-sm text-blue-700">
                                {t("subjectDetail.corrections.studentSelected") ||
                                    "Opción marcada por el alumno"}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );

    return (
        <div>
            <div className="mb-4 flex gap-3">
                <button
                    onClick={() => handleSectionChange("reported")}
                    className={`rounded-md px-4 py-2 text-sm font-semibold ${activeSection === "reported"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700"
                        }`}
                >
                    {t("subjectDetail.corrections.reported") || "Reportadas"}
                </button>
                <button
                    onClick={() => handleSectionChange("corrected")}
                    className={`rounded-md px-4 py-2 text-sm font-semibold ${activeSection === "corrected"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700"
                        }`}
                >
                    {t("subjectDetail.corrections.corrected") || "Corregidas"}
                </button>
            </div>

            <div className="mb-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                    {activeSection === "reported"
                        ? t("subjectDetail.corrections.reportedHelper") ||
                        "Últimas 25 preguntas reportadas por los alumnos"
                        : t("subjectDetail.corrections.correctedHelper") ||
                        "Preguntas revisadas más recientes"}
                </div>
                <div className="flex gap-2">
                    {activeSection === "corrected" && (
                        <button
                            onClick={handleDownloadSelected}
                            disabled={selectedIds.size === 0 || downloading}
                            className={`rounded-md px-3 py-2 text-sm font-semibold text-white ${selectedIds.size === 0 || downloading
                                ? "bg-gray-400"
                                : "bg-emerald-600 hover:bg-emerald-700"
                                }`}
                        >
                            {downloading
                                ? t("subjectDetail.corrections.downloading") || "Descargando..."
                                : t("subjectDetail.corrections.downloadPdf") ||
                                "Descargar PDF"}
                        </button>
                    )}
                    <button
                        onClick={handleDeleteSelected}
                        disabled={selectedIds.size === 0 || deleting}
                        className={`rounded-md px-3 py-2 text-sm font-semibold text-white ${selectedIds.size === 0 || deleting
                            ? "bg-gray-400"
                            : "bg-red-600 hover:bg-red-700"
                            }`}
                    >
                        {deleting
                            ? t("subjectDetail.corrections.deleting") || "Eliminando..."
                            : t("subjectDetail.corrections.deleteSelected") ||
                            "Eliminar seleccionadas"}
                    </button>
                </div>
            </div>

            <div className="mb-3 flex items-center gap-3 text-sm text-gray-600">
                <input
                    type="checkbox"
                    checked={currentQuestions.length > 0 && selectedIds.size === currentQuestions.length}
                    onChange={toggleAll}
                />
                <span>
                    {t("subjectDetail.corrections.selectAll") || "Seleccionar todas"}
                </span>
            </div>

            {loadingSection ? (
                <div className="rounded-md border border-gray-200 bg-white p-6 text-center text-gray-600">
                    {t("subjectDetail.corrections.loading") || "Cargando preguntas..."}
                </div>
            ) : currentQuestions.length === 0 ? (
                <div className="rounded-md border border-gray-200 bg-white p-6 text-center text-gray-600">
                    {activeSection === "reported"
                        ? t("subjectDetail.corrections.noReported") ||
                        "No hay preguntas reportadas pendientes"
                        : t("subjectDetail.corrections.noCorrected") ||
                        "No hay preguntas corregidas"}
                </div>
            ) : (
                <div className="space-y-3">
                    {currentQuestions.map((question) => (
                        <div
                            key={question._id}
                            className="flex items-start gap-3 rounded-md border border-gray-200 bg-white p-4 shadow-sm"
                        >
                            <input
                                type="checkbox"
                                checked={selectedIds.has(question._id)}
                                onChange={() => toggleSelection(question._id)}
                                className="mt-1"
                            />
                            <div className="flex-1">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="text-base font-semibold text-gray-900">
                                            {question.text || question.query}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {question.createdAt
                                            ? new Date(question.createdAt).toLocaleDateString()
                                            : ""}
                                    </div>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${activeSection === "corrected"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-yellow-100 text-yellow-800"
                                        }`}>
                                        {activeSection === "corrected"
                                            ? t("subjectDetail.corrections.corrected") ||
                                            "Corregida"
                                            : t("subjectDetail.corrections.reportedTag") ||
                                            "Reportada"}
                                    </span>
                                    {question.teacherComments?.length > 0 && (
                                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                                            {t("subjectDetail.corrections.commentTag") || "Comentada"}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-3 flex justify-end">
                                    <button
                                        onClick={() => openQuestionModal(question)}
                                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                                    >
                                        {activeSection === "reported"
                                            ? t("subjectDetail.corrections.reviewButton") ||
                                            "Revisar"
                                            : t("subjectDetail.corrections.viewButton") ||
                                            "Ver"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modalQuestion && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
                    <div className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-lg">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {modalQuestion.text || modalQuestion.query}
                                </h3>
                            </div>
                            <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => setModalQuestion(null)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mt-4 space-y-3">
                            {renderChoices(modalQuestion)}

                            <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-700">
                                <strong>{t("subjectDetail.corrections.studentAnswer") || "Respuesta del alumno"}:</strong>{" "}
                                {typeof modalQuestion.studentAnswer === "number" &&
                                    modalQuestion.studentAnswer >= 0 ? (
                                    <span className="font-semibold text-blue-700">
                                        {String.fromCharCode(65 + (modalQuestion.studentAnswer || 0))}
                                    </span>
                                ) : (
                                    <span className="text-gray-600">
                                        {t("subjectDetail.corrections.noStudentAnswer") ||
                                            "El alumno no ha respondido"}
                                    </span>
                                )}
                            </div>

                            {activeSection === "reported" && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setMarkAsCorrect(true)}
                                        className={`rounded-md px-4 py-2 text-sm font-semibold ${markAsCorrect
                                            ? "bg-green-600 text-white"
                                            : "bg-gray-100 text-gray-800"
                                            }`}
                                    >
                                        {t("subjectDetail.corrections.markAsGood") || "Está bien"}
                                    </button>
                                    <button
                                        onClick={() => setMarkAsCorrect(false)}
                                        className={`rounded-md px-4 py-2 text-sm font-semibold ${!markAsCorrect
                                            ? "bg-red-600 text-white"
                                            : "bg-gray-100 text-gray-800"
                                            }`}
                                    >
                                        {t("subjectDetail.corrections.markAsBad") || "Está mal"}
                                    </button>
                                </div>
                            )}

                            {!markAsCorrect && activeSection === "reported" && (
                                <div className="mt-3">
                                    <p className="text-sm font-semibold text-gray-800">
                                        {t("subjectDetail.corrections.pickCorrectAnswer") ||
                                            "Selecciona la respuesta correcta"}
                                    </p>
                                    <div className="mt-2 space-y-2">
                                        {modalQuestion.choices?.map((choice, index) => {
                                            const choiceText =
                                                typeof choice === "string" ? choice : choice.text;
                                            return (
                                                <button
                                                    key={`${modalQuestion._id}-professor-${index}`}
                                                    type="button"
                                                    onClick={() => setSelectedProfessorAnswer(index)}
                                                    className={`w-full rounded-md border px-3 py-2 text-left text-sm font-medium ${selectedProfessorAnswer === index
                                                        ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                                                        : "border-gray-200 text-gray-800 hover:border-indigo-300"
                                                        }`}
                                                >
                                                    {String.fromCharCode(65 + index)}. {choiceText}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {!markAsCorrect && activeSection === "reported" && (
                                <div className="mt-3">
                                    <p className="text-sm font-semibold text-gray-800">
                                        {t("subjectDetail.corrections.reasonTitle") ||
                                            "Selecciona un motivo"}
                                    </p>
                                    <div className="mt-2 space-y-2">
                                        {reasonOptions.map((option) => (
                                            <button
                                                key={option}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedReason(option);
                                                    setCustomReason("");
                                                }}
                                                className={`w-full rounded-md border px-3 py-2 text-left text-sm font-medium ${selectedReason === option
                                                    ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                                                    : "border-gray-200 text-gray-800 hover:border-indigo-300"
                                                    }`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                        <div className="mt-2">
                                            <textarea
                                                className="w-full rounded-md border border-gray-300 p-2 text-sm"
                                                rows={3}
                                                value={customReason}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setCustomReason(value);
                                                    if (value.trim()) {
                                                        setSelectedReason("");
                                                    }
                                                }}
                                                placeholder={
                                                    t("subjectDetail.corrections.customReason") ||
                                                    "Añade una explicación"
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {feedback && (
                                <div className="rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
                                    {feedback}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setModalQuestion(null)}
                                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-200"
                            >
                                {t("subjectDetail.corrections.cancel") || "Cerrar"}
                            </button>
                            
                            {activeSection === "reported" && (
                                <button
                                    onClick={handleUpdateCorrection}
                                    disabled={saving}
                                    className={`rounded-md px-4 py-2 text-sm font-semibold text-white ${saving
                                        ? "bg-gray-400"
                                        : "bg-indigo-600 hover:bg-indigo-700"
                                        }`}
                                >
                                    {saving
                                        ? t("subjectDetail.corrections.updating") || "Actualizando..."
                                        : t("subjectDetail.corrections.update") || "Actualizar"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CorrectionsTab;