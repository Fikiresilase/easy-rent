import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function EasyRentLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localSuccess, setLocalSuccess] = useState(false);
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalSuccess(false);
    const result = await login(email, password);
    if (result.success) {
      setLocalSuccess(true);
      setTimeout(() => navigate('/easyrent-explore'), 1000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6FA]">
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full flex justify-center items-center">
          <div className="bg-white rounded-2xl shadow p-8 flex flex-col md:flex-row gap-8 w-full max-w-3xl">
            <form className="flex-1 space-y-4 min-w-[320px]" onSubmit={handleSubmit}>
              <h2 className="text-2xl font-bold mb-6">Login</h2>
              {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
              {localSuccess && <div className="text-green-600 text-sm mb-2">Login successful! Redirecting...</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]"
                  required
                />
                <div className="mt-2 text-right">
                  <a href="/easyrent-forgot-password" className="text-[#3B5ED6] underline text-sm">Forgot Password?</a>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#3B5ED6] text-white text-2xl rounded-md py-2 mt-2 hover:bg-[#2746a3] transition disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
              <div className="mt-4 text-base">
                Don't have an account? <a href="/easyrent-signup" className="text-[#3B5ED6] underline">Sign up</a>
              </div>
            </form>
          </div>
        </div>
      </main>
      <footer className="bg-[#151F4B] text-white mt-12">
        <div className="max-w-7xl mx-auto py-10 px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">Copyright © 2024 EFUYEOGELA Inc.<br />All rights reserved</div>
            <div className="flex gap-3 mt-2">
              <a href="#" aria-label="Instagram">
                <span className="bg-[#232B4D] p-2 rounded-full">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.75 2A5.75 5.75 0 0 0 2 7.75v8.5A5.75 5.75 0 0 0 7.75 22h8.5A5.75 5.75 0 0 0 22 16.25v-8.5A5.75 5.75 0 0 0 16.25 2h-8.5zm0 1.5h8.5A4.25 4.25 0 0 1 20.5 7.75v8.5A4.25 4.25 0 0 1 16.25 20.5h-8.5A4.25 4.25 0 0 1 3.5 16.25v-8.5A4.25 4.25 0 0 1 7.75 3.5zm8.25 2.25a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 1.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z" />
                  </svg>
                </span>
              </a>
              <a href="#" aria-label="Dribbble">
                <span className="bg-[#232B4D] p-2 rounded-full">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10C22 6.477 17.523 2 12 2zm6.93 6.326c2.01 2.5 2.19 6.07.54 8.74-.23-.37-2.13-3.28-7.13-2.68-.14-.33-.27-.65-.42-.97 5.13-2.04 7.13-4.97 7.01-5.09zm-1.44-1.47c.23.25 1.7 2.01 1.44 4.7-.2.02-2.13.18-4.32.18-.14-.28-.29-.56-.45-.84 3.7-1.5 3.97-3.13 3.33-4.04zm-1.7-1.13c.36.5 1.2 1.93-.41 3.36-1.5-2.74-3.13-4.36-3.36-4.57A8.47 8.47 0 0 1 12 3.5c1.13 0 2.21.21 3.21.6zm-4.13-.6c.29.25 1.93 1.77 3.47 4.6-3.34.84-6.23.82-6.5.82A8.47 8.47 0 0 1 12 3.5zm-6.13 7.1c.29-.04 3.47-.04 7.09-.91.13.23.25.46.36.7-6.13 1.66-7.13 5.09-7.13 5.09A8.47 8.47 0 0 1 5.87 10.6zm.13 6.11c.13-.23 1.41-3.13 7.13-4.13.13.29.25.58.36.87-5.09 1.37-6.13 4.13-6.13 4.13.87.5 1.8.9 2.81 1.13zm2.81 2.29c-.29-.25-1.13-1.04-1.93-2.13 1.13-.33 2.7-.7 4.47-1.04.5 1.37.91 2.7 1.13 3.5-1.13.25-2.29.25-3.67-.33zm5.09.13c-.18-.7-.56-2.01-1.04-3.36 4.47-.62 6.7 1.41 6.97 1.7A8.47 8.47 0 0 1 12 20.5c-.29 0-.58-.02-.87-.04.29-.29 1.41-1.41 2.13-4.13zm-2.13-5.09c-.13-.29-.27-.58-.41-.87 2.29-.33 4.47-.33 4.7-.33.13.29.25.58.36.87-2.29.33-4.47.33-4.7.33z" />
                  </svg>
                </span>
              </a>
              <a href="#" aria-label="Twitter">
                <span className="bg-[#232B4D] p-2 rounded-full">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 5.92c-.8.36-1.66.6-2.56.7a4.48 4.48 0 0 0 1.97-2.48 8.94 8.94 0 0 1-2.83 1.08A4.48 4.48 0 0 0 11.2 9.03c0 .36.04.7.12 1.03-3.72-.18-7.02-1.97-9.23-4.68-.4.7-.62 1.5-.62 2.36 0 1.63.83 3.07 2.1 3.92-.77-.02-1.5-.23-2.13-.58v.06c0 2.28 1.62 4.18 3.77 4.6-.4.1-.82.16-1.26.16-.3 0-.6-.03-.88-.08.6 1.87 2.34 3.23 4.4 3.27A8.98 8.98 0 0 1 2 19.54c-.3 0-.6-.02-.9-.06A12.7 12.7 0 0 0 7.29 21c8.29 0 12.83-6.87 12.83-12.83 0-.2 0-.4-.01-.6.88-.64 1.65-1.44 2.25-2.35z" />
                  </svg>
                </span>
              </a>
              <a href="#" aria-label="YouTube">
                <span className="bg-[#232B4D] p-2 rounded-full">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21.8 8.001s-.2-1.4-.8-2c-.7-.8-1.5-.8-1.9-.9C16.1 5 12 5 12 5h-.1s-4.1 0-7.1.1c-.4.1-1.2.1-1.9.9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.6c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.7.8 1.7.8 2.1.9 1.5.1 6.9.1 6.9.1s4.1 0 7.1-.1c.4-.1 1.2-.1 1.9-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.6c0-1.6-.2-3.2-.2-3.2zM9.8 15.1V8.9l6.4 3.1-6.4 3.1z" />
                  </svg>
                </span>
              </a>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-2">Company</div>
            <ul className="space-y-1 text-sm text-[#B6B9D1]">
              <li><a href="#">About us</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Contact us</a></li>
              <li><a href="#">Testimonials</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">Location</div>
            <ul className="space-y-1 text-sm text-[#B6B9D1]">
              <li><a href="#">Help center</a></li>
              <li><a href="#">Terms of service</a></li>
              <li><a href="#">Legal</a></li>
              <li><a href="#">Privacy policy</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">Contacts</div>
            <ul className="space-y-1 text-sm text-[#B6B9D1]">
              <li>Internship and Career<br />+251 91 285 0202</li>
              <li>Internship and Career<br />+251 91 285 0202</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}