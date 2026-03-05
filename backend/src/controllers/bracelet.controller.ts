import { Response } from "express";
import { firestoreService } from "../services/firestore.service";
import { AuthRequest } from "../types/express";

// Emparejar brazalete
export const pairBracelet = async (req: AuthRequest, res: Response) => {
  try {
    const { pair_code } = req.body;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    if (!pair_code || pair_code.length !== 6) {
      return res
        .status(400)
        .json({ error: "Código de emparejamiento inválido" });
    }

    const result = await firestoreService.pairBracelet(pair_code, userId);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      console.error("pairBracelet falló:", result.message);
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error al emparejar brazalete:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Desvincular brazalete
export const unpairBracelet = async (req: AuthRequest, res: Response) => {
  try {
    const { bracelet_id } = req.body;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    if (!bracelet_id) {
      return res.status(400).json({ error: "ID de brazalete requerido" });
    }

    const result = await firestoreService.unpairBracelet(bracelet_id, userId);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error al desvincular brazalete:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener datos del brazalete
export const getBraceletData = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const user = await firestoreService.getUser(userId);

    if (!user || !user.bracelet_id) {
      return res
        .status(404)
        .json({ error: "No tienes un brazalete vinculado" });
    }

    const bracelet = await firestoreService.getBraceletById(user.bracelet_id);

    if (!bracelet) {
      return res.status(404).json({ error: "Brazalete no encontrado" });
    }

    return res.status(200).json({
      bracelet_id: bracelet.bracelet_id,
      pair_code: bracelet.pair_code,
      status: bracelet.status,
      last_data: bracelet.last_data,
    });
  } catch (error) {
    console.error("Error al obtener datos del brazalete:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Actualizar signos vitales (solo ESP32 o admin)
export const updateVitalSigns = async (req: AuthRequest, res: Response) => {
  try {
    const { bracelet_id, pulse, spo2, temperature } = req.body;

    // Validar datos
    if (
      !bracelet_id ||
      pulse === undefined ||
      spo2 === undefined ||
      temperature === undefined
    ) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    await firestoreService.updateVitalSigns(bracelet_id, {
      pulse,
      spo2,
      temperature,
    });

    return res.status(200).json({ message: "Signos vitales actualizados" });
  } catch (error) {
    console.error("Error al actualizar signos vitales:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Registrar un brazalete nuevo (Admin / setup inicial del ESP32)
export const registerBracelet = async (req: AuthRequest, res: Response) => {
  try {
    const { mac_address } = req.body;

    if (!mac_address) {
      return res.status(400).json({ error: "mac_address es requerido" });
    }

    const pairCode = await firestoreService.createBracelet(mac_address);

    return res.status(201).json({
      success: true,
      message: "Brazalete registrado",
      pair_code: pairCode,
    });
  } catch (error) {
    console.error("Error al registrar brazalete:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
