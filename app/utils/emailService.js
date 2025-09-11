// app/utils/emailService.js
/**
 * Servicio de email para desarrollo y producción
 * En modo desarrollo, los emails se muestran por consola
 * En producción, se enviarían por un servicio real (SendGrid, SES, etc.)
 */

/**
 * Determina si estamos en modo desarrollo
 */
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Simula el envío de email en desarrollo mostrándolo por consola
 * @param {Object} emailData - Datos del email
 */
function logEmailToDev(emailData) {
    console.log('\n' + '='.repeat(80));
    console.log('📧 EMAIL ENVIADO (MODO DESARROLLO)');
    console.log('='.repeat(80));
    console.log(`📩 Para: ${emailData.to}`);
    console.log(`📝 Asunto: ${emailData.subject}`);
    console.log('📄 Contenido:');
    console.log('-'.repeat(40));
    console.log(emailData.html || emailData.text);
    console.log('-'.repeat(40));
    console.log(`⏰ Enviado: ${new Date().toLocaleString()}`);
    console.log('='.repeat(80) + '\n');
}

/**
 * Envía email de invitación a profesor
 * @param {string} email - Email del profesor
 * @param {string} professorName - Nombre del profesor
 * @param {string} subjectTitle - Título de la asignatura
 * @param {string} invitationToken - Token de invitación
 * @param {string} inviterName - Nombre quien invita
 */
export async function sendProfessorInvitation({
    email,
    professorName,
    subjectTitle,
    invitationToken,
    inviterName
}) {
    const loginUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/manager/login`;
    const acceptUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/manager/accept-invitation?token=${invitationToken}`;

    const emailData = {
        to: email,
        subject: `Invitación para colaborar en ${subjectTitle} - AIQuiz Manager`,
        html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="background: #4F46E5; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">🎓 Invitación a AIQuiz Manager</h1>
                </div>
                
                <div style="padding: 30px; background: #f9f9f9;">
                    <h2 style="color: #4F46E5;">¡Hola ${professorName}!</h2>
                    
                    <p><strong>${inviterName}</strong> te ha invitado a colaborar como profesor en la asignatura:</p>
                    
                    <div style="background: white; padding: 20px; border-left: 4px solid #4F46E5; margin: 20px 0;">
                        <h3 style="margin: 0; color: #4F46E5;">📚 ${subjectTitle}</h3>
                    </div>
                    
                    <p>Como profesor de esta asignatura, podrás:</p>
                    <ul style="background: white; padding: 20px; border-radius: 5px;">
                        <li>✅ Gestionar temas y subtemas</li>
                        <li>✅ Crear y revisar preguntas</li>
                        <li>✅ Supervisar el progreso de estudiantes</li>
                        <li>✅ Acceder a estadísticas y reportes</li>
                    </ul>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${acceptUrl}" 
                           style="background: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                            🚀 Aceptar Invitación
                        </a>
                    </div>
                    
                    <p style="background: #FFF3CD; padding: 15px; border-radius: 5px; border-left: 4px solid #FFC107;">
                        <strong>📌 Primeros pasos:</strong><br>
                        1. Haz clic en "Aceptar Invitación"<br>
                        2. Configura tu contraseña<br>
                        3. ¡Comienza a gestionar la asignatura!
                    </p>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                    
                    <p style="color: #666; font-size: 14px;">
                        Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
                        <a href="${acceptUrl}" style="color: #4F46E5; word-break: break-all;">${acceptUrl}</a>
                    </p>
                    
                    <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
                        Este enlace expirará en 7 días por seguridad.<br>
                        Si tienes problemas, contacta con el administrador del sistema.
                    </p>
                </div>
                
                <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
                    <p style="margin: 0;">© 2024 AIQuiz Manager - Sistema de Gestión Educativa</p>
                </div>
            </div>
        `,
        text: `
Invitación a AIQuiz Manager

¡Hola ${professorName}!

${inviterName} te ha invitado a colaborar como profesor en la asignatura: ${subjectTitle}

Como profesor de esta asignatura, podrás:
- Gestionar temas y subtemas
- Crear y revisar preguntas  
- Supervisar el progreso de estudiantes
- Acceder a estadísticas y reportes

Para aceptar la invitación, visita: ${acceptUrl}

Primeros pasos:
1. Haz clic en el enlace de arriba
2. Configura tu contraseña
3. ¡Comienza a gestionar la asignatura!

Este enlace expirará en 7 días por seguridad.
Si tienes problemas, contacta con el administrador del sistema.

© 2024 AIQuiz Manager
        `
    };

    if (isDevelopment) {
        // En desarrollo: mostrar email por consola
        logEmailToDev(emailData);
        return { success: true, message: 'Email enviado (modo desarrollo - ver consola)' };
    } else {
        // En producción: enviar email real
        // TODO: Implementar servicio de email real (SendGrid, SES, etc.)
        console.log('⚠️ Producción: Implementar servicio de email real');
        return { success: false, message: 'Servicio de email no configurado en producción' };
    }
}

/**
 * Envía email de recuperación de contraseña
 * @param {string} email - Email del usuario
 * @param {string} userName - Nombre del usuario
 * @param {string} resetToken - Token de recuperación
 */
export async function sendPasswordRecovery({
    email,
    userName,
    resetToken
}) {
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/manager/reset-password?token=${resetToken}`;

    const emailData = {
        to: email,
        subject: 'Recuperación de contraseña - AIQuiz Manager',
        html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="background: #DC2626; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">🔐 Recuperación de Contraseña</h1>
                </div>
                
                <div style="padding: 30px; background: #f9f9f9;">
                    <h2 style="color: #DC2626;">¡Hola ${userName}!</h2>
                    
                    <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en AIQuiz Manager.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background: #DC2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                            🔑 Restablecer Contraseña
                        </a>
                    </div>
                    
                    <p style="background: #FEE2E2; padding: 15px; border-radius: 5px; border-left: 4px solid #DC2626;">
                        <strong>⚠️ Importante:</strong><br>
                        Este enlace expirará en 1 hora por seguridad.<br>
                        Si no solicitaste este cambio, puedes ignorar este email.
                    </p>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                    
                    <p style="color: #666; font-size: 14px;">
                        Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
                        <a href="${resetUrl}" style="color: #DC2626; word-break: break-all;">${resetUrl}</a>
                    </p>
                </div>
                
                <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
                    <p style="margin: 0;">© 2024 AIQuiz Manager - Sistema de Gestión Educativa</p>
                </div>
            </div>
        `,
        text: `
Recuperación de Contraseña - AIQuiz Manager

¡Hola ${userName}!

Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en AIQuiz Manager.

Para restablecer tu contraseña, visita: ${resetUrl}

IMPORTANTE:
- Este enlace expirará en 1 hora por seguridad
- Si no solicitaste este cambio, puedes ignorar este email

© 2024 AIQuiz Manager
        `
    };

    if (isDevelopment) {
        // En desarrollo: mostrar email por consola
        logEmailToDev(emailData);
        return { success: true, message: 'Email enviado (modo desarrollo - ver consola)' };
    } else {
        // En producción: enviar email real
        // TODO: Implementar servicio de email real
        console.log('⚠️ Producción: Implementar servicio de email real');
        return { success: false, message: 'Servicio de email no configurado en producción' };
    }
}