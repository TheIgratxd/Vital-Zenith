import { Response } from "express";
import { auth } from "../config/firebase";
import { AuthRequest } from "../middleware/auth.middleware";
import { firestoreService } from "../services/firestore.service";

// Crear usuario en Firestore después del registro
export const createUserInFirestore = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { uid, name, email } = req.body;

    if (!uid || !name || !email) {
      res.status(400).json({ error: "Datos incompletos" });
      return;
    }

    await firestoreService.createUser(uid, { name, email });

    res.status(201).json({
      message: "Usuario creado en Firestore",
      uid,
    });
  } catch (error) {
    console.error("Error al crear usuario en Firestore:", error);
    res.status(500).json({
      error: "Error al crear usuario en Firestore",
    });
  }
};

export const verifyUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // El middleware ya verificó el token
    res.status(200).json({
      message: "Usuario autenticado",
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al verificar usuario",
    });
  }
};

export const getUserInfo = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    const userRecord = await auth.getUser(req.user.uid);

    res.status(200).json({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      emailVerified: userRecord.emailVerified,
      metadata: {
        creationTime: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime,
      },
    });
  } catch (error) {
    console.error("Error al obtener información del usuario:", error);
    res.status(500).json({
      error: "Error al obtener información del usuario",
    });
  }
};
