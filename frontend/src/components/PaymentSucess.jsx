import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, setUser, token } = useAuth();
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState(null);

  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const tx_ref = searchParams.get('tx_ref');
    if (!tx_ref) {
      setError('Invalid transaction reference');
      setStatus('failed');
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/payment/verify-payment/${tx_ref}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.message === 'Payment verified successfully') {
          setStatus('success');
          setUser({ ...user, role: 'owner' });
          setTimeout(() => navigate('/easyrent-post'), 2000);
        } else {
          setStatus('failed');
          setError('Payment verification failed');
        }
      } catch (err) {
        console.warn(err.stack)
        setStatus('failed');
        setError(err.response?.data?.message || 'Error verifying payment');
      }
    };

    verifyPayment();
  }, [searchParams, navigate, setUser, user, token]);

  return (
    <div className="container mx-auto px-4 py-6 text-center">
      {status === 'verifying' && <LoadingSpinner />}
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Status</h2>
      {status === 'success' && (
        <p className="text-green-600">Payment successful! Redirecting to post page...</p>
      )}
      {status === 'failed' && (
        <div>
          <ErrorMessage message={error} />
          <button
            onClick={() => navigate('/easyrent-subscribe')}
            className="mt-4 bg-[#3B5ED6] text-white px-6 py-3 rounded-md hover:bg-[#2746a3] transition"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}