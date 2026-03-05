import { Router } from "express";
import { vitalsController } from "../controllers/vitals.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router = Router();

// Todas las rutas requieren autenticación
router.use(verifyToken);

// GET /api/vitals/current - Obtener datos vitales actuales
router.get("/current", (req, res) =>
  vitalsController.getCurrentVitals(req, res)
);

// GET /api/vitals/history - Obtener historial de datos vitales
router.get("/history", (req, res) =>
  vitalsController.getVitalsHistory(req, res)
);

// GET /api/vitals/stats - Obtener estadísticas
router.get("/stats", (req, res) => vitalsController.getVitalsStats(req, res));

// GET /api/vitals/chart - Obtener datos para gráficos
router.get("/chart", (req, res) =>
  vitalsController.getVitalsChartData(req, res)
);

export default router;
