import { sendResponse, sendErrorResponse } from '../utils/response.js'; // Assurez-vous que le chemin est correct
import ParameterService from '../services/ParameterService.js';

export const getAllParameters = async (req, res) => {
    try {
        const parameters = await ParameterService.getAllParameters();
        return sendResponse(res, 200, parameters);
    } catch (error) {
        console.error(error.message);
        return sendErrorResponse(res, 500, 'Erreur lors de la récupération des paramètres.');
    }
};

export const getParameterByType = async (req, res) => {
    try {
        const { typeTransaction } = req.params;
        const parameter = await ParameterService.getParameterByType(typeTransaction);

        if (!parameter) {
            return sendErrorResponse(res, 404, 'Paramètre introuvable.');
        }

        return sendResponse(res, 200, parameter);
    } catch (error) {
        console.error(error.message);
        return sendErrorResponse(res, 500, 'Erreur lors de la récupération du paramètre.');
    }
};

export const createParameter = async (req, res) => {
    try {
        const newParameter = await ParameterService.createParameter(req.body);
        return sendResponse(res, 201, newParameter);
    } catch (error) {
        console.error(error.message);
        return sendErrorResponse(res, 400, 'Erreur lors de la création du paramètre.');
    }
};

export const updateParameter = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedParameter = await ParameterService.updateParameter(id, req.body);

        if (!updatedParameter) {
            return sendErrorResponse(res, 404, 'Paramètre introuvable.');
        }

        return sendResponse(res, 200, updatedParameter);
    } catch (error) {
        console.error(error.message);
        return sendErrorResponse(res, 400, 'Erreur lors de la mise à jour du paramètre.');
    }
};

export const deleteParameter = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedParameter = await ParameterService.deleteParameter(id);

        if (!deletedParameter) {
            return sendErrorResponse(res, 404, 'Paramètre introuvable.');
        }

        return sendResponse(res, 200, { message: 'Paramètre supprimé avec succès.' });
    } catch (error) {
        console.error(error.message);
        return sendErrorResponse(res, 400, 'Erreur lors de la suppression du paramètre.');
    }
};
