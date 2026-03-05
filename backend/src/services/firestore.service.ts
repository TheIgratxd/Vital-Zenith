import { db, realtimeDb } from "../config/firebase";
import { FieldValue } from "firebase-admin/firestore";

export interface User {
  uid: string;
  name: string;
  email: string;
  bracelet_id: string | null;
  createdAt: Date;
  role: "user" | "admin";
}

export interface Bracelet {
  bracelet_id: string;
  pair_code: string;
  user_id: string | null;
  mac_address: string;
  status: "available" | "paired";
  last_data: {
    pulse: number;
    spo2: number;
    temperature: number;
    timestamp: Date;
  };
}

class FirestoreService {
  // ============================================
  // USUARIOS
  // ============================================

  async createUser(uid: string, data: Partial<User>): Promise<void> {
    await db.collection("users").doc(uid).set({
      uid,
      name: data.name,
      email: data.email,
      bracelet_id: null,
      createdAt: FieldValue.serverTimestamp(),
      role: "user",
    });
  }

  async getUser(uid: string): Promise<User | null> {
    const doc = await db.collection("users").doc(uid).get();
    return doc.exists ? (doc.data() as User) : null;
  }

  async updateUser(uid: string, data: Partial<User>): Promise<void> {
    await db.collection("users").doc(uid).update(data);
  }

  // ============================================
  // BRAZALETES
  // ============================================

  async getBraceletByCode(pairCode: string): Promise<Bracelet | null> {
    // Buscar solo por pair_code (un solo filtro = no necesita índice compuesto)
    const snapshot = await db
      .collection("bracelets")
      .where("pair_code", "==", pairCode)
      .limit(1)
      .get();

    console.log(`getBraceletByCode("${pairCode}") → ${snapshot.size} docs encontrados`);

    if (snapshot.empty) return null;

    const bracelet = snapshot.docs[0].data() as Bracelet;

    // Verificar status en código (no en query)
    if (bracelet.status !== "available") {
      console.log(`Brazalete encontrado pero status="${bracelet.status}", no "available"`);
      return null;
    }

    return bracelet;
  }

  async getBraceletById(braceletId: string): Promise<Bracelet | null> {
    const doc = await db.collection("bracelets").doc(braceletId).get();
    return doc.exists ? (doc.data() as Bracelet) : null;
  }

  async pairBracelet(
    pairCode: string,
    userId: string
  ): Promise<{ success: boolean; message: string; bracelet_id?: string }> {
    try {
      // Buscar brazalete por código
      const bracelet = await this.getBraceletByCode(pairCode);

      if (!bracelet) {
        return {
          success: false,
          message: "Código inválido o brazalete ya emparejado",
        };
      }

      // Actualizar brazalete (se conserva pair_code para que el dashboard pueda leerlo)
      await db.collection("bracelets").doc(bracelet.bracelet_id).update({
        user_id: userId,
        status: "paired",
      });

      // Actualizar usuario en Firestore (crea el doc si no existe)
      await db.collection("users").doc(userId).set({
        bracelet_id: bracelet.bracelet_id,
      }, { merge: true });

      // Sincronizar con Realtime Database:
      // pairCode como clave del brazalete + link en el perfil del usuario
      await realtimeDb.ref(`users/${userId}`).update({
        pairCode: bracelet.pair_code || bracelet.bracelet_id,
      });
      await realtimeDb.ref(`bracelets/${bracelet.pair_code || bracelet.bracelet_id}/userId`).set(userId);

      return {
        success: true,
        message: "Brazalete emparejado exitosamente",
        bracelet_id: bracelet.bracelet_id,
      };
    } catch (error) {
      console.error("Error al emparejar brazalete:", error);
      return {
        success: false,
        message: "Error al emparejar brazalete",
      };
    }
  }

  async unpairBracelet(
    braceletId: string,
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const bracelet = await this.getBraceletById(braceletId);

      if (!bracelet || bracelet.user_id !== userId) {
        return {
          success: false,
          message: "No tienes permiso para desvincular este brazalete",
        };
      }

      // Actualizar brazalete
      await db.collection("bracelets").doc(braceletId).update({
        user_id: null,
        status: "available",
        pair_code: this.generatePairCode(), // Generar nuevo código
      });

      // Actualizar usuario en Firestore
      await db.collection("users").doc(userId).update({
        bracelet_id: null,
      });

      // Limpiar Realtime Database
      await realtimeDb.ref(`users/${userId}/pairCode`).remove();
      await realtimeDb.ref(`bracelets/${braceletId}/userId`).remove();

      return {
        success: true,
        message: "Brazalete desvinculado exitosamente",
      };
    } catch (error) {
      console.error("Error al desvincular brazalete:", error);
      return {
        success: false,
        message: "Error al desvincular brazalete",
      };
    }
  }

  async updateVitalSigns(
    braceletId: string,
    data: { pulse: number; spo2: number; temperature: number }
  ): Promise<void> {
    await db
      .collection("bracelets")
      .doc(braceletId)
      .update({
        last_data: {
          ...data,
          timestamp: FieldValue.serverTimestamp(),
        },
      });
  }

  // ============================================
  // UTILIDADES
  // ============================================

  private generatePairCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async createBracelet(macAddress: string): Promise<string> {
    const braceletId = `BRACELET_${Date.now()}`;
    const pairCode = this.generatePairCode();

    await db
      .collection("bracelets")
      .doc(braceletId)
      .set({
        bracelet_id: braceletId,
        pair_code: pairCode,
        user_id: null,
        mac_address: macAddress,
        status: "available",
        last_data: {
          pulse: 0,
          spo2: 0,
          temperature: 0,
          timestamp: FieldValue.serverTimestamp(),
        },
      });

    return pairCode;
  }
}

export const firestoreService = new FirestoreService();
