import { es } from './langs/es.js';

// Constant for evaluation comments that uses i18n translations (for UI display)
export const getEvaluationComments = (t) => [
  t("evaluationComments.redaccionConfusa"),
  t("evaluationComments.opcionesMalFormuladas"),
  t("evaluationComments.opcionesRepetidas"),
  t("evaluationComments.variasOpcionesCorrectas"),
  t("evaluationComments.ningunaOpcionCorrecta"),
  t("evaluationComments.respuestaMarcadaIncorrecta"),
  t("evaluationComments.explicacionErronea"),
  t("evaluationComments.fueraDeTemario"),
  t("evaluationComments.otro")
];

// Get Spanish comments for API calls
export const getSpanishComments = () => Object.values(es.evaluationComments); 