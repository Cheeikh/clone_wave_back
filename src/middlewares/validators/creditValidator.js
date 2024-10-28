// middleware/validators/creditValidator.js
const { body } = require('express-validator');
const { validatePhoneNumber } = require('../../utils/operatorUtils');

const creditValidator = [
  body('phoneNumber')
    .trim()
    .custom((value) => {
      const validation = validatePhoneNumber(value);
      if (!validation.isValid) {
        throw new Error(validation.errors.join('. '));
      }
      return true;
    }),
  body('amount')
    .isInt({ min: 100, max: 100000 })
    .withMessage('Le montant doit être entre 100 et 100000 FCFA')
    .custom((value) => {
      if (value % 100 !== 0) {
        throw new Error('Le montant doit être un multiple de 100 FCFA');
      }
      return true;
    })
];

module.exports = creditValidator;