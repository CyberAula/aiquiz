// models/File.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FileSchema = new Schema(
	{
		fileName: {
			type: String,
			required: [true, "El nombre del archivo es obligatorio"],
			trim: true,
		},
		originalName: {
			type: String,
			required: [true, "El nombre original es obligatorio"],
			trim: true,
		},
		mimeType: {
			type: String,
			required: [true, "El tipo MIME es obligatorio"],
		},
		size: {
			type: Number,
			required: false, // No obligatorio para archivos externos
			default: 0,
			validate: {
				validator: function(value) {
					// Si es archivo externo, el tamaño puede ser 0
					if (this.isExternal) {
						return true;
					}
					// Si no es externo, el tamaño debe ser mayor que 0
					return value && value > 0;
				},
				message: "El tamaño debe ser mayor que 0 para archivos locales"
			}
		},
		path: {
			type: String,
		},
		fileType: {
			type: String,
			enum: ["document", "image", "video", "other"],
			default: "document",
		},
		subtopic: {
			type: Schema.Types.ObjectId,
			ref: "Subtopic",
			required: [true, "El subtema es obligatorio"],
		},
		uploadedBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		isExternal: {
			type: Boolean,
			default: false,
		},
		externalUrl: {
			type: String,
			trim: true,
		},
		platform: {
			type: String,
			enum: ["local", "youtube", "vimeo", "other"],
			default: "local",
		},
		// Campos específicos para integración RAG
		ragProcessed: {
			type: Boolean,
			default: false,
		},
		ragDocumentId: {
			type: String,
			trim: true,
		},
		ragStats: {
			chunks: Number,
			pages: Number,
			processingTime: Number,
			textLength: Number,
			quality: String,
		},
		description: {
			type: String,
			trim: true,
		},
		// Campos para transcripción de videos
		transcription: {
			content: {
				type: String,
				trim: true,
			},
			metadata: {
				title: String,
				author: String,
				duration: String,
				url: String,
				transcribedAt: Date,
				service: String, // 'assemblyai', 'deepgram', etc.
				language: String,
				characterCount: Number,
			}
		},
		// Contenido del archivo almacenado en MongoDB
		fileContent: {
			type: Buffer,
			required: false, // Solo para archivos locales, no externos
		},
	},
	{
		timestamps: true,
	}
);

// Método para obtener la URL completa del archivo
FileSchema.methods.getUrl = function (baseUrl) {
	if (this.isExternal) {
		return this.externalUrl;
	}
	return `${baseUrl}/uploads/${this.path}`;
};

// Índices para optimizar búsquedas
FileSchema.index({ subtopic: 1 });
FileSchema.index({ fileType: 1 });
FileSchema.index({ fileName: "text", originalName: "text" });

// Force cache clear for development
if (mongoose.models.File) {
	delete mongoose.models.File;
}

// Export the model
const File = mongoose.model("File", FileSchema);

module.exports = File;
