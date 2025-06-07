import React, { useState } from 'react';
import axios from 'axios';
import {useAuth} from '../hooks/useAuth'
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';

export default function EasyRentSubscribe() {
  const { user,token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const baseUrl = import.meta.env.VITE_API_URL;

 const handleInitiatePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${baseUrl}/api/payment/initiate-payment`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url; // Redirect to Chapa checkout
      } else {
        setError('Failed to initiate payment');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error initiating payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 text-center">
      {loading && <LoadingSpinner />}
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Subscribe to Post Properties</h2>
      <p className="text-gray-700 mb-6 max-w-lg mx-auto">
        To post a property, you need to upgrade to an Owner account with a one-time payment of 10 ETB.
      </p>
      {error && <ErrorMessage message={error} />}
      <button
        onClick={handleInitiatePayment}
        disabled={loading}
        className="bg-[#3B5ED6] text-white px-6 py-3 rounded-md hover:bg-[#2746a3] transition disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Pay 10 ETB to Subscribe'}
      </button>
    </div>
  );
}