import React, { useState, useEffect } from 'react'; // Added useEffect
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';

const EasyRentForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [step, setStep] = useState('email'); // 'email', 'otp', 'password'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Redirect on success
  useEffect(() => {
    if (success === 'OTP verified successfully') {
      console.log('Redirecting to /easyrent-login...');
      setTimeout(() => navigate('/easyrent-login'), 1000);
    }
  }, [success, navigate]);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(`${baseUrl}/api/auth/forgot-password`, { email });
      setSuccess(response.data.message); // "OTP sent to your email"
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(`${baseUrl}/api/auth/verify-otp`, { email, otp });
      setSuccess(response.data.message); // "OTP verified successfully"
      setResetToken(response.data.resetToken);
      setStep('password');
    } catch (err) {
      setError(err.response?.data?.message || 'Error verifying OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {console.log('Password reset response:', response.data); // Debug log
      const response = await axios.post(`${baseUrl}/api/auth/reset-password`, {
        resetToken,
        newPassword,
      });
      
      setSuccess('response.data.message'); // "Password reset successfully"
      setEmail('');
      setOtp('');
      setNewPassword('');
      setResetToken('');
      setStep('email');
    } catch (err) {
      console.error('Reset password error:', err.response?.data || err.message); // Debug log
      setError(err.response?.data?.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 text-center">
      {loading && <LoadingSpinner />}
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Reset Your Password</h2>
      <p className="text-gray-700 mb-6 max-w-lg mx-auto">
        {step === 'email' && 'Enter your email to receive a one-time password (OTP).'}
        {step === 'otp' && 'Enter the OTP sent to your email.'}
        {step === 'password' && 'Enter your new password.'}
      </p>
      {error && <ErrorMessage message={error} />}
      {success && <p className="text-green-600 mb-4">{success}</p>}

      {step === 'email' && (
        <form onSubmit={handleForgotPassword} className="max-w-sm mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#3B5ED6] text-white px-6 py-3 rounded-md hover:bg-[#2746a3] transition disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} className="max-w-sm mx-auto">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="w-full px-4 py-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#3B5ED6] text-white px-6 py-3 rounded-md hover:bg-[#2746a3] transition disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      )}

      {step === 'password' && (
        <form onSubmit={handleResetPassword} className="max-w-sm mx-auto">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            className="w-full px-4 py-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#3B5ED6] text-white px-6 py-3 rounded-md hover:bg-[#2746a3] transition disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  );
};

export default EasyRentForgotPassword;