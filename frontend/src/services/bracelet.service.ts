import axios from "axios";
import { auth } from "../config/firebase.config";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export interface VitalSigns {
  pulse: number;
  spo2: number;
  temperature: number;
  timestamp: Date;
}

export interface BraceletData {
  bracelet_id: string;
  status: "available" | "paired";
  last_data: VitalSigns;
}

class BraceletService {
  // Obtener el token del usuario actual
  private async getAuthToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }

  // Emparejar brazalete
  async pairBracelet(pairCode: string): Promise<{
    success: boolean;
    message: string;
    bracelet_id?: string;
  }> {
    try {
      const token = await this.getAuthToken();

      const response = await axios.post(
        `${API_URL}/bracelet/pair`,
        { pair_code: pairCode },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("Error al emparejar brazalete:", error);
      throw new Error(
        error.response?.data?.error || "Error al emparejar brazalete"
      );
    }
  }

  // Desvincular brazalete
  async unpairBracelet(braceletId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const token = await this.getAuthToken();

      const response = await axios.post(
        `${API_URL}/bracelet/unpair`,
        { bracelet_id: braceletId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("Error al desvincular brazalete:", error);
      throw new Error(
        error.response?.data?.error || "Error al desvincular brazalete"
      );
    }
  }

  // Obtener datos del brazalete
  async getBraceletData(): Promise<BraceletData> {
    try {
      const token = await this.getAuthToken();

      const response = await axios.get(`${API_URL}/bracelet/data`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error("Error al obtener datos del brazalete:", error);
      throw new Error(error.response?.data?.error || "Error al obtener datos");
    }
  }
}

export const braceletService = new BraceletService();
