import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { ref, onValue, off } from "firebase/database";
import { auth, db, realtimeDb } from "./config/firebase.config";
import { braceletService } from "./services/bracelet.service";
import PairBracelet from "./components/PairBracelet";
import "./Dashboard.css";

interface BraceletData {
  bracelet_id: string;
  pair_code?: string;
  mac_address?: string;
  status: "active" | "inactive" | "available" | "paired";
}

interface Vitals {
  heartRate?: number;
  spo2?: number;
  temperature?: number;
  timestamp?: number;
}

function Dashboard() {
  const [userId, setUserId] = useState<string | null>(null);
  const [braceletId, setBraceletId] = useState<string | null>(null);
  const [braceletData, setBraceletData] = useState<BraceletData | null>(null);
  const [vitals, setVitals] = useState<Vitals | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPairModal, setShowPairModal] = useState(false);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // User document listener (to get bracelet_id)
  useEffect(() => {
    if (!userId) return;

    const userDocRef = doc(db, "users", userId);
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setBraceletId(userData.bracelet_id || null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to user document:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Bracelet data listener (real-time vital signs)
  useEffect(() => {
    if (!braceletId) {
      setBraceletData(null);
      return;
    }

    const braceletDocRef = doc(db, "bracelets", braceletId);
    const unsubscribe = onSnapshot(
      braceletDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setBraceletData(docSnap.data() as BraceletData);
        } else {
          setBraceletData(null);
        }
      },
      (error) => {
        console.error("Error listening to bracelet document:", error);
      }
    );

    return () => unsubscribe();
  }, [braceletId]);

  // RTDB vitals listener — using pair_code from bracelet Firestore doc
  useEffect(() => {
    const pairCode = braceletData?.pair_code;
    if (!pairCode) {
      setVitals(null);
      return;
    }

    const vitalsRef = ref(realtimeDb, `bracelets/${pairCode}/currentData`);
    onValue(vitalsRef, (snapshot) => {
      if (snapshot.exists()) {
        setVitals(snapshot.val() as Vitals);
      } else {
        setVitals(null);
      }
    });

    return () => off(vitalsRef);
  }, [braceletData?.pair_code]);

  const handlePairSuccess = () => {
    setShowPairModal(false);
    // The listeners will automatically update the UI
  };

  const handleUnpair = async () => {
    if (!braceletId) return;

    if (
      window.confirm("¿Estás seguro de que deseas desemparejar este brazalete?")
    ) {
      try {
        await braceletService.unpairBracelet(braceletId);
        setBraceletId(null);
        setBraceletData(null);
      } catch (error) {
        console.error("Error unpairing bracelet:", error);
        alert("Error al desemparejar el brazalete");
      }
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "Sin datos";

    try {
      const date =
        timestamp.toDate instanceof Function
          ? timestamp.toDate()
          : new Date(timestamp);
      return date.toLocaleString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="dashboard-container">
        <div className="error-card">
          <h2>⚠️ No autenticado</h2>
          <p>Por favor inicia sesión para continuar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard Vital-Zenith</h1>
          <p className="header-subtitle">
            Monitoreo de signos vitales en tiempo real
          </p>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Bracelet Status Section */}
        <section className="bracelet-status-section">
          {!braceletId ? (
            <div className="no-bracelet-card">
              <div className="bracelet-icon-large">📟</div>
              <h2>No tienes un brazalete emparejado</h2>
              <p>
                Para comenzar a monitorear tus signos vitales, empareja tu
                dispositivo Ixchel
              </p>
              <button
                className="pair-button"
                onClick={() => setShowPairModal(true)}
              >
                Emparejar Brazalete
              </button>
            </div>
          ) : (
            <div className="bracelet-info-card">
              <div className="bracelet-header">
                <div className="bracelet-icon-status">
                  <div
                    className={`status-indicator ${
                      braceletData?.status || "inactive"
                    }`}
                  ></div>
                  <span className="bracelet-id">ID: {braceletId}</span>
                </div>
                <button className="unpair-button" onClick={handleUnpair}>
                  Desemparejar
                </button>
              </div>
              {braceletData?.mac_address && (
                <p className="mac-address">MAC: {braceletData.mac_address}</p>
              )}
              <p className="last-update">
                Última actualización:{" "}
                {formatTimestamp(vitals?.timestamp)}
              </p>
            </div>
          )}
        </section>

        {/* Vital Signs Section */}
        {braceletId && (
          <section className="vital-signs-section">
            <h2 className="section-title">Signos Vitales</h2>
            <div className="vital-cards-grid">
              {/* Heart Rate Card */}
              <div className="vital-card pulse">
                <div className="vital-icon">❤️</div>
                <div className="vital-content">
                  <h3>Frecuencia Cardíaca</h3>
                  <div className="vital-value">
                    {vitals?.heartRate || "--"}
                    <span className="vital-unit">bpm</span>
                  </div>
                  <div className="vital-status">
                    {vitals?.heartRate ? (
                      vitals.heartRate >= 60 &&
                      vitals.heartRate <= 100 ? (
                        <span className="status-normal">✓ Normal</span>
                      ) : (
                        <span className="status-abnormal">⚠ Anormal</span>
                      )
                    ) : (
                      <span className="status-no-data">Sin datos</span>
                    )}
                  </div>
                </div>
              </div>

              {/* SpO2 Card */}
              <div className="vital-card spo2">
                <div className="vital-icon">💨</div>
                <div className="vital-content">
                  <h3>Saturación de Oxígeno</h3>
                  <div className="vital-value">
                    {vitals?.spo2 || "--"}
                    <span className="vital-unit">%</span>
                  </div>
                  <div className="vital-status">
                    {vitals?.spo2 ? (
                      vitals.spo2 >= 95 ? (
                        <span className="status-normal">✓ Normal</span>
                      ) : vitals.spo2 >= 90 ? (
                        <span className="status-warning">⚠ Bajo</span>
                      ) : (
                        <span className="status-abnormal">⚠ Crítico</span>
                      )
                    ) : (
                      <span className="status-no-data">Sin datos</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Temperature Card */}
              <div className="vital-card temperature">
                <div className="vital-icon">🌡️</div>
                <div className="vital-content">
                  <h3>Temperatura Corporal</h3>
                  <div className="vital-value">
                    {vitals?.temperature || "--"}
                    <span className="vital-unit">°C</span>
                  </div>
                  <div className="vital-status">
                    {vitals?.temperature ? (
                      vitals.temperature >= 36.1 &&
                      vitals.temperature <= 37.2 ? (
                        <span className="status-normal">✓ Normal</span>
                      ) : (
                        <span className="status-abnormal">⚠ Anormal</span>
                      )
                    ) : (
                      <span className="status-no-data">Sin datos</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Info Section */}
        {braceletId && (
          <section className="info-section">
            <div className="info-card">
              <h3>📊 Información del sistema</h3>
              <ul>
                <li>Los datos se actualizan automáticamente en tiempo real</li>
                <li>El brazalete debe estar encendido y conectado a WiFi</li>
                <li>Valores de referencia para adultos en reposo</li>
                <li>
                  Consulta a tu médico si observas valores anormales constantes
                </li>
              </ul>
            </div>
          </section>
        )}
      </main>

      {/* Pairing Modal */}
      {showPairModal && (
        <div className="modal-overlay" onClick={() => setShowPairModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <PairBracelet
              onSuccess={handlePairSuccess}
              onCancel={() => setShowPairModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
