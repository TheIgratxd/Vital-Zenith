import { realtimeDb } from "../config/firebase";

export class VitalsService {
  /**
   * Obtener datos actuales usando el pair_code como clave en RTDB
   */
  async getCurrentVitals(pairCode: string) {
    try {
      const snapshot = await realtimeDb
        .ref(`bracelets/${pairCode}/currentData`)
        .once("value");
      const data = snapshot.val();

      if (!data) {
        return { pairCode, message: "No hay datos disponibles", data: null };
      }

      return { pairCode, data };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener historial de datos vitales
   */
  async getVitalsHistory(
    pairCode: string,
    startDate?: string,
    endDate?: string,
    limit: number = 100
  ) {
    try {
      const baseRef = realtimeDb.ref(`bracelets/${pairCode}/history`);
      const historyRef =
        startDate && endDate
          ? baseRef.orderByKey().startAt(startDate).endAt(endDate)
          : baseRef.orderByKey();

      const historySnapshot = await historyRef.limitToLast(limit).once("value");
      const historyData = historySnapshot.val();

      if (!historyData) {
        return { pairCode, history: [] };
      }

      const formattedHistory: any[] = [];
      Object.keys(historyData).forEach((date) => {
        const dayData = historyData[date];
        Object.keys(dayData).forEach((timestamp) => {
          formattedHistory.push({
            timestamp: parseInt(timestamp),
            date,
            ...dayData[timestamp],
          });
        });
      });

      formattedHistory.sort((a, b) => b.timestamp - a.timestamp);

      return { pairCode, history: formattedHistory };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas (promedios, máximos, mínimos)
   */
  async getVitalsStats(pairCode: string, days: number = 7) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const historyData = await this.getVitalsHistory(
        pairCode,
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0]
      );

      if (!historyData.history || historyData.history.length === 0) {
        return {
          pairCode,
          period: `${days} days`,
          stats: null,
          message: "No hay suficientes datos para generar estadísticas",
        };
      }

      const history = historyData.history;
      const stats = {
        temperature: this.calculateStats(
          history.map((h) => h.temperature).filter((v) => v !== undefined)
        ),
        spo2: this.calculateStats(
          history.map((h) => h.spo2).filter((v) => v !== undefined)
        ),
        heartRate: this.calculateStats(
          history.map((h) => h.heartRate).filter((v) => v !== undefined)
        ),
        bloodPressure: {
          systolic: this.calculateStats(
            history.map((h) => h.bloodPressure?.systolic).filter((v) => v !== undefined)
          ),
          diastolic: this.calculateStats(
            history.map((h) => h.bloodPressure?.diastolic).filter((v) => v !== undefined)
          ),
        },
        totalReadings: history.length,
        period: `${days} days`,
      };

      return { pairCode, stats };
    } catch (error) {
      throw error;
    }
  }

  private calculateStats(values: number[]) {
    if (values.length === 0) return { avg: 0, min: 0, max: 0, count: 0 };
    const sum = values.reduce((acc, val) => acc + val, 0);
    return {
      avg: parseFloat((sum / values.length).toFixed(2)),
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    };
  }

  /**
   * Obtener datos para gráficos por día
   */
  async getVitalsChartData(pairCode: string, days: number = 7) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const historyData = await this.getVitalsHistory(
        pairCode,
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0]
      );

      if (!historyData.history || historyData.history.length === 0) {
        return { pairCode, chartData: [], message: "No hay datos disponibles" };
      }

      const dayGroups: { [key: string]: any[] } = {};
      historyData.history.forEach((reading) => {
        if (!dayGroups[reading.date]) dayGroups[reading.date] = [];
        dayGroups[reading.date].push(reading);
      });

      const chartData = Object.keys(dayGroups)
        .sort()
        .map((date) => {
          const readings = dayGroups[date];
          return {
            date,
            temperature: this.calculateStats(
              readings.map((r) => r.temperature).filter((v) => v !== undefined)
            ).avg,
            spo2: this.calculateStats(
              readings.map((r) => r.spo2).filter((v) => v !== undefined)
            ).avg,
            heartRate: this.calculateStats(
              readings.map((r) => r.heartRate).filter((v) => v !== undefined)
            ).avg,
            bloodPressureSystolic: this.calculateStats(
              readings.map((r) => r.bloodPressure?.systolic).filter((v) => v !== undefined)
            ).avg,
            bloodPressureDiastolic: this.calculateStats(
              readings.map((r) => r.bloodPressure?.diastolic).filter((v) => v !== undefined)
            ).avg,
            readingsCount: readings.length,
          };
        });

      return { pairCode, chartData };
    } catch (error) {
      throw error;
    }
  }
}

export const vitalsService = new VitalsService();
