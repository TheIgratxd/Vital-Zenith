# 📊 Dashboard de Signos Vitales - Configuración

## 🔥 Configuración de Firebase Realtime Database

### 1. Habilitar Realtime Database en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. En el menú lateral, ve a **Build** > **Realtime Database**
4. Haz clic en **Create Database**
5. Selecciona una ubicación (ej: `us-central1`)
6. Elige modo **Test** para desarrollo (o Production con reglas personalizadas)

### 2. Estructura de Datos en Realtime Database

Crea la siguiente estructura en tu Realtime Database:

```json
{
  "bracelets": {
    "BRACELET_001": {
      "userId": "USER_UID_AQUI",
      "currentData": {
        "temperature": 36.5,
        "spo2": 98,
        "heartRate": 72,
        "bloodPressure": {
          "systolic": 120,
          "diastolic": 80
        },
        "timestamp": 1709683200000
      },
      "history": {
        "2024-03-05": {
          "1709683200000": {
            "temperature": 36.5,
            "spo2": 98,
            "heartRate": 72,
            "bloodPressure": {
              "systolic": 120,
              "diastolic": 80
            }
          },
          "1709686800000": {
            "temperature": 36.7,
            "spo2": 97,
            "heartRate": 75,
            "bloodPressure": {
              "systolic": 118,
              "diastolic": 78
            }
          }
        },
        "2024-03-06": {
          "1709769600000": {
            "temperature": 36.6,
            "spo2": 99,
            "heartRate": 70,
            "bloodPressure": {
              "systolic": 122,
              "diastolic": 82
            }
          }
        }
      }
    }
  },
  "users": {
    "USER_UID_AQUI": {
      "braceletId": "BRACELET_001",
      "email": "usuario@example.com",
      "name": "Usuario Demo"
    }
  }
}
```

### 3. Reglas de Seguridad (Para Desarrollo)

En la pestaña **Rules** de Realtime Database, configura:

```json
{
  "rules": {
    "bracelets": {
      "$braceletId": {
        ".read": true,
        ".write": true
      }
    },
    "users": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid"
      }
    }
  }
}
```

**⚠️ Para producción, usa reglas más restrictivas:**

```json
{
  "rules": {
    "bracelets": {
      "$braceletId": {
        ".read": "auth != null && root.child('users').child(auth.uid).child('braceletId').val() === $braceletId",
        ".write": "auth != null && root.child('users').child(auth.uid).child('braceletId').val() === $braceletId"
      }
    },
    "users": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid"
      }
    }
  }
}
```

### 4. Obtener URL de Realtime Database

1. En Firebase Console, ve a Realtime Database
2. Copia la URL que aparece en la parte superior (ej: `https://tu-proyecto-default-rtdb.firebaseio.com/`)
3. Actualiza el archivo `/backend/src/config/firebase.ts`:

```typescript
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
  databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com"
});
```

## 🚀 APIs HTTP Disponibles

### Base URL
```
http://localhost:3000/api
```

### Autenticación
Todas las rutas de vitals requieren autenticación. Incluye el token de Firebase en el header:

```
Authorization: Bearer YOUR_FIREBASE_ID_TOKEN
```

### Endpoints

#### 1. **GET /api/vitals/current**
Obtiene los datos vitales actuales del usuario autenticado.

**Response:**
```json
{
  "success": true,
  "data": {
    "braceletId": "BRACELET_001",
    "data": {
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
```

#### 2. **GET /api/vitals/history**
Obtiene el historial de datos vitales.

**Query Parameters:**
- `startDate` (opcional): Fecha de inicio en formato `YYYY-MM-DD`
- `endDate` (opcional): Fecha de fin en formato `YYYY-MM-DD`
- `limit` (opcional): Número máximo de resultados (default: 100)

**Ejemplo:**
```
GET /api/vitals/history?startDate=2024-03-01&endDate=2024-03-05&limit=50
```

**Response:**
```json
{
  "success": true,
  "data": {
    "braceletId": "BRACELET_001",
    "history": [
      {
        "timestamp": 1709683200000,
        "date": "2024-03-05",
        "temperature": 36.5,
        "spo2": 98,
        "heartRate": 72,
        "bloodPressure": {
          "systolic": 120,
          "diastolic": 80
        }
      }
    ]
  }
}
```

#### 3. **GET /api/vitals/stats**
Obtiene estadísticas (promedios, mínimos, máximos) de los signos vitales.

**Query Parameters:**
- `days` (opcional): Número de días para calcular estadísticas (default: 7)

**Ejemplo:**
```
GET /api/vitals/stats?days=30
```

**Response:**
```json
{
  "success": true,
  "data": {
    "braceletId": "BRACELET_001",
    "stats": {
      "temperature": {
        "avg": 36.6,
        "min": 36.2,
        "max": 37.1,
        "count": 150
      },
      "spo2": {
        "avg": 98.2,
        "min": 95,
        "max": 100,
        "count": 150
      },
      "heartRate": {
        "avg": 72.5,
        "min": 60,
        "max": 85,
        "count": 150
      },
      "bloodPressure": {
        "systolic": {
          "avg": 120.5,
          "min": 110,
          "max": 135,
          "count": 150
        },
        "diastolic": {
          "avg": 80.2,
          "min": 70,
          "max": 90,
          "count": 150
        }
      },
      "totalReadings": 150,
      "period": "30 days"
    }
  }
}
```

#### 4. **GET /api/vitals/chart**
Obtiene datos agregados por día para generar gráficos.

**Query Parameters:**
- `days` (opcional): Número de días para obtener datos (default: 7)

**Ejemplo:**
```
GET /api/vitals/chart?days=14
```

**Response:**
```json
{
  "success": true,
  "data": {
    "braceletId": "BRACELET_001",
    "chartData": [
      {
        "date": "2024-03-01",
        "temperature": 36.5,
        "spo2": 98.5,
        "heartRate": 72.3,
        "bloodPressureSystolic": 120.5,
        "bloodPressureDiastolic": 80.2,
        "readingsCount": 12
      },
      {
        "date": "2024-03-02",
        "temperature": 36.6,
        "spo2": 97.8,
        "heartRate": 74.1,
        "bloodPressureSystolic": 118.3,
        "bloodPressureDiastolic": 79.5,
        "readingsCount": 15
      }
    ]
  }
}
```

## 🧪 Datos de Prueba (Simulación de ESP32)

### Script Python para simular datos del ESP32

Crea un archivo `simulate_esp32.py`:

```python
import requests
import json
import time
import random
from datetime import datetime

# URL de tu Firebase Realtime Database
DATABASE_URL = "https://tu-proyecto-default-rtdb.firebaseio.com"
BRACELET_ID = "BRACELET_001"

def generate_vitals():
    return {
        "temperature": round(random.uniform(36.0, 37.5), 1),
        "spo2": random.randint(95, 100),
        "heartRate": random.randint(60, 90),
        "bloodPressure": {
            "systolic": random.randint(110, 130),
            "diastolic": random.randint(70, 85)
        },
        "timestamp": int(time.time() * 1000)
    }

def send_data():
    vitals = generate_vitals()
    
    # Actualizar datos actuales
    current_url = f"{DATABASE_URL}/bracelets/{BRACELET_ID}/currentData.json"
    requests.put(current_url, data=json.dumps(vitals))
    
    # Agregar al historial
    date_str = datetime.now().strftime("%Y-%m-%d")
    timestamp = vitals["timestamp"]
    history_url = f"{DATABASE_URL}/bracelets/{BRACELET_ID}/history/{date_str}/{timestamp}.json"
    requests.put(history_url, data=json.dumps(vitals))
    
    print(f"✅ Datos enviados: Temp={vitals['temperature']}°C, HR={vitals['heartRate']} BPM, SpO2={vitals['spo2']}%")

if __name__ == "__main__":
    print("🚀 Iniciando simulación de ESP32...")
    while True:
        send_data()
        time.sleep(30)  # Envía datos cada 30 segundos
```

Ejecuta:
```bash
pip install requests
python simulate_esp32.py
```

### Código Arduino/ESP32

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "TU_WIFI";
const char* password = "TU_PASSWORD";
const char* databaseURL = "https://tu-proyecto-default-rtdb.firebaseio.com";
const char* braceletID = "BRACELET_001";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    // Leer sensores (aquí simularemos datos)
    float temperature = random(360, 375) / 10.0;
    int spo2 = random(95, 101);
    int heartRate = random(60, 90);
    int systolic = random(110, 130);
    int diastolic = random(70, 85);
    long timestamp = millis();
    
    // Crear JSON
    StaticJsonDocument<256> doc;
    doc["temperature"] = temperature;
    doc["spo2"] = spo2;
    doc["heartRate"] = heartRate;
    doc["bloodPressure"]["systolic"] = systolic;
    doc["bloodPressure"]["diastolic"] = diastolic;
    doc["timestamp"] = timestamp;
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    // Enviar a Firebase Realtime Database
    HTTPClient http;
    String url = String(databaseURL) + "/bracelets/" + braceletID + "/currentData.json";
    
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    int httpResponseCode = http.PUT(jsonString);
    
    if (httpResponseCode > 0) {
      Serial.printf("✅ Datos enviados: %d\n", httpResponseCode);
    } else {
      Serial.printf("❌ Error: %s\n", http.errorToString(httpResponseCode).c_str());
    }
    
    http.end();
  }
  
  delay(30000); // Envía cada 30 segundos
}
```

## 🏃 Iniciar el Proyecto

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📝 Notas Importantes

1. **Reemplaza el placeholder** en `/backend/src/config/firebase.ts` con tu URL real de Realtime Database
2. **USER_UID_AQUI** debe ser reemplazado con el UID real del usuario después de registrarse
3. **BRACELET_001** es un ID de ejemplo, puedes usar los IDs de tus brazaletes reales
4. Los timestamps están en milisegundos (formato Unix timestamp * 1000)
5. Para usar el nuevo dashboard, importa `DashboardNew.tsx` en lugar de `Dashboard.tsx`

## 🎨 Usar el Nuevo Dashboard

En `/frontend/src/main.tsx`, cambia la importación:

```typescript
import Dashboard from './DashboardNew'; // Nuevo dashboard con métricas
```

¡Listo! 🎉
