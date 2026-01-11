import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../config/firebase.config";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  // Registrar un nuevo usuario
  async register(data: RegisterData): Promise<User> {
    try {
      // 1. Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // 2. Actualizar el perfil con el nombre
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: data.name,
        });

        // 3. Crear usuario en Firestore a través del backend
        try {
          await axios.post(`${API_URL}/auth/create`, {
            uid: userCredential.user.uid,
            name: data.name,
            email: data.email,
          });
        } catch (firestoreError) {
          console.error("Error al crear usuario en Firestore:", firestoreError);
          // No lanzamos error aquí para no bloquear el registro
        }
      }

      return userCredential.user;
    } catch (error: any) {
      console.error("Error al registrar usuario:", error);
      throw this.handleAuthError(error);
    }
  }

  // Iniciar sesión
  async login(data: LoginData): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      return userCredential.user;
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error);
      throw this.handleAuthError(error);
    }
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error("Error al cerrar sesión:", error);
      throw this.handleAuthError(error);
    }
  }

  // Obtener el usuario actual
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Obtener el token del usuario actual
  async getCurrentUserToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }

  // Manejar errores de autenticación
  private handleAuthError(error: any): Error {
    const errorCode = error.code;
    let errorMessage = "Error desconocido";

    switch (errorCode) {
      case "auth/email-already-in-use":
        errorMessage = "El email ya está registrado";
        break;
      case "auth/invalid-email":
        errorMessage = "Email inválido";
        break;
      case "auth/operation-not-allowed":
        errorMessage = "Operación no permitida";
        break;
      case "auth/weak-password":
        errorMessage = "La contraseña es muy débil";
        break;
      case "auth/user-disabled":
        errorMessage = "Usuario deshabilitado";
        break;
      case "auth/user-not-found":
        errorMessage = "Usuario no encontrado";
        break;
      case "auth/wrong-password":
        errorMessage = "Contraseña incorrecta";
        break;
      case "auth/too-many-requests":
        errorMessage = "Demasiados intentos. Intenta más tarde";
        break;
      case "auth/network-request-failed":
        errorMessage = "Error de conexión";
        break;
      default:
        errorMessage = error.message || "Error en la autenticación";
    }

    return new Error(errorMessage);
  }
}

export const authService = new AuthService();
