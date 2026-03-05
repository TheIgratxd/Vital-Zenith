import { apiService } from "./api.service";

export interface VitalsData {
  temperature?: number;
  spo2?: number;
  heartRate?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  timestamp?: number;
}

export interface VitalsStats {
  temperature: {
    avg: number;
    min: number;
    max: number;
    count: number;
  };
  spo2: {
    avg: number;
    min: number;
    max: number;
    count: number;
  };
  heartRate: {
    avg: number;
    min: number;
    max: number;
    count: number;
  };
  bloodPressure: {
    systolic: {
      avg: number;
      min: number;
      max: number;
      count: number;
    };
    diastolic: {
      avg: number;
      min: number;
      max: number;
      count: number;
    };
  };
  totalReadings: number;
  period: string;
}

export interface ChartDataPoint {
  date: string;
  temperature: number;
  spo2: number;
  heartRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  readingsCount: number;
}

class VitalsService {
  async getCurrentVitals(pairCode?: string) {
    try {
      const query = pairCode ? `?pair_code=${pairCode}` : "";
      const response = await apiService.get<any>(`/vitals/current${query}`);
      return response.data;
    } catch (error) {
      console.error("Error getting current vitals:", error);
      throw error;
    }
  }

  async getVitalsHistory(
    pairCode?: string,
    startDate?: string,
    endDate?: string,
    limit: number = 100
  ) {
    try {
      const params = new URLSearchParams();
      if (pairCode) params.append("pair_code", pairCode);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      params.append("limit", limit.toString());
      const response = await apiService.get<any>(`/vitals/history?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error getting vitals history:", error);
      throw error;
    }
  }

  async getVitalsStats(days: number = 7, pairCode?: string) {
    try {
      const params = new URLSearchParams({ days: days.toString() });
      if (pairCode) params.append("pair_code", pairCode);
      const response = await apiService.get<any>(`/vitals/stats?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error getting vitals stats:", error);
      throw error;
    }
  }

  async getVitalsChartData(days: number = 7, pairCode?: string) {
    try {
      const params = new URLSearchParams({ days: days.toString() });
      if (pairCode) params.append("pair_code", pairCode);
      const response = await apiService.get<any>(`/vitals/chart?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error getting chart data:", error);
      throw error;
    }
  }
}

export const vitalsService = new VitalsService();
