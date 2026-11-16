const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config();

const User = require('../manager/models/User.js');

/**
 * Script para crear el super administrador y, opcionalmente, un profesor inicial (variables de .env)
 * Ejecutar con: npm run seed:admin
 */

async function ensureUser({ uniqueKey, data, label, password }) {
    const existingUser = await User.findOne(uniqueKey);

    if (existingUser) {
        console.log(`${label} already exists:`, existingUser.email);
        return existingUser;
    }

    const user = new User(data);
    const savedUser = await user.save();

    console.log(`${label} created successfully:`);
    console.log('  Name:', savedUser.name);
    console.log('  Email:', savedUser.email);
    console.log('  Role:', savedUser.role);
    console.log('');
    console.log('Login credentials:');
    console.log('  Email:', savedUser.email);
    console.log('  Password:', password);

    return savedUser;
}

async function ensureSuperAdmin() {
    return ensureUser({
        uniqueKey: { email: process.env.SUPER_ADMIN_EMAIL },
        data: {
            name: process.env.SUPER_ADMIN_NAME,
            email: process.env.SUPER_ADMIN_EMAIL,
            password: process.env.SUPER_ADMIN_PASSWORD,
            role: 'admin',
            faculty: process.env.SUPER_ADMIN_FACULTY,
            department: process.env.SUPER_ADMIN_DEPARTMENT,
            isActive: true
        },
        label: 'Super admin',
        password: process.env.SUPER_ADMIN_PASSWORD
    });
}

// Profesor inicial opcional, con los datos de las variables DEFAULT_PROFESSOR_*.
// Si no se define DEFAULT_PROFESSOR_EMAIL no se crea ninguno.
async function ensureDefaultProfessor() {
    if (!process.env.DEFAULT_PROFESSOR_EMAIL) {
        console.log('DEFAULT_PROFESSOR_EMAIL no definido: no se crea profesor inicial.');
        return null;
    }

    return ensureUser({
        uniqueKey: { email: process.env.DEFAULT_PROFESSOR_EMAIL },
        data: {
            name: process.env.DEFAULT_PROFESSOR_NAME,
            email: process.env.DEFAULT_PROFESSOR_EMAIL,
            password: process.env.DEFAULT_PROFESSOR_PASSWORD,
            role: 'professor',
            faculty: process.env.DEFAULT_PROFESSOR_FACULTY,
            department: process.env.DEFAULT_PROFESSOR_DEPARTMENT,
            isActive: true
        },
        label: 'Default professor',
        password: process.env.DEFAULT_PROFESSOR_PASSWORD
    });
}

function createReadlineInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

function askQuestion(rl, question) {
    return new Promise(resolve => {
        rl.question(question, answer => resolve(answer.trim()));
    });
}

async function askYesNo(rl, question) {
    while (true) {
        const answer = (await askQuestion(rl, question)).toLowerCase();

        if (['y', 'yes'].includes(answer)) {
            return true;
        }

        if (['n', 'no'].includes(answer)) {
            return false;
        }

        console.log("Please answer with 'y' (yes) or 'n' (no).");
    }
}

async function promptForAdditionalProfessors() {
    const rl = createReadlineInterface();

    try {
        let wantsToAdd = await askYesNo(rl, '\n¿Quieres añadir algún profesor nuevo? (y/n): ');

        while (wantsToAdd) {
            const name = await askQuestion(rl, 'Nombre del profesor: ');
            const email = await askQuestion(rl, 'Correo electrónico: ');
            const password = await askQuestion(rl, 'Contraseña: ');
            const faculty = await askQuestion(rl, 'Facultad: ');
            const department = await askQuestion(rl, 'Departamento: ');

            await ensureUser({
                uniqueKey: { email },
                data: {
                    name,
                    email,
                    password,
                    role: 'professor',
                    faculty,
                    department,
                    isActive: true
                },
                label: 'Professor',
                password
            });

            wantsToAdd = await askYesNo(rl, '\n¿Quieres añadir otro profesor? (y/n): ');
        }
    } finally {
        rl.close();
    }
}

// Verificar variables requeridas
const requiredVars = [
    'MONGODB_URI',
    'SUPER_ADMIN_EMAIL',
    'SUPER_ADMIN_PASSWORD',
    'SUPER_ADMIN_NAME',
    'SUPER_ADMIN_FACULTY',
    'SUPER_ADMIN_DEPARTMENT'
];

// Si se pide profesor inicial (DEFAULT_PROFESSOR_EMAIL), sus datos también son obligatorios
if (process.env.DEFAULT_PROFESSOR_EMAIL) {
    requiredVars.push(
        'DEFAULT_PROFESSOR_PASSWORD',
        'DEFAULT_PROFESSOR_NAME',
        'DEFAULT_PROFESSOR_FACULTY',
        'DEFAULT_PROFESSOR_DEPARTMENT'
    );
}

const missing = requiredVars.filter(v => !process.env[v]);
if (missing.length > 0) {
    console.error('Missing environment variables:', missing.join(', '));
    process.exit(1);
}

async function runSeed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB successfully');

        console.log('Creating super admin user...');
        await ensureSuperAdmin();

        console.log('\nCreating default professor user...');
        await ensureDefaultProfessor();

        await promptForAdditionalProfessors();

        console.log('\nSeeding completed successfully.');
    } catch (error) {
        console.error('Error during seeding process:', error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        process.exit(process.exitCode || 0);
    }
}

runSeed();