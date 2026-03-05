# 🚀 Inicio Rápido - Dashboard de Signos Vitales

## ✅ Pasos Rápidos para Usar el Dashboard

### 1️⃣ Configurar Firebase Realtime Database

1. **Habilita Realtime Database:**
   - Ve a Firebase Console → Realtime Database → Create Database
   - Selecciona modo "Test" para desarrollo

2. **Obtén la URL de tu database:**
   - Copia la URL que aparece (ej: `https://tu-proyecto-default-rtdb.firebaseio.com`)

3. **Actualiza el backend:**
   - Abre `/backend/src/config/firebase.ts`
   - Reemplaza `YOUR-PROJECT-ID` con tu URL real:
   
   ```typescript
   databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com"
   ```

### 2️⃣ Configurar Reglas de Firebase

En Firebase Console → Realtime Database → Rules, pega:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

⚠️ **Esto es solo para desarrollo. Usa reglas más seguras en producción.**

### 3️⃣ Instalar Dependencias

```bash
# Backend
cd backend
npm install

# Frontend  
cd frontend
npm install
```

### 4️⃣ Iniciar Servidores

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Debe mostrar: `🚀 Servidor corriendo en http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Debe mostrar: `http://localhost:5173`

### 5️⃣ Crear Usuario de Prueba

1. Abre el navegador en `http://localhost:5173`
2. Crea una cuenta (Register)
3. Inicia sesión (Login)
4. **¡IMPORTANTE!** Copia el UID del usuario:
   - Abre las DevTools del navegador (F12)
   - Ve a la consola
   - Busca mensajes del auth que muestren el UID
   - O ve a Firebase Console → Authentication → Users y copia el UID

### 6️⃣ Simular Datos del ESP32

**Opción A: Script Python (Recomendado)**

1. Edita `simulate_esp32.py`:
   ```python
   DATABASE_URL = "https://tu-proyecto-default-rtdb.firebaseio.com"
   USER_ID = "EL_UID_QUE_COPIASTE"
   ```

2. Ejecuta:
   ```bash
   pip install requests
   python3 simulate_esp32.py
   ```

3. Selecciona opción **5** (Configuración completa)

**Opción B: Insertar datos manualmente en Firebase**

Ve a Firebase Console → Realtime Database y crea esta estructura:

```json
{
  "users": {
    "EL_UID_QUE_COPIASTE": {
      "braceletId": "BRACELET_001",
      "email": "tu@email.com",
      "name": "Tu Nombre"
    }
  },
  "bracelets": {
    "BRACELET_001": {
      "userId": "EL_UID_QUE_COPIASTE",
      "currentData": {
        "temperature": 36.5,
        "spo2": 98,
        "heartRate": 72,
        "bloodPressure": {
          "systolic": 120,
          "diastolic": 80
        },
        "timestamp": 1709683200000
      }
    }
  }
}
```

### 7️⃣ Ver el Dashboard

1. Actualiza la página del dashboard (`http://localhost:5173/dashboard`)
2. Deberías ver:
   - 4 tarjetas con métricas (Temperatura, Frecuencia Cardíaca, Oxigenación, Presión)
   - Gráfico de tendencias
   - Gráfico de barras con lecturas por día
   - Tabla de estadísticas

## 🎨 Usar el Nuevo Dashboard

Para usar el dashboard mejorado:

1. Abre `/frontend/src/main.tsx`
2. Cambia la importación:
   ```typescript
   import Dashboard from "./DashboardNew.tsx";  // Nuevo dashboard
   ```
3. Guarda y recarga la página

## 📊 APIs Disponibles

### Obtener datos actuales
```bash
curl http://localhost:3000/api/vitals/current \
  -H "Authorization: Bearer TU_FIREBASE_TOKEN"
```

### Obtener historial
```bash
curl "http://localhost:3000/api/vitals/history?days=7" \
  -H "Authorization: Bearer TU_FIREBASE_TOKEN"
```

### Obtener estadísticas
```bash
curl "http://localhost:3000/api/vitals/stats?days=30" \
  -H "Authorization: Bearer TU_FIREBASE_TOKEN"
```

### Obtener datos para gráficos
```bash
curl "http://localhost:3000/api/vitals/chart?days=14" \
  -H "Authorization: Bearer TU_FIREBASE_TOKEN"
```

## 🔧 Solución de Problemas

### "No hay datos disponibles"
- Verifica que el usuario tenga un `braceletId` en `/users/USER_UID`
- Asegúrate de que el brazalete existe en `/bracelets/BRACELET_001`
- Ejecuta el script de simulación para generar datos

### "Usuario no tiene un brazalete asociado"
- Ve a Firebase Console → Realtime Database
- Agrega manualmente en `/users/TU_UID`:
  ```json
  {
    "braceletId": "BRACELET_001"
  }
  ```

### Error de conexión al backend
- Verifica que el backend esté corriendo en `http://localhost:3000`
- Revisa que la configuración de Firebase esté correcta
- Checa los logs del backend en la terminal

### El dashboard no se ve bien
- Asegúrate de estar usando `DashboardNew.tsx`
- Verifica que los archivos CSS se hayan creado:
  - `DashboardNew.css`
  - `StatCard.css`
  - `Charts.css`

## 📱 Código ESP32 Real

Cuando tengas tu ESP32 real, usa este código:

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "TU_WIFI";
const char* password = "TU_PASSWORD";
const char* databaseURL = "https://tu-proyecto.firebaseio.com";

void sendVitals(float temp, int spo2, int hr, int sys, int dia) {
  HTTPClient http;
  String url = String(databaseURL) + "/bracelets/BRACELET_001/currentData.json";
  
  String json = "{\"temperature\":" + String(temp) + 
                ",\"spo2\":" + String(spo2) +
                ",\"heartRate\":" + String(hr) +
                ",\"bloodPressure\":{\"systolic\":" + String(sys) +
                ",\"diastolic\":" + String(dia) + "}" +
                ",\"timestamp\":" + String(millis()) + "}";
  
  http.begin(url);
  http.PUT(json);
  http.end();
}
```

## 📚 Documentación Completa

Para más detalles, consulta:
- `DASHBOARD_SETUP.md` - Configuración completa y estructura de datos
- `FIREBASE_SETUP.md` - Configuración de Firebase
- `QUICK_START.md` - Inicio rápido del proyecto completo

---

**¿Necesitas ayuda?** Revisa los logs en:
- Backend: Terminal donde ejecutaste `npm run dev`
- Frontend: DevTools del navegador (F12) → Console
- Firebase: Firebase Console → Realtime Database
