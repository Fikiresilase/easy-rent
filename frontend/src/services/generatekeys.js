async function generateKeyPair() {
  let publicKeyPem = '';
  let privateKeyPem = '';
  let privateKey = null;

  try {
    // Generate RSA key pair
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSASSA-PKCS1-v1_5',
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
        hash: 'SHA-256',
      },
      true, // Extractable
      ['sign', 'verify']
    );

    // Export public key to SPKI format
    const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    const publicKeyArray = new Uint8Array(publicKey);
    const publicKeyBase64 = btoa(String.fromCharCode(...publicKeyArray));
    publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${publicKeyBase64.match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`;

    // Export private key to PKCS#8 format
    const privateKeyExported = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
    const privateKeyArray = new Uint8Array(privateKeyExported);
    const privateKeyBase64 = btoa(String.fromCharCode(...privateKeyArray));
    privateKeyPem = `-----BEGIN PRIVATE KEY-----\n${privateKeyBase64.match(/.{1,64}/g).join('\n')}\n-----END PRIVATE KEY-----`;

    // Store private key object for signing
    privateKey = keyPair.privateKey;

    // Log keys
    console.log('Public Key:', publicKeyPem);
    console.log('Private Key:', privateKeyPem);
    console.log('Key pair generated:', { timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error generating keys:', {
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    throw new Error(`Failed to generate key pair: ${error.message}`);
  }

  // Data signing function
  const signData = async (data) => {
    try {
      if (!privateKey) {
        throw new Error('Private key not available for signing');
      }

      // Normalize data (stringify if object)
      const dataString = typeof data === 'string' ? data : JSON.stringify(data, Object.keys(data).sort());
      
      console.log('Signing data:', {
        data: dataString.slice(0, 100) + (dataString.length > 100 ? '...' : ''),
        timestamp: new Date().toISOString(),
      });

      // Encode data
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(dataString);

      // Sign data
      const signature = await crypto.subtle.sign(
        {
          name: 'RSASSA-PKCS1-v1_5',
          hash: 'SHA-256',
        },
        privateKey,
        encodedData
      );

      // Convert signature to base64
      const signatureArray = new Uint8Array(signature);
      const signatureBase64 = btoa(String.fromCharCode(...signatureArray));

      console.log('Signature generated:', {
        signature: signatureBase64.slice(0, 10) + '...',
        timestamp: new Date().toISOString(),
      });

      return signatureBase64;
    } catch (error) {
      console.error('Error signing data:', {
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      throw new Error(`Failed to sign data: ${error.message}`);
    }
  };

  return { publicKeyPem, privateKeyPem, signData };
}


// Example usage
async function testKeyPair() {
  try {
    const { publicKeyPem, privateKeyPem, signData } = await generateKeyPair();

    // Test signing data
    const dataToSign = {
      propertyId: '123',
      ownerId: 'owner123',
      renterId: 'renter123',
      terms: 'Test terms',
    };
    const signature = await signData(dataToSign);

    console.log('Test signature:', {
      signature: signature,
      publicKey: publicKeyPem.slice(0, 50) + '...',
      privateKey: privateKeyPem.slice(0, 50) + '...',
      
    });
  } catch (error) {
    console.error('Test failed:', {
      error: error.message,
      
    });
  }
}

testKeyPair();