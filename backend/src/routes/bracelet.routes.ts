import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware";
import {
  pairBracelet,
  unpairBracelet,
  getBraceletData,
  updateVitalSigns,
} from "../controllers/bracelet.controller";

const router = Router();

// Rutas protegidas (requieren autenticación)
router.post("/pair", verifyToken, pairBracelet);
router.post("/unpair", verifyToken, unpairBracelet);
router.get("/data", verifyToken, getBraceletData);

// Ruta para actualizar signos vitales (puede ser pública con API Key del ESP32)
router.post("/update", updateVitalSigns);

export default router;
