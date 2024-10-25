import express from "express";
import { transfertEntreClients } from "../controllers/transactionController.js"; // Ajoute .js ici

const router = express.Router();

// Route pour le transfert entre clients
router.post('/transfert', transfertEntreClients); // Utilise directement transfertEntreClients

export default router; // Utilise l'export par défaut pour l'ESM
