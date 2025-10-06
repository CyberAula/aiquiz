// models/Questionnaire.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuestionnaireSchema = new Schema(
	{
		title: {
			type: String,
			required: [true, "El título es obligatorio"],
			trim: true,
		},
		description: {
			type: String,
			trim: true,
		},
		topic: {
			type: Schema.Types.ObjectId,
			ref: "Topic",
			required: [true, "El tema es obligatorio"],
		},
		questions: [
			{
				type: Schema.Types.ObjectId,
				ref: "Question",
			},
		],
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		downloadCount: {
			type: Number,
			default: 0,
		},
		isPublic: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

// Método para incrementar el contador de descargas
QuestionnaireSchema.methods.incrementDownloads = async function () {
	this.downloadCount += 1;
	await this.save();
	return this;
};

// Método para generar un PDF del cuestionario (simulado)
QuestionnaireSchema.methods.generatePDF = function () {
	// En una implementación real, aquí generarías el PDF
	return {
		fileName: `cuestionario_${this._id}.pdf`,
		mimeType: "application/pdf",
		// data: ... (contenido binario del PDF)
	};
};

// Método para generar formato Moodle XML (simulado)
QuestionnaireSchema.methods.generateMoodleXML = function () {
	// En una implementación real, aquí generarías el XML
	return {
		fileName: `cuestionario_${this._id}.xml`,
		mimeType: "application/xml",
		// data: ... (contenido XML)
	};
};

// Índices para optimizar búsquedas
QuestionnaireSchema.index({ topic: 1 });
QuestionnaireSchema.index({ createdBy: 1 });
QuestionnaireSchema.index({ title: "text", description: "text" });

// Export the model, avoiding OverwriteModelError during development
const Questionnaire = mongoose.models.Questionnaire || mongoose.model("Questionnaire", QuestionnaireSchema);

module.exports = Questionnaire;
