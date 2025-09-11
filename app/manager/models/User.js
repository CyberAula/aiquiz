// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const SALT_WORK_FACTOR = 10;

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "El nombre es obligatorio"],
			trim: true,
		},
		email: {
			type: String,
			required: [true, "El email es obligatorio"],
			unique: true,
			trim: true,
			lowercase: true,
			match: [/^\S+@\S+\.\S+$/, "Por favor, introduce un email válido"],
		},
		password: {
			type: String,
			required: [true, "La contraseña es obligatoria"],
			minlength: [8, "La contraseña debe tener al menos 8 caracteres"],
		},
		faculty: {
			type: String,
			trim: true,
		},
		department: {
			type: String,
			trim: true,
		},
		role: {
			type: String,
			enum: ["admin", "professor"],
			default: "professor",
		},
		lastLogin: {
			type: Date,
			default: null,
		},
		resetPasswordToken: String,
		resetPasswordExpires: Date,
		invitationToken: String,
		invitationExpires: Date,
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
	}
);

// Método para encriptar contraseña antes de guardar
UserSchema.pre("save", async function (next) {
	// Solo hashear la contraseña si ha sido modificada o es nueva
	if (!this.isModified("password")) return next();

	try {
		const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error);
	}
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function (candidatePassword) {
	return bcrypt.compare(candidatePassword, this.password);
};

// Generar token para reseteo de contraseña
UserSchema.methods.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString("hex");

	this.resetPasswordToken = crypto
		.createHash("sha256")
		.update(resetToken)
		.digest("hex");

	// Expira en 1 hora
	this.resetPasswordExpires = Date.now() + 3600000;

	return resetToken;
};

// Ocultar campos sensibles cuando el usuario sea convertido a JSON
UserSchema.methods.toJSON = function () {
	const userObject = this.toObject();
	delete userObject.password;
	delete userObject.resetPasswordToken;
	delete userObject.resetPasswordExpires;
	delete userObject.invitationToken;
	return userObject;
};

// Export the model, avoiding OverwriteModelError during development
const User = mongoose.models.User || mongoose.model("User", UserSchema);

module.exports = User;
