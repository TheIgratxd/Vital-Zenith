import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase.config";
import { vitalsService } from "./services/vitals.service";
import type { VitalsData, VitalsStats, ChartDataPoint } from "./services/vitals.service";
import { authService } from "./services/auth.service";
import { braceletService } from "./services/bracelet.service";
import StatCard from "./components/StatCard";
import { LineChart, BarChart, WidgetCard } from "./components/Charts";
import "./DashboardNew.css";

function Dashboard() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Usuario");
  const [pairCode, setPairCode] = useState<string | null>(null);
  const [currentVitals, setCurrentVitals] = useState<VitalsData | null>(null);
  const [stats, setStats] = useState<VitalsStats | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState(7);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setUserName(user.displayName || user.email?.split("@")[0] || "Usuario");
      } else {
        setUserId(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Cargar pairCode del brazalete emparejado
  useEffect(() => {
    if (!userId) return;
    braceletService.getBraceletData().then((data) => {
      // pair_code viene del bracelet almacenado en Firestore
      if (data?.pair_code) setPairCode(data.pair_code);
      else if (data?.bracelet_id) setPairCode(data.bracelet_id);
    }).catch(() => {/* sin brazalete emparejado aún */});
  }, [userId]);

  // Fetch vitals data
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [currentResponse, statsResponse, chartResponse] = await Promise.all([
          vitalsService.getCurrentVitals(pairCode ?? undefined),
          vitalsService.getVitalsStats(30, pairCode ?? undefined),
          vitalsService.getVitalsChartData(chartPeriod, pairCode ?? undefined),
        ]);
        setCurrentVitals(currentResponse?.data || null);
        setStats(statsResponse?.stats || null);
        setChartData(chartResponse?.chartData || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching vitals:", error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [userId, pairCode, chartPeriod]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleChartPeriodChange = (days: number) => {
    setChartPeriod(days);
  };

  if (loading && !userId) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="dashboard-loading">
        <div className="error-message">
          <h2>⚠️ No autenticado</h2>
          <p>Por favor inicia sesión para continuar</p>
        </div>
      </div>
    );
  }

  // Calculate trends (simplified - you can make this more sophisticated)
  const getTrend = (current?: number, avg?: number) => {
    if (!current || !avg) return "neutral";
    const diff = ((current - avg) / avg) * 100;
    if (Math.abs(diff) < 2) return "neutral";
    return diff > 0 ? "positive" : "negative";
  };

  const getTrendValue = (current?: number, avg?: number) => {
    if (!current || !avg) return "0%";
    const diff = ((current - avg) / avg) * 100;
    return `${Math.abs(diff).toFixed(1)}%`;
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <span className="logo-icon">💊</span>
          <span className="logo-text">VITAL ZENITH</span>
        </div>

        <nav className="nav-menu">
          <a href="#" className="nav-item active">
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Home</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">📊</span>
            <span className="nav-text">Analytics</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">❤️</span>
            <span className="nav-text">Health</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">⭐</span>
            <span className="nav-text">Favorites</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">📍</span>
            <span className="nav-text">Location</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">✈️</span>
            <span className="nav-text">Travel</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">📈</span>
            <span className="nav-text">Reports</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">Settings</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1 className="page-title">HOME</h1>
            <div className="breadcrumb">
              <span className="breadcrumb-icon">🏠</span>
              <span>HOME &gt; DASHBOARD</span>
            </div>
          </div>

          <div className="header-right">
            <div className="search-box">
              <input type="text" placeholder="Buscar..." />
              <span className="search-icon">🔍</span>
            </div>
            <button className="notification-btn">
              🔔
              <span className="notification-badge">3</span>
            </button>
            <button className="help-btn">❓</button>
            <div className="user-profile">
              <span className="user-avatar">👤</span>
              <span className="user-name">{userName}</span>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatCard
            title="Temperatura"
            value={currentVitals?.temperature?.toFixed(1) || "--"}
            unit="°C"
            icon="🌡️"
            iconType="temperature"
            trend={getTrend(currentVitals?.temperature, stats?.temperature.avg)}
            trendValue={getTrendValue(currentVitals?.temperature, stats?.temperature.avg)}
            loading={loading}
          />

          <StatCard
            title="Frecuencia Cardíaca"
            value={currentVitals?.heartRate || "--"}
            unit="BPM"
            icon="💗"
            iconType="heart"
            trend={getTrend(currentVitals?.heartRate, stats?.heartRate.avg)}
            trendValue={getTrendValue(currentVitals?.heartRate, stats?.heartRate.avg)}
            loading={loading}
          />

          <StatCard
            title="Oxigenación"
            value={currentVitals?.spo2 || "--"}
            unit="%"
            icon="🫁"
            iconType="oxygen"
            trend={getTrend(currentVitals?.spo2, stats?.spo2.avg)}
            trendValue={getTrendValue(currentVitals?.spo2, stats?.spo2.avg)}
            loading={loading}
          />

          <StatCard
            title="Presión Arterial"
            value={
              currentVitals?.bloodPressure
                ? `${currentVitals.bloodPressure.systolic}/${currentVitals.bloodPressure.diastolic}`
                : "--"
            }
            unit="mmHg"
            icon="📊"
            iconType="pressure"
            loading={loading}
          />
        </div>

        {/* Widgets and Chart Row */}
        <div className="dashboard-row">
          <div className="widgets-column">
            <WidgetCard
              title="Estado de Salud"
              value="Normal"
              icon="❤️"
              type="health"
            />
            <WidgetCard
              title="Última Actualización"
              value={
                currentVitals?.timestamp
                  ? new Date(currentVitals.timestamp).toLocaleTimeString("es-MX", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "--:--"
              }
              icon="🕐"
              type="weather"
            />
            
            <div className="update-section">
              <div className="update-icon-container">
                <div className="update-icon">↓</div>
              </div>
              <div className="update-text">ACTUALIZACIONES</div>
            </div>
          </div>

          <div className="chart-column">
            <div className="chart-container">
              <div className="chart-header">
                <div>
                  <div className="chart-title">Tendencia de Signos Vitales</div>
                  <div className="chart-subtitle">Últimos {chartPeriod} días</div>
                </div>
                <div className="chart-controls">
                  <button
                    className={`chart-button ${chartPeriod === 7 ? "active" : ""}`}
                    onClick={() => handleChartPeriodChange(7)}
                  >
                    7D
                  </button>
                  <button
                    className={`chart-button ${chartPeriod === 14 ? "active" : ""}`}
                    onClick={() => handleChartPeriodChange(14)}
                  >
                    14D
                  </button>
                  <button
                    className={`chart-button ${chartPeriod === 30 ? "active" : ""}`}
                    onClick={() => handleChartPeriodChange(30)}
                  >
                    30D
                  </button>
                </div>
              </div>
              {loading ? (
                <div className="chart-loading">
                  <div className="spinner"></div>
                </div>
              ) : (
                <LineChart
                  title=""
                  data={chartData.map((d) => ({
                    date: d.date,
                    value: d.heartRate,
                  }))}
                  color="#10b981"
                />
              )}
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="dashboard-row-full">
          <BarChart
            title="Lecturas por Día"
            subtitle="Número de mediciones realizadas"
            data={chartData.map((d) => ({
              date: d.date,
              value: d.readingsCount,
              label: new Date(d.date).toLocaleDateString("es-MX", {
                day: "2-digit",
                month: "short",
              }),
            }))}
            loading={loading}
          />
        </div>

        {/* Stats Summary */}
        {stats && (
          <div className="stats-summary">
            <h3>Resumen Estadístico (últimos 30 días)</h3>
            <div className="stats-table">
              <div className="stats-row">
                <div className="stats-label">Temperatura Promedio:</div>
                <div className="stats-value">{stats.temperature.avg.toFixed(1)}°C</div>
                <div className="stats-range">
                  (Min: {stats.temperature.min}°C, Max: {stats.temperature.max}°C)
                </div>
              </div>
              <div className="stats-row">
                <div className="stats-label">Frecuencia Cardíaca Promedio:</div>
                <div className="stats-value">{stats.heartRate.avg.toFixed(0)} BPM</div>
                <div className="stats-range">
                  (Min: {stats.heartRate.min} BPM, Max: {stats.heartRate.max} BPM)
                </div>
              </div>
              <div className="stats-row">
                <div className="stats-label">Oxigenación Promedio:</div>
                <div className="stats-value">{stats.spo2.avg.toFixed(1)}%</div>
                <div className="stats-range">
                  (Min: {stats.spo2.min}%, Max: {stats.spo2.max}%)
                </div>
              </div>
              <div className="stats-row">
                <div className="stats-label">Total de Lecturas:</div>
                <div className="stats-value">{stats.totalReadings}</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
