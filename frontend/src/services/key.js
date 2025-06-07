import { openDB } from 'idb';
import axios from 'axios';

const baseUrl = 'http://localhost:5000/api';
const DB_NAME = 'KeyStore';
const STORE_NAME = 'keys';
const KEY_ALGORITHM = {
  name: 'RSASSA-PKCS1-v1_5',
  modulusLength: 2048,
  publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
  hash: 'SHA-256',
};

// Convert buffer to base64
const bufferToBase64 = buffer => {
  const binary = String.fromCharCode.apply(null, new Uint8Array(buffer));
  let base64 = window.btoa(binary);
  // Ensure proper padding
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  return base64;
};

// Export public key to PEM
const exportPublicKey = async key => {
  try {
    const exported = await crypto.subtle.exportKey('spki', key);
    const exportedBase64 = bufferToBase64(exported);
    const formattedBase64 = exportedBase64.match(/.{1,64}/g).join('\n');
    const pem = `-----BEGIN PUBLIC KEY-----\n${formattedBase64}\n-----END PUBLIC KEY-----`;
    
    console.log('Exported public key:', {
      pemSnippet: pem.slice(0, 100) + '...',
      timestamp: new Date().toISOString(),
    });
    
    return pem;
  } catch (error) {
    console.error('Error exporting public key:', {
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    throw new Error(`Failed to export public key: ${error.message}`);
  }
};

// Initialize IndexedDB
const getDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
};

// Generate and store key pair
export const generateAndStoreKeyPair = async (userId, token) => {
  try {
    if (!userId || !token) {
      throw new Error('Missing userId or token');
    }

      const db = await getDB();
      const existingKey = await db.get(STORE_NAME, userId);
      const publicKeyPem = null; 

      if (!existingKey) {
          const keyPair = await crypto.subtle.generateKey(
              KEY_ALGORITHM,
              true, // Extractable
              ['sign', 'verify']
          );

           await exportPublicKey(keyPair.publicKey);
      }
    // Send public key to backend
    const response = await axios.post(
      `${baseUrl}/keys`,
      { userId, publicKey: publicKeyPem },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.data?.message?.includes('Public key stored') && !response.data?.message?.includes('Public key updated')) {
      throw new Error('Failed to store public key on backend');
    }

    // Store key pair in IndexedDB
    await db.put(STORE_NAME, keyPair, userId);
    
    console.log('Key pair generated and stored:', {
      userId,
      publicKeySnippet: publicKeyPem.slice(0, 50) + '...',
      response: response.data.message,
      timestamp: new Date().toISOString(),
    });

    return { publicKeyPem };
  } catch (error) {
    console.error('Error generating/storing key pair:', {
      userId,
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
      timestamp: new Date().toISOString(),
    });
    throw new Error(`Failed to generate key pair: ${error.response?.data?.message || error.message}`);
  }
};

// Force generate and post new key pair
const forceGenerateAndPostKey = async (userId, token) => {
  try {
    if (!userId || !token) {
      throw new Error('Missing userId or token');
    }

    const db = await getDB();

    // Generate new key pair
    const keyPair = await crypto.subtle.generateKey(
      KEY_ALGORITHM,
      true, // Extractable
      ['sign', 'verify']
    );

    const publicKeyPem = await exportPublicKey(keyPair.publicKey);

    // Send public key to backend
    const response = await axios.post(
      `${baseUrl}/keys`,
      { userId, publicKey: publicKeyPem },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.data?.message?.includes('Public key stored') && !response.data?.message?.includes('Public key updated')) {
      throw new Error('Failed to store public key on backend');
    }

    // Store key pair in IndexedDB, overwriting any existing key
    await db.put(STORE_NAME, keyPair, userId);
    
    console.log('New key pair generated and posted:', {
      userId,
      publicKeySnippet: publicKeyPem.slice(0, 50) + '...',
      response: response.data.message,
      timestamp: new Date().toISOString(),
    });

    return { publicKeyPem };
  } catch (error) {
    console.error('Error forcing key generation and posting:', {
      userId,
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
      timestamp: new Date().toISOString(),
    });
    throw new Error(`Failed to generate and post key pair: ${error.response?.data?.message || error.message}`);
  }
};

// Get private key from IndexedDB
const getPrivateKey = async userId => {
  try {
    const db = await getDB();
    const keyPair = await db.get(STORE_NAME, userId);
    if (!keyPair || !keyPair.privateKey) {
      throw new Error('Private key not found');
    }
    return keyPair.privateKey;
  } catch (error) {
    console.error('Error retrieving private key:', {
      userId,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    throw new Error(`Failed to retrieve private key: ${error.message}`);
  }
};

// Sign data (from keyGenerator.js)
const signData = async (userId, data) => {
  try {
    const privateKey = await getPrivateKey(userId);
    const dataString = JSON.stringify(data);
    
    console.log('Signing data:', {
      userId,
      dataString,
      
    });

    // Encode data
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(dataString);

    // Sign data
    const signature = await crypto.subtle.sign(
      KEY_ALGORITHM,
      privateKey,
      encodedData
    );

    // Convert signature to base64
    const signatureBase64 = bufferToBase64(signature);
    
    console.log('Signature generated:', {
      userId,
      signature: signatureBase64.slice(0, 10) + '...',
      
    });

    return { signatureBase64};
  } catch (error) {
    console.error('Error signing data:', {
      userId,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    throw new Error(`Failed to sign data: ${error.message}`);
  }
};

// Sign and send deal data
export const signAndSendDeal = async (userId, dealData, token, isCreateDeal = true) => {
  try {
    console.log('Attempting to sign/send deal:', {
      userId,
      dealId: dealData.dealId || 'new',
      isCreateDeal,
      timestamp: new Date().toISOString(),
    });

    let publicKeyPem;
    // Check if public key exists on backend
    try {
      const response = await axios.get(`${baseUrl}/keys/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Public key verified:', {
        userId,
        publicKeySnippet: response.data.publicKey.slice(0, 50) + '...',
        timestamp: new Date().toISOString(),
      });
      publicKeyPem = response.data.publicKey;
    } catch (keyError) {
      console.warn('Public key not found on backend, forcing new key generation:', {
        userId,
        error: keyError.response?.data?.message || keyError.message,
        status: keyError.response?.status,
        timestamp: new Date().toISOString(),
      });
      // Force generate and post new key pair
      const keyResult = await forceGenerateAndPostKey(userId, token);
      publicKeyPem = keyResult.publicKeyPem;
    }

    // Normalize deal data to match dealSchema
    const normalizedDealData = {
      propertyId: String(dealData.propertyId),
      ownerId: String(dealData.ownerId),
      renterId: String(dealData.renterId),
      
    };

    // Sign deal data
    const { signatureBase64, timestamp } = await signData(userId, normalizedDealData);

    // Prepare deal payload
    const dealPayload = {
      ...dealData,
      userId,
      signature: { signatureBase64 },
      timestamp: isCreateDeal ? timestamp : undefined,
      isCreateDeal,
      dealId: isCreateDeal ? undefined : dealData.dealId,
    };

    // Send to backend
    const endpoint = isCreateDeal ? `${baseUrl}/deals` : `${baseUrl}/deals/sign`;
    const response = await axios.post(endpoint, dealPayload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('Deal signed and sent:', {
      userId,
      dealId: response.data._id,
      signature: signatureBase64.slice(0, 10) + '...',
      publicKeySnippet: publicKeyPem.slice(0, 50) + '...',
      isCreateDeal,
      timestamp,
      timestampLog: new Date().toISOString(),
    });

    return response.data;
  } catch (error) {
    console.error('Error signing/sending deal:', {
      userId,
      dealId: dealData.dealId || 'new',
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
      timestamp: new Date().toISOString(),
    });
    throw new Error(`Failed to sign and send deal: ${error.response?.data?.message || error.message}`);
  }
};