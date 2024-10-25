const OPERATORS = {
    ORANGE: 'ORANGE',
    FREE: 'FREE',
    EXPRESSO: 'EXPRESSO',
    PROMOBILE: 'PROMOBILE'
  };
  
  const OPERATOR_PREFIXES = {
    '77': OPERATORS.ORANGE,
    '78': OPERATORS.ORANGE,
    '76': OPERATORS.FREE,
    '70': OPERATORS.EXPRESSO,
    '75': OPERATORS.PROMOBILE
  };
  
  // Regex pour valider le format strict
  const PHONE_NUMBER_REGEX = /^(77|78|76|70|75)[0-9]{7}$/;
  
  const getOperatorFromNumber = (phoneNumber) => {
    if (!PHONE_NUMBER_REGEX.test(phoneNumber)) {
      return null;
    }
    
    const prefix = phoneNumber.substring(0, 2);
    return OPERATOR_PREFIXES[prefix] || null;
  };
  
  const validatePhoneNumber = (phoneNumber) => {
    if (!PHONE_NUMBER_REGEX.test(phoneNumber)) {
      const errorMessages = [];
      
      // Vérifier la longueur
      if (phoneNumber.length !== 9) {
        errorMessages.push('Le numéro doit contenir exactement 9 chiffres');
      }
      
      // Vérifier le préfixe
      const prefix = phoneNumber.substring(0, 2);
      if (!OPERATOR_PREFIXES[prefix]) {
        errorMessages.push('Le numéro doit commencer par 70, 75, 76, 77 ou 78');
      }
      
      return {
        isValid: false,
        errors: errorMessages
      };
    }
    
    return {
      isValid: true,
      operator: OPERATOR_PREFIXES[phoneNumber.substring(0, 2)]
    };
  };
  
  module.exports = {
    OPERATORS,
    getOperatorFromNumber,
    validatePhoneNumber,
    PHONE_NUMBER_REGEX
  };