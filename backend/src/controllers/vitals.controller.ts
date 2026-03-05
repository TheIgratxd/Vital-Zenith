import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { vitalsService } from "../services/vitals.service";
import { realtimeDb } from "../config/firebase";

/**
 * Resuelve el pair_code desde:
 * 1. Query param ?pair_code=XXXXXX (prioritario)
 * 2. Perfil del usuario autenticado en Realtime DB
 */
async function resolvePairCode(req: AuthRequest): Promise<string | null> {
  if (req.query.pair_code) {
    return req.query.pair_code as string;
  }
  const uid = req.user?.uid;
  if (!uid) return null;
  const snap = await realtimeDb.ref(`users/${uid}/pairCode`).once("value");
  return snap.val() || null;
}

export class VitalsController {
  /**
   * GET /api/vitals/current?pair_code=XXXXXX
   */
  async getCurrentVitals(req: AuthRequest, res: Response) {
    try {
      const pairCode = await resolvePairCode(req);
      if (!pairCode) {
        return res.status(400).json({
          success: false,
          error: "Proporciona ?pair_code=XXXXXX o empáreja primero tu brazalete",
        });
      }
      const result = await vitalsService.getCurrentVitals(pairCode);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("Error en getCurrentVitals:", error);
      res.status(500).json({ success: false, error: error.message || "Error al obtener datos vitales" });
    }
  }

  /**
   * GET /api/vitals/history?pair_code=XXXXXX&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&limit=100
   */
  async getVitalsHistory(req: AuthRequest, res: Response) {
    try {
      const pairCode = await resolvePairCode(req);
      if (!pairCode) {
        return res.status(400).json({
          success: false,
          error: "Proporciona ?pair_code=XXXXXX o empáreja primero tu brazalete",
        });
      }
      const { startDate, endDate, limit } = req.query;
      const result = await vitalsService.getVitalsHistory(
        pairCode,
        startDate as string,
        endDate as string,
        limit ? parseInt(limit as string) : 100
      );
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("Error en getVitalsHistory:", error);
      res.status(500).json({ success: false, error: error.message || "Error al obtener historial" });
    }
  }

  /**
   * GET /api/vitals/stats?pair_code=XXXXXX&days=7
   */
  async getVitalsStats(req: AuthRequest, res: Response) {
    try {
      const pairCode = await resolvePairCode(req);
      if (!pairCode) {
        return res.status(400).json({
          success: false,
          error: "Proporciona ?pair_code=XXXXXX o empáreja primero tu brazalete",
        });
      }
      const { days } = req.query;
      const result = await vitalsService.getVitalsStats(
        pairCode,
        days ? parseInt(days as string) : 7
      );
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("Error en getVitalsStats:", error);
      res.status(500).json({ success: false, error: error.message || "Error al obtener estadísticas" });
    }
  }

  /**
   * GET /api/vitals/chart?pair_code=XXXXXX&days=7
   */
  async getVitalsChartData(req: AuthRequest, res: Response) {
    try {
      const pairCode = await resolvePairCode(req);
      if (!pairCode) {
        return res.status(400).json({
          success: false,
          error: "Proporciona ?pair_code=XXXXXX o empáreja primero tu brazalete",
        });
      }
      const { days } = req.query;
      const result = await vitalsService.getVitalsChartData(
        pairCode,
        days ? parseInt(days as string) : 7
      );
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("Error en getVitalsChartData:", error);
      res.status(500).json({ success: false, error: error.message || "Error al obtener datos para gráfico" });
    }
  }
}

export const vitalsController = new VitalsController();
