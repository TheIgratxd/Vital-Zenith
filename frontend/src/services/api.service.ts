import axios from "axios";
import type { AxiosInstance, AxiosError } from "axios";
import { auth } from "../config/firebase.config";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Interceptor para agregar el token automáticamente
    this.api.interceptors.request.use(
      async (config) => {
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken();
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para manejar errores
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expirado o inválido
          console.error("Token inválido o expirado");
          // Aquí podrías redirigir al login
        }
        return Promise.reject(error);
      }
    );
  }

  // Método para verificar la salud del servidor
  async healthCheck() {
    const response = await this.api.get("/health");
    return response.data;
  }

  // Método para verificar el token
  async verifyToken() {
    const response = await this.api.get("/auth/verify");
    return response.data;
  }

  // Método para obtener información del usuario
  async getCurrentUser() {
    const response = await this.api.get("/auth/me");
    return response.data;
  }

  // Método genérico GET
  async get<T>(endpoint: string): Promise<T> {
    const response = await this.api.get<T>(endpoint);
    return response.data;
  }

  // Método genérico POST
  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await this.api.post<T>(endpoint, data);
    return response.data;
  }

  // Método genérico PUT
  async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await this.api.put<T>(endpoint, data);
    return response.data;
  }

  // Método genérico DELETE
  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.api.delete<T>(endpoint);
    return response.data;
  }
}

export const apiService = new ApiService();
