import Parameter from '../models/parametrageSchema.js'; // Assurez-vous que le chemin est correct

class ParameterService {
    // Récupérer tous les paramètres
    async getAllParameters() {
        return Parameter.find();
    }

    // Récupérer un paramètre par type de transaction
    async getParameterByType(typeTransaction) {
        return Parameter.findOne({typeTransaction});
    }

    // Créer un nouveau paramètre
    async createParameter(data) {
        const newParameter = new Parameter(data);
        return await newParameter.save();
    }

    // Mettre à jour un paramètre
    async updateParameter(id, data) {
        return await Parameter.findByIdAndUpdate(id, data, { new: true });
    }

    // Supprimer un paramètre
    async deleteParameter(id) {
        return Parameter.findByIdAndDelete(id);
    }
}

export default new ParameterService();
