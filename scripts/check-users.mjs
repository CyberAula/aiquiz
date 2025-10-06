// Script para revisar usuarios en la base de datos
import mongoose from 'mongoose';

// Configurar mongoose para ES modules
mongoose.set('strictQuery', false);

// Función para conectar a la base de datos
async function dbConnect() {
    if (mongoose.connections[0].readyState) {
        console.log('Ya conectado a MongoDB');
        return;
    }

    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/aiquiz';
        await mongoose.connect(mongoUri);
        console.log('Conectado a MongoDB');
    } catch (error) {
        console.error('Error conectando a MongoDB:', error);
        throw error;
    }
}

// Esquema de usuario
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    verified: Boolean,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function checkUsers() {
    console.log('👥 Revisando usuarios en la base de datos...\n');
    
    try {
        await dbConnect();

        // Contar todos los usuarios
        const totalUsers = await User.countDocuments();
        console.log(`📊 Total de usuarios en BD: ${totalUsers}\n`);

        if (totalUsers === 0) {
            console.log('❌ No hay usuarios en la base de datos');
            console.log('💡 Ejecuta el seed para crear un admin: npm run seed:admin\n');
            return;
        }

        // Mostrar distribución por rol
        const byRole = await User.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        console.log('📈 Distribución por rol:');
        byRole.forEach(item => {
            console.log(`   ${item._id || 'undefined'}: ${item.count}`);
        });
        console.log();

        // Mostrar usuarios profesores
        const professors = await User.find({ role: 'professor' }).lean();
        console.log(`👨‍🏫 Profesores (${professors.length}):`);
        professors.forEach(prof => {
            console.log(`   ${prof.email} - ${prof.name} (verificado: ${prof.verified})`);
        });
        console.log();

        // Mostrar usuarios admin
        const admins = await User.find({ role: 'admin' }).lean();
        console.log(`👨‍💼 Administradores (${admins.length}):`);
        admins.forEach(admin => {
            console.log(`   ${admin.email} - ${admin.name} (verificado: ${admin.verified})`);
        });
        console.log();

        if (professors.length > 0 || admins.length > 0) {
            console.log('💡 Para probar el manager:');
            console.log('   1. Ve a http://localhost:3000/manager/login');
            console.log('   2. Inicia sesión con uno de estos usuarios');
            console.log('   3. Ve a la página del tema para ver las preguntas\n');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Conexión cerrada');
    }
}

// Ejecutar
checkUsers()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('💥 Error:', error);
        process.exit(1);
    });