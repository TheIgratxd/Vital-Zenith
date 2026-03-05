#!/usr/bin/env python3
"""
Script para simular datos del ESP32 y enviarlos a Firebase Realtime Database
Simula un brazalete enviando temperatura, oxigenación, presión arterial y frecuencia cardíaca
"""

import requests
import json
import time
import random
from datetime import datetime, timedelta

# ==================== CONFIGURACIÓN ====================
DATABASE_URL = "https://ixchel-db-default-rtdb.firebaseio.com/"
# PAIR_CODE: el código de 6 dígitos impreso en el brazalete físico.
# Este mismo código es el que el usuario escribe en la app para emparejar.
# Es también la clave en RTDB: bracelets/{PAIR_CODE}/currentData
PAIR_CODE = "482751"   # ← Cambia esto al pair_code de tu brazalete
USER_ID = "stbrewYhkNXyXAH4nf90z4pN9n03"  # UID del usuario en Firebase Auth

# ==================== FUNCIONES ====================

def generate_realistic_vitals():
    """Genera datos vitales realistas"""
    # Temperatura corporal normal: 36.1°C - 37.2°C
    temperature = round(random.uniform(36.1, 37.2), 1)
    
    # SpO2 (saturación de oxígeno): 95% - 100%
    spo2 = random.randint(95, 100)
    
    # Frecuencia cardíaca en reposo: 60 - 90 BPM
    heartRate = random.randint(60, 90)
    
    # Presión arterial normal
    # Sistólica: 110 - 130 mmHg
    # Diastólica: 70 - 85 mmHg
    systolic = random.randint(110, 130)
    diastolic = random.randint(70, 85)
    
    # Timestamp en milisegundos
    timestamp = int(time.time() * 1000)
    
    return {
        "temperature": temperature,
        "spo2": spo2,
        "heartRate": heartRate,
        "bloodPressure": {
            "systolic": systolic,
            "diastolic": diastolic
        },
        "timestamp": timestamp
    }

def send_current_data(vitals):
    """Envía datos actuales al brazalete"""
    try:
        url = f"{DATABASE_URL}/bracelets/{PAIR_CODE}/currentData.json"
        response = requests.put(url, data=json.dumps(vitals))
        
        if response.status_code == 200:
            return True
        else:
            print(f"❌ Error al enviar datos actuales: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Excepción al enviar datos actuales: {str(e)}")
        return False

def send_history_data(vitals):
    """Agrega datos al historial"""
    try:
        date_str = datetime.now().strftime("%Y-%m-%d")
        timestamp = vitals["timestamp"]
        url = f"{DATABASE_URL}/bracelets/{PAIR_CODE}/history/{date_str}/{timestamp}.json"
        
        response = requests.put(url, data=json.dumps(vitals))
        
        if response.status_code == 200:
            return True
        else:
            print(f"❌ Error al agregar al historial: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Excepción al agregar al historial: {str(e)}")
        return False

def setup_user_bracelet_link():
    """Configura el enlace entre usuario y brazalete en RTDB (para pruebas sin pairing UI)"""
    try:
        url = f"{DATABASE_URL}/users/{USER_ID}.json"
        user_data = {
            "pairCode": PAIR_CODE,
            "email": "demo@example.com",
            "name": "Usuario Demo"
        }
        
        response = requests.put(url, data=json.dumps(user_data))
        
        if response.status_code == 200:
            print("✅ Usuario vinculado al brazalete")
            return True
        else:
            print(f"❌ Error al vincular usuario: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Excepción al vincular usuario: {str(e)}")
        return False

def generate_historical_data(days=7):
    """Genera datos históricos para los últimos N días"""
    print(f"\n📊 Generando datos históricos para los últimos {days} días...")
    
    for day in range(days, 0, -1):
        date = datetime.now() - timedelta(days=day)
        date_str = date.strftime("%Y-%m-%d")
        
        # Generar entre 15-20 lecturas por día
        readings_per_day = random.randint(15, 20)
        
        print(f"  📅 {date_str}: {readings_per_day} lecturas")
        
        for i in range(readings_per_day):
            # Distribuir lecturas a lo largo del día
            hour = int((24 / readings_per_day) * i)
            minute = random.randint(0, 59)
            
            timestamp_dt = date.replace(hour=hour, minute=minute, second=random.randint(0, 59))
            timestamp = int(timestamp_dt.timestamp() * 1000)
            
            vitals = generate_realistic_vitals()
            vitals["timestamp"] = timestamp
            
            try:
                url = f"{DATABASE_URL}/bracelets/{PAIR_CODE}/history/{date_str}/{timestamp}.json"
                requests.put(url, data=json.dumps(vitals))
                time.sleep(0.1)  # Pequeña pausa para no saturar la API
            except Exception as e:
                print(f"    ❌ Error en lectura {i+1}: {str(e)}")
        
        print(f"  ✅ Completado: {date_str}")
    
    print("✅ Datos históricos generados exitosamente\n")

def monitor_mode():
    """Modo de monitoreo continuo"""
    print("\n🔄 Iniciando modo de monitoreo continuo...")
    print("   Presiona Ctrl+C para detener\n")
    
    try:
        while True:
            vitals = generate_realistic_vitals()
            
            # Enviar datos actuales
            if send_current_data(vitals):
                print(f"✅ [{datetime.now().strftime('%H:%M:%S')}] Temp: {vitals['temperature']}°C | "
                      f"HR: {vitals['heartRate']} BPM | SpO2: {vitals['spo2']}% | "
                      f"BP: {vitals['bloodPressure']['systolic']}/{vitals['bloodPressure']['diastolic']} mmHg")
            
            # Agregar al historial
            send_history_data(vitals)
            
            # Esperar 5 segundos antes de la siguiente lectura
            time.sleep(5)
            
    except KeyboardInterrupt:
        print("\n\n⏹️  Monitoreo detenido por el usuario")

def print_banner():
    """Muestra el banner inicial"""
    print("""
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     🩺  SIMULADOR DE BRAZALETE ESP32                     ║
║         Vital Zenith - Health Monitoring System          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    """)

def main():
    """Función principal"""
    print_banner()
    
    print("\n📋 CONFIGURACIÓN:")
    print(f"   Database URL: {DATABASE_URL}")
    print(f"   Pair Code:    {PAIR_CODE}")
    print(f"   User ID:      {USER_ID}")
    
    print("\n" + "="*60)
    print("Selecciona una opción:")
    print("="*60)
    print("1. Configurar usuario y brazalete")
    print("2. Generar datos históricos (últimos 7 días)")
    print("3. Generar datos históricos (últimos 30 días)")
    print("4. Iniciar monitoreo continuo")
    print("5. Todo lo anterior (configuración completa)")
    print("0. Salir")
    print("="*60)
    
    try:
        option = input("\nOpción: ").strip()
        
        if option == "1":
            setup_user_bracelet_link()
        
        elif option == "2":
            generate_historical_data(days=7)
        
        elif option == "3":
            generate_historical_data(days=30)
        
        elif option == "4":
            monitor_mode()
        
        elif option == "5":
            print("\n🚀 Configuración completa iniciada...\n")
            setup_user_bracelet_link()
            time.sleep(1)
            generate_historical_data(days=30)
            time.sleep(1)
            monitor_mode()
        
        elif option == "0":
            print("\n👋 ¡Hasta luego!\n")
        
        else:
            print("\n❌ Opción no válida\n")
    
    except KeyboardInterrupt:
        print("\n\n👋 ¡Hasta luego!\n")

if __name__ == "__main__":
    main()
