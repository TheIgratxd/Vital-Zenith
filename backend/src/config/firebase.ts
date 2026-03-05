import * as admin from "firebase-admin";
import * as path from "path";

// Ruta al archivo de credenciales
const serviceAccountPath = path.join(__dirname, "../../ixchel-db-firebase-adminsdk-fbsvc-f91f436ab2.json");

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
  databaseURL: "https://ixchel-db-default-rtdb.firebaseio.com/" // Reemplaza con tu URL de Realtime Database
});

// Exportar servicios que usarás
export const auth = admin.auth();
export const db = admin.firestore();
export const realtimeDb = admin.database(); // Realtime Database

export default admin;
