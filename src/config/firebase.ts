import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Inicializar Firebase Admin usando archivo de credenciales
const serviceAccountPath = path.join(__dirname, '../../serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: No se encontró el archivo serviceAccountKey.json');
  console.error('   Descarga las credenciales desde Firebase Console:');
  console.error('   Configuración > Cuentas de servicio > Generar nueva clave privada');
  console.error('   Guarda el archivo como "serviceAccountKey.json" en la raíz del proyecto');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

// Inicializar solo si no está ya inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}

// Exportar instancias de Firestore y otros servicios
export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();

// Configurar Firestore
db.settings({
  ignoreUndefinedProperties: true,
});

// Colecciones de Firestore
export const COLLECTIONS = {
  MEMBERS: 'members',
  TEAMS: 'teams',
  FIELDS: 'fields',
  BOOKINGS: 'bookings',
  EVENTS: 'events',
  PAYMENTS: 'payments',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  SETTINGS: 'settings',
  COUNTERS: 'counters',  // Para números secuenciales
} as const;

// Helper para timestamps
export const serverTimestamp = admin.firestore.FieldValue.serverTimestamp;
export const deleteField = admin.firestore.FieldValue.delete;
export const arrayUnion = admin.firestore.FieldValue.arrayUnion;
export const arrayRemove = admin.firestore.FieldValue.arrayRemove;
export const increment = admin.firestore.FieldValue.increment;

export default admin;
