import { sendErrorResponse, sendResponse } from "../utils/response.js";
import TransferService from "../services/TransferService.js"; // Assure-toi que le chemin est correct

export const transfertEntreClients = async (req, res) => {
    try {
        const { utilisateurSource, utilisateurDestination, montant } = req.body;

        const transaction = await TransferService.transfertEntreClients(utilisateurSource, utilisateurDestination, montant);
        return sendResponse(res, 201, { transaction });
    } catch (error) {
        console.error(error.message);
        return sendErrorResponse(res, 400, error.message);
    }
};
