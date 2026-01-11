import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware";
import {
  verifyUser,
  getUserInfo,
  createUserInFirestore,
} from "../controllers/auth.controller";

const router = Router();

// Crear usuario en Firestore (llamar después del registro en Firebase Auth)
router.post("/create", createUserInFirestore);

// Rutas protegidas - requieren autenticación
router.get("/verify", verifyToken, verifyUser);
router.get("/me", verifyToken, getUserInfo);

export default router;
