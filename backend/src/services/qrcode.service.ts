import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { Badge } from '../models/Badge';

/**
 * Génère un token QR unique et sécurisé
 */
export const generateQrToken = async (): Promise<string> => {
  let token: string;
  let exists = true;

  // Garantir l'unicité
  do {
    token = uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '').substring(0, 8);
    const found = await Badge.findOne({ qrToken: token });
    exists = !!found;
  } while (exists);

  return token;
};

/**
 * Génère l'image QR Code en base64 pour intégration dans le badge
 */
export const generateQrCodeImage = async (token: string): Promise<string> => {
  const baseUrl = process.env.QR_BASE_URL || 'http://localhost:5173/verification';
  const verificationUrl = `${baseUrl}/${token}`;

  const dataUrl = await QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    width: 256,
    margin: 1,
    color: {
      dark: '#1e3a5f',
      light: '#ffffff',
    },
  });

  return dataUrl;
};

/**
 * Retourne l'URL de vérification publique
 */
export const getVerificationUrl = (token: string): string => {
  const baseUrl = process.env.QR_BASE_URL || 'http://localhost:5173/verification';
  return `${baseUrl}/${token}`;
};
