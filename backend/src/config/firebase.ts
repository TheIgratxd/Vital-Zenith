import * as admin from "firebase-admin";
import * as path from "path";

// Ruta al archivo de credenciales
const serviceAccountPath = path.join(__dirname, "../../serviceAccountKey.json");

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
});

// Exportar servicios que usarás
export const auth = admin.auth();
export const db = admin.firestore();

export default admin;
