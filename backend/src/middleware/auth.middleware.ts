import { Request, Response, NextFunction } from "express";
import { auth } from "../config/firebase";

// Extender Request para incluir el usuario
export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    [key: string]: any;
  };
}

export const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        error: "No se proporcionó token de autenticación",
      });
      return;
    }

    const token = authHeader.split("Bearer ")[1];

    // Verificar el token con Firebase Admin
    const decodedToken = await auth.verifyIdToken(token);

    // Agregar información del usuario al request
    req.user = {
      ...decodedToken,
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    next();
  } catch (error) {
    console.error("Error al verificar token:", error);
    res.status(401).json({
      error: "Token inválido o expirado",
    });
  }
};
