# 🔥 Configuración de Firebase para Ixchel Medical

## � Estructura del Proyecto

\`\`\`
Ixchel/
├── backend/ # ✅ Backend con Express + Firebase Admin
│ ├── src/
│ │ ├── config/
│ │ │ └── firebase.ts # Configuración Firebase Admin SDK
│ │ ├── controllers/
│ │ │ └── auth.controller.ts
│ │ ├── middleware/
│ │ │ └── auth.middleware.ts
│ │ ├── routes/
│ │ │ └── auth.routes.ts
│ │ └── index.ts
│ ├── .env # ⚙️ Variables de entorno
│ ├── serviceAccountKey.json # 🔑 Credenciales Firebase Admin (NO subir a Git)
│ └── package.json
│
├── frontend/ # Frontend React + TypeScript + Vite
│ ├── src/
│ │ ├── components/
│ │ ├── config/
│ │ │ └── firebase.config.ts # Configuración Firebase Client SDK
│ │ ├── services/
│ │ │ ├── auth.service.ts
│ │ │ └── api.service.ts
│ │ ├── hooks/
│ │ ├── types/
│ │ └── main.tsx
│ └── package.json
│
├── .env # 🔑 Variables de entorno Frontend (CREAR ESTE)
├── .env.example # 📝 Plantilla de variables
└── FIREBASE_SETUP.md # 📚 Esta guía
\`\`\`

## �📋 Pasos para Configurar Firebase

### 1️⃣ Crear un Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto"
3. Nombra tu proyecto (ej: "ixchel-medical")
4. Sigue los pasos del asistente

### 2️⃣ Habilitar Authentication

1. En el menú lateral, ve a **Authentication**
2. Haz clic en **Get Started**
3. Habilita **Email/Password** como método de autenticación
4. Guarda los cambios

### 3️⃣ Configurar Firestore (Opcional - para guardar datos adicionales)

1. En el menú lateral, ve a **Firestore Database**
2. Haz clic en **Create Database**
3. Selecciona modo **Test** para desarrollo (o Production con reglas personalizadas)
4. Elige una ubicación cercana

### 4️⃣ Obtener Credenciales del Frontend

1. En **Project Settings** (⚙️ icono de configuración)
2. Ve a la sección **Your apps**
3. Haz clic en el ícono **Web** (`</>`)
4. Registra tu app (nombra algo como "ixchel-web")
5. Copia las credenciales que aparecen

### 5️⃣ Configurar Variables de Entorno del Frontend

1. Crea un archivo `.env` en la carpeta raíz del proyecto:

\`\`\`bash
cp .env.example .env
\`\`\`

2. Edita el archivo `.env` con tus credenciales:

\`\`\`env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123...

VITE_API_URL=http://localhost:3000/api
\`\`\`

### 6️⃣ Obtener Service Account Key del Backend

1. En **Project Settings** > **Service Accounts**
2. Haz clic en **Generate new private key**
3. Guarda el archivo JSON descargado
4. Renómbralo a `serviceAccountKey.json`
5. Colócalo en la carpeta `backend/`:

\`\`\`bash
backend/
└── serviceAccountKey.json ← Aquí
\`\`\`

⚠️ **IMPORTANTE**: Asegúrate de que `serviceAccountKey.json` esté en tu `.gitignore`

### 7️⃣ Configurar .gitignore

✅ **Ya configurado** - Verifica que `backend/.gitignore` tenga:
\`\`\`
serviceAccountKey.json
.env
node_modules/
dist/
\`\`\`

✅ **Ya configurado** - Verifica que el `.gitignore` raíz tenga:
\`\`\`
.env
.env.local
node_modules/
dist/
\`\`\`

## 🚀 Ejecutar el Proyecto

### Opción 1: Ambos servidores (recomendado para desarrollo)

Terminal 1 - Backend:
\`\`\`bash
cd backend
npm run dev
\`\`\`
✅ Backend corriendo en: http://localhost:3000

Terminal 2 - Frontend:
\`\`\`bash
npm run dev
\`\`\`
✅ Frontend corriendo en: http://localhost:5173

### Opción 2: Por separado

**Solo Backend:**
\`\`\`bash
cd backend
npm run dev
\`\`\`

**Solo Frontend:**
\`\`\`bash
npm run dev
\`\`\`

## 📡 Endpoints de la API

### Health Check

\`\`\`
GET http://localhost:3000/api/health
\`\`\`

### Auth - Verificar Token

\`\`\`
GET http://localhost:3000/api/auth/verify
Headers: Authorization: Bearer <token>
\`\`\`

### Auth - Obtener Info del Usuario

\`\`\`
GET http://localhost:3000/api/auth/me
Headers: Authorization: Bearer <token>
\`\`\`

## 🔐 Flujo de Autenticación

1. **Usuario se registra** → Firebase Authentication crea el usuario
2. **Frontend obtiene token** → \`user.getIdToken()\`
3. **Frontend envía token al backend** → Header \`Authorization: Bearer <token>\`
4. **Backend valida token** → \`auth.verifyIdToken(token)\`
5. **Backend responde con datos** → Usuario autenticado

## 🛠️ Servicios Disponibles

### AuthService (Frontend)

\`\`\`typescript
import { authService } from './services/auth.service';

// Registrar usuario
await authService.register({ name, email, password });

// Login
await authService.login({ email, password });

// Logout
await authService.logout();

// Obtener usuario actual
const user = authService.getCurrentUser();

// Obtener token
const token = await authService.getCurrentUserToken();
\`\`\`

### ApiService (Frontend)

\`\`\`typescript
import { apiService } from './services/api.service';

// Health check
await apiService.healthCheck();

// Verificar token
await apiService.verifyToken();

// Obtener usuario actual
await apiService.getCurrentUser();

// Request genérico
await apiService.get('/endpoint');
await apiService.post('/endpoint', data);
\`\`\`

### useApi Hook (Frontend)

\`\`\`typescript
import { useApi } from './hooks/useApi';
import { apiService } from './services/api.service';

function MyComponent() {
const { data, loading, error, execute } = useApi();

const fetchData = async () => {
await execute(() => apiService.getCurrentUser());
};

return (

<div>
{loading && <p>Cargando...</p>}
{error && <p>Error: {error}</p>}
{data && <p>Usuario: {data.email}</p>}
</div>
);
}
\`\`\`

## ✅ Checklist

### Configuración Inicial

- [ ] Proyecto de Firebase creado en Firebase Console
- [ ] Authentication habilitado (Email/Password)
- [ ] App Web registrada en Firebase Console

### Backend (✅ Ya configurado)

- [x] Carpeta `backend/` creada
- [x] Express + TypeScript configurado
- [x] Middleware de autenticación (`auth.middleware.ts`)
- [x] Controladores (`auth.controller.ts`)
- [x] Rutas (`auth.routes.ts`)
- [x] Firebase Admin SDK instalado
- [ ] `serviceAccountKey.json` descargado y colocado en `backend/`
- [x] `backend/.env` configurado

### Frontend

- [x] Carpeta `frontend/` con React + Vite
- [x] Firebase Client SDK configurado (`firebase.config.ts`)
- [x] Servicios creados (`auth.service.ts`, `api.service.ts`)
- [x] `.env.example` con plantilla
- [ ] `.env` creado en la raíz con credenciales de Firebase
- [ ] Variables `VITE_FIREBASE_*` configuradas

### Testing

- [ ] Backend corriendo en puerto 3000
- [ ] Frontend corriendo en puerto 5173
- [ ] Endpoint `/api/health` responde correctamente
- [ ] Puedes registrar un usuario nuevo
- [ ] Puedes hacer login con el usuario
- [ ] El token se envía correctamente al backend
- [ ] Backend valida el token correctamente

## 🐛 Troubleshooting

### Error: "Firebase: Error (auth/configuration-not-found)"

→ Verifica que el archivo `.env` exista y tenga las variables correctas

### Error: "Token inválido o expirado"

→ El token expira después de 1 hora. Haz logout y login nuevamente

### Error: "CORS"

→ Verifica que el backend tenga configurado el origen correcto en `cors()`

### Error: "Firebase Admin SDK"

→ Verifica que `serviceAccountKey.json` esté en la ubicación correcta

## 📚 Recursos

- [Firebase Docs](https://firebase.google.com/docs)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
