import express from 'express';
import {
    getAllParameters,
    getParameterByType,
    createParameter,
    updateParameter,
    deleteParameter
} from '../controllers/ParameterController.js';

const router = express.Router();

router.get('/', getAllParameters);
router.get('/:typeTransaction', getParameterByType);
router.post('/', createParameter);
router.put('/:id', updateParameter);
router.delete('/:id', deleteParameter);

export default router;
