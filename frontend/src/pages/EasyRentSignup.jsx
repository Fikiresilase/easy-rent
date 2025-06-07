import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function EasyRentSignup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user',
    profile: {
      avatar: '',
      bio: '',
      location: '',
    },
  });
  const [frontId, setFrontId] = useState(null);
  const [backId, setBackId] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [localSuccess, setLocalSuccess] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? '' : 'Please enter a valid email address';
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password)
      ? ''
      : 'Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      // Validate email or password on change
      if (name === 'email') {
        setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
      } else if (name === 'password') {
        setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
      }
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            avatar: reader.result,
          },
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          avatar: '',
        },
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalSuccess(false);
    const submitData = new FormData();

    // Validate email and password before submission
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    setErrors({ email: emailError, password: passwordError });

    if (emailError || passwordError) {
      return; // Prevent submission if validation fails
    }

    submitData.append('name', formData.name);
    submitData.append('email', formData.email);
    submitData.append('password', formData.password);
    submitData.append('phone', formData.phone);
    submitData.append('role', formData.role);

    const profileData = {
      ...formData.profile,
      phone: formData.phone,
    };
    submitData.append('profile', JSON.stringify(profileData));

    if (profilePicture) submitData.append('profilePicture', profilePicture);
    if (frontId) submitData.append('frontId', frontId);
    if (backId) submitData.append('backId', backId);

    console.log('Submitting registration data:', {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      hasPassword: !!formData.password,
      hasProfilePicture: !!profilePicture,
      hasFrontId: !!frontId,
      hasBackId: !!backId,
    });

    const result = await register(submitData);
    if (result.success) {
      setLocalSuccess(true);
      setTimeout(() => navigate('/easyrent-login'), 1500);
    }
  };

  // List of major cities in Ethiopia
  const ethiopianCities = [
    'Addis Ababa',
    'Dire Dawa',
    'Mekelle',
    'Bahir Dar',
    'Gondar',
    'Hawassa',
    'Jimma',
    'Adama',
    'Dessie',
    'Harar',
  ];

  return (
    <div className="w-full flex justify-center items-center py-12">
      <div className="bg-white rounded-2xl shadow p-8 flex flex-col md:flex-row gap-8 w-full max-w-5xl">
        <form className="flex-1 space-y-4 min-w-[320px]" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-6">Sign up</h2>
          {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
          {localSuccess && (
            <div className="text-green-600 text-sm mb-2">Registration successful! Redirecting...</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]`}
              required
            />
            {errors.email && <div className="text-red-600 text-sm mt-1">{errors.email}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full border ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]`}
              required
            />
            {errors.password && <div className="text-red-600 text-sm mt-1">{errors.password}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <br></br>
            <select
              name="profile.location"
              value={formData.profile.location}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B5ED6] text-gray-700"
            >
              <option value="">Select a city</option>
              {ethiopianCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              name="profile.bio"
              placeholder="Tell us about yourself"
              value={formData.profile.bio}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[#3B5ED6] file:text-white hover:file:bg-[#2746a3]"
            />
            {profilePicture && <span className="text-xs text-gray-500 mt-1">{profilePicture.name}</span>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3B5ED6] text-white text-2xl rounded-md py-2 mt-2 hover:bg-[#2746a3] transition disabled:opacity-50"
          >
            {loading ? 'Signing up...' : 'Sign up'}
          </button>
          <div className="mt-4 text-base">
            Already have an account?{' '}
            <a href="/easyrent-login" className="text-[#3B5ED6] underline">
              login
            </a>
          </div>
        </form>
        <div className="flex-1 flex flex-col items-center min-w-[320px]">
          {formData.profile.avatar ? (
            <img
              src={formData.profile.avatar}
              alt="Profile"
              className="rounded-lg w-full h-full object-cover mb-4"
            />
          ) : (
            <div className="rounded-lg w-full h-40 bg-gray-100 flex items-center justify-center mb-4">
              <span className="text-gray-400 text-sm">No profile picture selected</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}