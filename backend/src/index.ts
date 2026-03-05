import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import braceletRoutes from "./routes/bracelet.routes";
import vitalsRoutes from "./routes/vitals.routes";

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/bracelet", braceletRoutes);
app.use("/api/vitals", vitalsRoutes);

// Ruta de prueba
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "API funcionando correctamente",
  });
});

// Manejo de rutas no encontradas
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Ruta no encontrada",
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📡 Endpoint de prueba: http://localhost:${PORT}/api/health`);
});
