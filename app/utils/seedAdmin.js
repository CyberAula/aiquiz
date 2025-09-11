const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../manager/models/User.js');

/**
 * Script para crear el super administrador
 * Ejecutar con: npm run seed:admin
 */

async function createSuperAdmin() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB successfully');

        // Verificar si ya existe el super admin
        const existingAdmin = await User.findOne({ email: process.env.SUPER_ADMIN_EMAIL });
        
        if (existingAdmin) {
            console.log('Super admin already exists:', existingAdmin.email);
            return;
        }

        // Crear super administrador
        const superAdmin = new User({
            name: process.env.SUPER_ADMIN_NAME,
            email: process.env.SUPER_ADMIN_EMAIL,
            password: process.env.SUPER_ADMIN_PASSWORD,
            role: 'admin',
            faculty: process.env.SUPER_ADMIN_FACULTY,
            department: process.env.SUPER_ADMIN_DEPARTMENT,
            isActive: true
        });

        const savedUser = await superAdmin.save();
        
        console.log('Super admin created successfully:');
        console.log('  Name:', savedUser.name);
        console.log('  Email:', savedUser.email);
        console.log('  Role:', savedUser.role);
        console.log('');
        console.log('Login credentials:');
        console.log('  Email:', savedUser.email);
        console.log('  Password:', process.env.SUPER_ADMIN_PASSWORD);

    } catch (error) {
        console.error('Error creating super admin:', error.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
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

const missing = requiredVars.filter(v => !process.env[v]);
if (missing.length > 0) {
    console.error('Missing environment variables:', missing.join(', '));
    process.exit(1);
}

console.log('Creating super admin user...');
createSuperAdmin();