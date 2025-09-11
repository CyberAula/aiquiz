import mongoose from "mongoose";
const { Schema } = mongoose;

// Subdocumento para opciones de respuesta
const ChoiceSchema = new Schema({
	text: {
		type: String,
		required: [true, "El texto de la opción es obligatorio"],
	},
	isCorrect: {
		type: Boolean,
		default: false,
	},
});

const questionSchema = new Schema(
	{
		id: {
			type: Number,
			required: true,
			index: true, // Añadir índice para búsquedas rápidas
		},
		subject: {
			type: String,
			required: true,
			index: true, // Añadir índice para búsquedas por asignatura
		},
		language: {
			type: String,
			required: true,
		},
		difficulty: {
			type: String,
			required: true,
			enum: ["básico", "intermedio", "avanzado"], // Validación de valores permitidos
		},
		topic: {
			type: String,
			required: true,
			index: true, // Añadir índice para búsquedas por tema
		},
		query: {
			type: String,
			required: true,
		},
		// Opción 1: Mantener tu estructura actual
		choices: {
			type: Array,
			required: true,
		},
		answer: {
			type: Number,
			required: true,
		},
		// Opción 2 (alternativa): Usar subdocumentos estructurados
		// choices: [ChoiceSchema],

		explanation: {
			type: String,
			required: true,
		},
		studentEmail: {
			type: String,
			required: true,
			index: true, // Añadir índice para búsquedas por estudiante
		},
		studentAnswer: {
			type: Number,
			required: true,
		},
		studentReport: {
			type: Boolean,
			required: true,
			default: false,
		},
		llmModel: {
			type: String,
			required: true,
		},
		ABC_Testing: {
			type: Boolean,
			required: true,
			default: false,
		},
		md5Prompt: {
			type: String,
			required: false,
		},
		prompt: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

// Índices compuestos para consultas frecuentes
questionSchema.index({ topic: 1, difficulty: 1 });
questionSchema.index({ studentEmail: 1, createdAt: -1 });
questionSchema.index({ subject: 1, topic: 1 });

// Método de utilidad para estadísticas
questionSchema.statics.getStudentStats = async function (email) {
	return this.aggregate([
		{ $match: { studentEmail: email } },
		{
			$group: {
				_id: null,
				totalQuestions: { $sum: 1 },
				correctAnswers: {
					$sum: {
						$cond: [{ $eq: ["$studentAnswer", "$answer"] }, 1, 0],
					},
				},
			},
		},
	]);
};

// Si ya tienes instancias del modelo en tu base de datos
export default mongoose.models.Question ||
	mongoose.model("Question", questionSchema);
