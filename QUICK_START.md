# ⚡ Quick Start - Ixchel Medical

## 🎯 Lo que necesitas hacer AHORA

### 1️⃣ Crear Proyecto Firebase (5 min)

1. Ve a https://console.firebase.google.com/
2. Clic en "Agregar proyecto" → Nombre: `ixchel-medical`
3. En **Authentication** → Habilita **Email/Password**

### 2️⃣ Obtener Credenciales Frontend (2 min)

1. En Firebase Console → Icono ⚙️ → **Project Settings**
2. En "Your apps" → Clic en icono Web `</>`
3. Registra app: `ixchel-web`
4. **COPIA** las credenciales que aparecen

### 3️⃣ Crear archivo .env en la RAÍZ (1 min)

\`\`\`bash

# Desde la raíz del proyecto Ixchel/

cp .env.example .env
\`\`\`

Edita `.env` y pega tus credenciales:
\`\`\`env
VITE_FIREBASE_API_KEY=TU_API_KEY_AQUÍ
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

VITE_API_URL=http://localhost:3000/api
\`\`\`

### 4️⃣ Descargar Service Account Key (2 min)

1. En Firebase Console → ⚙️ → **Project Settings** → **Service Accounts**
2. Clic en **"Generate new private key"**
3. Guarda el archivo JSON descargado
4. Renómbralo a `serviceAccountKey.json`
5. Muévelo a la carpeta `backend/`:
   \`\`\`bash
   mv ~/Downloads/ixchel-_-firebase-adminsdk-_.json backend/serviceAccountKey.json
   \`\`\`

### 5️⃣ Ejecutar el Proyecto (1 min)

**Terminal 1 - Backend:**
\`\`\`bash
cd backend
npm install # Solo la primera vez
npm run dev
\`\`\`
✅ Deberías ver: `🚀 Servidor corriendo en http://localhost:3000`

**Terminal 2 - Frontend:**
\`\`\`bash
npm install # Solo la primera vez
npm run dev
\`\`\`
✅ Deberías ver: `Local: http://localhost:5173/`

### 6️⃣ Probar que Funciona

1. Abre http://localhost:5173/
2. Verás la página de Login
3. Cambia a modo "Registro" con el toggle
4. Registra un nuevo usuario
5. Haz login con ese usuario

---

## 🐛 Si algo falla:

### Error: "Cannot find module 'firebase'"

→ Ejecuta en la raíz: `npm install`

### Error: "Firebase: Error (auth/configuration-not-found)"

→ Revisa que el archivo `.env` exista en la RAÍZ y tenga las variables correctas

### Error: "Token inválido"

→ Verifica que `backend/serviceAccountKey.json` exista y sea el correcto

### Backend no inicia

→ Verifica que `backend/.env` tenga `PORT=3000` y `NODE_ENV=development`

### CORS Error

→ Ya está configurado en `backend/src/index.ts` para localhost:5173

---

## 📚 Documentación Completa

Ver `FIREBASE_SETUP.md` para detalles completos y guías avanzadas.

---

## 🎉 ¡Listo!

Una vez que tengas ambos servidores corriendo, ya puedes registrar usuarios y hacer login.
El token de Firebase se enviará automáticamente en cada petición al backend.
