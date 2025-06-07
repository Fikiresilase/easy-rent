const crypto = require('crypto');

class CryptoService {
  static async verifySignature(publicKey, data, signature, isCreateDeal = false) {
    try {
      signature = signature.signatureBase64;
      if (!publicKey || typeof publicKey !== 'string') {
        throw new Error('Public key is empty or not a string');
      }

      // Normalize public key: trim whitespace
      publicKey = publicKey.trim();

      console.log('Public key for verification:', {
        publicKey: publicKey.slice(0, 100) + '...',
        length: publicKey.length,
        timestamp: new Date().toISOString(),
      });

      if (!publicKey.includes('-----BEGIN PUBLIC KEY-----') || !publicKey.includes('-----END PUBLIC KEY-----')) {
        throw new Error('Public key is not in valid PEM format');
      }

      if (!signature || typeof signature !== 'string') {
        throw new Error(`Signature is invalid: ${signature === null ? 'null' : typeof signature}`);
      }

      const normalizedSignature = signature.replace(/-/g, '+').replace(/_/g, '/');
      const paddedSignature = normalizedSignature + '==='.slice(0, (4 - (normalizedSignature.length % 4)) % 4);

      const normalizedData = {
        propertyId: String(data.propertyId),
        ownerId: String(data.ownerId),
        renterId: data.renterId ? String(data.renterId) : null,
        ...(isCreateDeal && {
          terms: String(data.terms),
          timestamp: String(data.timestamp),
        }),
      };
      const dealString = JSON.stringify(normalizedData, Object.keys(normalizedData).sort());

      console.log('Verifying signature:', {
        dealString,
        signature: paddedSignature.slice(0, 10) + '...',
        publicKey: publicKey.slice(0, 30) + '...',
        isCreateDeal,
        timestamp: new Date().toISOString(),
      });

      let keyObject;
      try {
        keyObject = crypto.createPublicKey(publicKey);
      } catch (error) {
        console.error('Public key parsing failed:', {
          error: error.message,
          publicKey: publicKey.slice(0, 100) + '...',
          timestamp: new Date().toISOString(),
        });
        throw new Error(`Invalid public key format: ${error.message}`);
      }

      const verifier = crypto.createVerify('RSA-SHA256');
      verifier.update(dealString);
      const isValid = verifier.verify(keyObject, paddedSignature, 'base64');

      console.log('Signature verification result:', {
        isValid,
        isCreateDeal,
        timestamp: new Date().toISOString(),
      });

      return isValid;
    } catch (error) {
      console.error('Error verifying signature:', {
        error: error.message,
        signature: signature ? signature.slice(0, 50) + '...' : signature,
        publicKeyLength: publicKey ? publicKey.length : 0,
        isCreateDeal,
        timestamp: new Date().toISOString(),
      });
      throw new Error(`Signature verification failed: ${error.message}`);
    }
  }
}

module.exports = CryptoService;