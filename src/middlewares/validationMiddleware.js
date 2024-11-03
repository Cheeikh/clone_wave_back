exports.validateTransfer = (data) => {
  console.log('Validation - Données reçues:', data);
  const { phoneNumber, amount, description } = data;

  if (!phoneNumber) {
    console.log('Validation - Numéro de téléphone manquant');
    return 'Le numéro de téléphone est requis';
  }

  // Validation plus permissive du format du numéro de téléphone
  const cleanedPhoneNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
  console.log('Validation - Numéro nettoyé:', cleanedPhoneNumber);

  if (!/^\+?[0-9]{8,15}$/.test(cleanedPhoneNumber)) {
    console.log('Validation - Format de numéro invalide');
    return 'Format de numéro de téléphone invalide';
  }

  console.log('Validation - Données valides');
  return null;
};
