const axios = require('axios').default;

const CHAPA_URL = process.env.CHAPA_URL || 'https://api.chapa.co/v1/transaction/initialize';
const CHAPA_AUTH = process.env.CHAPA_AUTH;

// Initialize payment
const initiatePayment = async (user, amount = 10) => {
  try {
    const tx_ref = `property-${user.id}-${Date.now()}`;
    const callback_url = `${process.env.BACKEND_URL}/api/payment/verify-payment/${tx_ref}`;
    const return_url = `${process.env.FRONTEND_URL}/payment-success?tx_ref=${tx_ref}`;

    const data = {
      amount: amount.toString(),
      currency: 'ETB',
      email: user.email,
      name: user.name || 'User',
      tx_ref,
      callback_url,
      return_url,
    };

    const config = {
      headers: {
        Authorization: `Bearer ${CHAPA_AUTH}`,
        'Content-Type': 'application/json',
      },
    };

    const response = await axios.post(CHAPA_URL, data, config);
    
    if (response.data.status === 'success' && response.data.data.checkout_url) {
      return {
        success: true,
        checkout_url: response.data.data.checkout_url,
        tx_ref,
      };
    } else {
      throw new Error('Failed to initialize payment');
    }
  } catch (error) {
    console.error('Payment initialization error:', error.response?.data || error.message);
    throw error;
  }
};

// Verify payment
const verifyPayment = async (tx_ref) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${CHAPA_AUTH}`,
      },
    };

    const response = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      config
    );

    return {
      success: response.data.status === 'success' && response.data.data.status === 'success',
      data: response.data.data,
    };
  } catch (error) {
    console.error('Payment verification error:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = {
  initiatePayment,
  verifyPayment,
}; 