const Service = require('../models/service.model');
const User = require('../models/user.model');

exports.getAvailableServices = async (req, res) => {
  try {
    const services = await Service.find({ isEnabled: true })
      .sort('order')
      .select('-__v');

    res.json({
      success: true,
      services
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des services:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des services'
    });
  }
};

exports.updateSelectedServices = async (req, res) => {
  try {
    const { services } = req.body;
    const userId = req.user.id;

    await User.findByIdAndUpdate(userId, {
      selectedServices: services
    });

    res.json({
      success: true,
      message: 'Services mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des services:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des services'
    });
  }
};

exports.getSelectedServices = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('selectedServices');
    const services = await Service.find({
      _id: { $in: user.selectedServices },
      isEnabled: true
    }).sort('order');

    res.json({
      success: true,
      services
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des services sélectionnés:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des services sélectionnés'
    });
  }
}; 