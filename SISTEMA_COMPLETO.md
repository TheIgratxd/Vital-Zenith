# 🔥 SISTEMA COMPLETO: Firebase + Auth + Brazaletes

## 📊 RESUMEN DE LA ARQUITECTURA

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO COMPLETO DEL SISTEMA                   │
└─────────────────────────────────────────────────────────────────┘

1️⃣ REGISTRO DE USUARIO:
   Frontend → Firebase Auth (registro) → Backend (crear en Firestore)

2️⃣ LOGIN:
   Frontend → Firebase Auth (login) → Token generado

3️⃣ EMPAREJAMIENTO:
   Usuario ingresa código → Frontend → Backend → Firestore

4️⃣ ENVÍO DE DATOS:
   ESP32 → Backend (/api/bracelet/update) → Firestore

5️⃣ LECTURA EN TIEMPO REAL:
   Frontend escucha Firestore → Actualiza UI automáticamente
```

---

## 🗂️ ESTRUCTURA DE FIRESTORE

### Colección: `users`

```typescript
users/{uid}/
  ├── uid: string              // ID de Firebase Auth
  ├── name: string             // Nombre del usuario
  ├── email: string            // Email
  ├── bracelet_id: string|null // ID del brazalete vinculado
  ├── createdAt: timestamp     // Fecha de creación
  └── role: "user"|"admin"     // Rol del usuario
```

### Colección: `bracelets`

```typescript
bracelets/{bracelet_id}/
  ├── bracelet_id: string           // ID único del brazalete
  ├── pair_code: string             // Código de 6 dígitos (se elimina al emparejar)
  ├── user_id: string|null          // UID del usuario vinculado
  ├── mac_address: string           // Dirección MAC del ESP32
  ├── status: "available"|"paired"  // Estado del brazalete
  └── last_data: {
      ├── pulse: number             // Pulsaciones por minuto
      ├── spo2: number              // Saturación de oxígeno (%)
      ├── temperature: number       // Temperatura corporal (°C)
      └── timestamp: timestamp      // Última actualización
    }
```

---

## 🔐 REGLAS DE SEGURIDAD

El archivo `firestore.rules` ya está creado en la raíz del proyecto.

**Para aplicarlas:**

1. Ve a Firebase Console → Firestore Database → Rules
2. Copia y pega el contenido de `firestore.rules`
3. Haz clic en "Publicar"

---

## 🚀 ENDPOINTS DEL BACKEND

### Autenticación

| Método | Endpoint           | Auth | Descripción                |
| ------ | ------------------ | ---- | -------------------------- |
| POST   | `/api/auth/create` | ❌   | Crear usuario en Firestore |
| GET    | `/api/auth/verify` | ✅   | Verificar token            |
| GET    | `/api/auth/me`     | ✅   | Obtener info del usuario   |

### Brazaletes

| Método | Endpoint               | Auth | Descripción                       |
| ------ | ---------------------- | ---- | --------------------------------- |
| POST   | `/api/bracelet/pair`   | ✅   | Emparejar brazalete               |
| POST   | `/api/bracelet/unpair` | ✅   | Desvincular brazalete             |
| GET    | `/api/bracelet/data`   | ✅   | Obtener datos del brazalete       |
| POST   | `/api/bracelet/update` | ❌   | Actualizar signos vitales (ESP32) |

---

## 📱 FLUJO DE EMPAREJAMIENTO

### 1. Usuario se registra

```typescript
// Frontend: Login.tsx
await authService.register({
  email: "usuario@example.com",
  password: "123456",
  name: "Juan Pérez",
});
```

**Qué pasa:**

1. ✅ Se crea usuario en Firebase Authentication
2. ✅ Se actualiza el displayName
3. ✅ Se crea documento en Firestore `users/{uid}`

---

### 2. Usuario empareja brazalete

```typescript
// Frontend
await braceletService.pairBracelet("123456");
```

**Qué pasa:**

1. ✅ Frontend envía código al backend con token
2. ✅ Backend busca brazalete con ese código en Firestore
3. ✅ Si existe y está disponible:
   - Actualiza `bracelets/{id}.user_id` con el uid
   - Cambia `status` a "paired"
   - Elimina `pair_code` para evitar reutilización
   - Actualiza `users/{uid}.bracelet_id`
4. ✅ Backend responde con éxito

---

### 3. ESP32 envía datos

```bash
# Petición HTTP desde ESP32
POST http://tu-servidor.com/api/bracelet/update
Content-Type: application/json

{
  "bracelet_id": "BRACELET_ID_001",
  "pulse": 75,
  "spo2": 98,
  "temperature": 36.6
}
```

**Qué pasa:**

1. ✅ Backend actualiza `bracelets/{id}.last_data`
2. ✅ Firestore actualiza timestamp automáticamente
3. ✅ Frontend (si está escuchando) recibe actualización en tiempo real

---

### 4. Frontend recibe datos en tiempo real

```typescript
// Frontend Dashboard
import { db } from "firebase/firestore";
import { doc, onSnapshot } from "firebase/firestore";

// Escuchar cambios en tiempo real
const braceletRef = doc(db, "bracelets", braceletId);
onSnapshot(braceletRef, (snapshot) => {
  const data = snapshot.data();
  console.log("Nuevos datos:", data.last_data);
  // Actualizar UI automáticamente
});
```

---

## 🔧 CÓDIGO DEL ESP32 (Arduino/C++)

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "TU_WIFI";
const char* password = "TU_PASSWORD";
const char* serverUrl = "http://tu-servidor.com/api/bracelet/update";
const char* braceletId = "BRACELET_ID_001";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi conectado!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    // Leer sensores (ejemplo)
    int pulse = random(60, 100);       // Sensor de pulso
    int spo2 = random(95, 100);        // Sensor SpO2
    float temperature = random(360, 380) / 10.0;  // Sensor de temperatura

    // Crear JSON
    String jsonData = "{";
    jsonData += "\"bracelet_id\":\"" + String(braceletId) + "\",";
    jsonData += "\"pulse\":" + String(pulse) + ",";
    jsonData += "\"spo2\":" + String(spo2) + ",";
    jsonData += "\"temperature\":" + String(temperature);
    jsonData += "}";

    // Enviar datos
    int httpCode = http.POST(jsonData);

    if (httpCode > 0) {
      String response = http.getString();
      Serial.println("Respuesta: " + response);
    } else {
      Serial.println("Error al enviar datos");
    }

    http.end();
  }

  delay(5000);  // Enviar cada 5 segundos
}
```

---

## 📝 PSEUDOCÓDIGO: FLUJO COMPLETO

### Registro

```
1. Usuario llena formulario de registro
2. Frontend: authService.register(email, password, name)
3. Firebase Auth crea usuario
4. Frontend obtiene UID del usuario
5. Frontend llama a backend: POST /api/auth/create
6. Backend crea documento en Firestore users/{uid}
7. Usuario puede hacer login
```

### Emparejamiento

```
1. Usuario inicia sesión
2. Usuario ve código de 6 dígitos en el brazalete ESP32
3. Usuario ingresa código en la app
4. Frontend: braceletService.pairBracelet(código)
5. Backend busca brazalete con ese código
6. SI encontrado y disponible:
   - Backend actualiza bracelets/{id}:
     - user_id = uid del usuario
     - status = "paired"
     - elimina pair_code
   - Backend actualiza users/{uid}:
     - bracelet_id = id del brazalete
   - Backend responde: éxito
7. SI NO encontrado o ya emparejado:
   - Backend responde: error
8. Frontend muestra resultado al usuario
```

### Monitoreo en Tiempo Real

```
1. Usuario abre dashboard
2. Frontend obtiene bracelet_id del usuario
3. Frontend crea listener de Firestore:
   onSnapshot(bracelets/{bracelet_id})
4. ESP32 envía datos cada X segundos:
   POST /api/bracelet/update
5. Backend actualiza bracelets/{id}.last_data
6. Firestore dispara evento de cambio
7. Frontend recibe actualización automáticamente
8. Frontend actualiza UI con nuevos valores
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Backend

- [x] Firebase Admin SDK configurado
- [x] Firestore service creado
- [x] Controladores de autenticación
- [x] Controladores de brazaletes
- [x] Rutas de auth
- [x] Rutas de brazaletes
- [x] Middleware de autenticación
- [ ] **Aplicar reglas de Firestore** ⚠️

### Frontend

- [x] Firebase Client SDK configurado
- [x] AuthService con registro y login
- [x] BraceletService creado
- [x] Integración con backend en registro
- [ ] Dashboard con monitoreo en tiempo real
- [ ] Componente de emparejamiento
- [ ] Visualización de signos vitales

### Firestore

- [ ] Aplicar reglas de seguridad
- [ ] Crear índices si es necesario
- [ ] Probar permisos

### ESP32

- [ ] Código de conexión WiFi
- [ ] Lectura de sensores
- [ ] Envío de datos HTTP
- [ ] Generación de pair_code al iniciar

---

## 🧪 PRUEBAS

### 1. Probar Registro

```bash
# 1. Registrar usuario en el frontend
# 2. Verificar en Firebase Console → Authentication
# 3. Verificar en Firestore → users/{uid}
```

### 2. Probar Emparejamiento

```bash
# Crear brazalete de prueba (Postman)
POST http://localhost:3000/api/bracelet/create
{
  "mac_address": "AA:BB:CC:DD:EE:FF"
}

# Respuesta te dará el pair_code
# Usar ese código en el frontend para emparejar
```

### 3. Probar Actualización de Datos

```bash
# Postman
POST http://localhost:3000/api/bracelet/update
{
  "bracelet_id": "BRACELET_ID_001",
  "pulse": 72,
  "spo2": 98,
  "temperature": 36.5
}
```

---

## 📚 PRÓXIMOS PASOS

1. **Aplicar reglas de Firestore** (firestore.rules)
2. **Crear Dashboard** con monitoreo en tiempo real
3. **Implementar listener de Firestore** en el frontend
4. **Programar ESP32** con código de sensores
5. **Agregar gráficas** para visualizar historial
6. **Implementar alertas** cuando valores estén fuera de rango

---

¿Quieres que continúe con alguno de estos pasos? Por ejemplo:

- Crear el Dashboard con monitoreo en tiempo real
- Implementar el listener de Firestore
- Crear componente de emparejamiento
