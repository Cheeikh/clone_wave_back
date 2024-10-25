import {z} from 'zod';

// Schéma pour valider une transaction
const transactionSchema = z.object({
    montant: z.number().min(5, 'Le montant doit être supérieur ou égal à 5'),
    type: z.enum(['Envoi', 'Retrait', 'Transfert']),
    utilisateurSource: z.string().uuid(),
    utilisateurDestination: z.string().uuid().optional(),
    agent: z.string().uuid().optional(),
});

// Valider un utilisateur
const userSchema = z.object({
    telephone: z.string()
        .regex(/^(77|78|76|70)\d{7}$/, 'Le numéro de téléphone doit être valide et commencer par 77, 78, 76 ou 70'),
    solde: z.number().min(0, 'Le solde ne peut pas être négatif'),
});

module.exports = {
    validateTransaction: (data) => transactionSchema.parse(data),
    validateUser: (data) => userSchema.parse(data),
};
