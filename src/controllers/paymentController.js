const User = require('../models/User');
const { initiatePayment, verifyPayment } = require('../services/paymentService');

const handleInitiatePayment = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await initiatePayment(user);
    return res.json({ checkout_url: result.checkout_url });
  } catch (error) {
    console.error('Payment initialization error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const handlePaymentVerification = async (req, res) => {
  const tx_ref = req.params.id;
  const user = req.user;
  
  if (!tx_ref) {
    return res.status(400).json({ message: 'Transaction reference (tx_ref) is required' });
  }
  if (!user || !user._id) {
    return res.status(401).json({ message: 'Unauthorized: user not found' });
  }

  try {
    const result = await verifyPayment(tx_ref);
    
    if (result.success) {
      const updatedUser = await User.findById(user.id);
      updatedUser.role = 'owner';
      await updatedUser.save();

      return res.status(200).json({
        message: 'Payment verified successfully',
        data: result.data
      });
    } else {
      return res.status(400).json({
        message: 'Payment verification failed or not completed',
        data: result.data
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({
      message: 'Error verifying payment',
      error: error.message
    });
  }
};

module.exports = {
  initiatePayment: handleInitiatePayment,
  paymentChecker: handlePaymentVerification
};