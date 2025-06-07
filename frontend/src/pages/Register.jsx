import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

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
      location: ''
    }
  })
  const [frontId, setFrontId] = useState(null)
  const [backId, setBackId] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [localSuccess, setLocalSuccess] = useState(false)
  const { register, loading, error } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    setAvatarFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setFormData(prev => ({
          ...prev,
          profile: {
            ...prev.profile,
            avatar: reader.result
          }
        }))
      }
      reader.readAsDataURL(file)
    } else {
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          avatar: ''
        }
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalSuccess(false)
    const submitData = new FormData()
    
    submitData.append('name', formData.name)
    submitData.append('email', formData.email)
    submitData.append('password', formData.password)
    submitData.append('phone', formData.phone)
    submitData.append('role', formData.role)
  
    const profileData = {
      ...formData.profile,
      phone: formData.phone 
    }
    submitData.append('profile', JSON.stringify(profileData))
    
    if (avatarFile) submitData.append('avatar', avatarFile)
    if (frontId) submitData.append('frontId', frontId)
    if (backId) submitData.append('backId', backId)

    console.log('Submitting registration data:', {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      hasPassword: !!formData.password,
      hasAvatar: !!avatarFile,
      hasFrontId: !!frontId,
      hasBackId: !!backId
    })

    const result = await register(submitData)
    if (result.success) {
      setLocalSuccess(true)
      setTimeout(() => navigate('/easyrent-login'), 1500)
    }
  }

  return (
    <div className="w-full flex justify-center items-center py-12">
      <div className="bg-white rounded-2xl shadow p-8 flex flex-col md:flex-row gap-8 w-full max-w-5xl">
        <form className="flex-1 space-y-4 min-w-[320px]" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-6">Sign up</h2>
          {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
          {localSuccess && <div className="text-green-600 text-sm mb-2">Registration successful! Redirecting...</div>}
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
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]" 
              required 
            />
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
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input 
              type="text" 
              name="profile.location"
              placeholder="Enter your location" 
              value={formData.profile.location} 
              onChange={handleChange} 
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]" 
            />
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
              onChange={handleAvatarChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[#3B5ED6] file:text-white hover:file:bg-[#2746a3]"
            />
            {avatarFile && <span className="text-xs text-gray-500 mt-1">{avatarFile.name}</span>}
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#3B5ED6] text-white text-2xl rounded-md py-2 mt-2 hover:bg-[#2746a3] transition disabled:opacity-50">
            {loading ? 'Signing up...' : 'Sign up'}
          </button>
          <div className="mt-4 text-base">
            Already have an account? <a href="/easyrent-login" className="text-[#3B5ED6] underline">login</a>
          </div>
        </form>
        <div className="flex-1 flex flex-col items-center min-w-[320px]">
          {formData.profile.avatar ? (
            <img 
              src={formData.profile.avatar} 
              alt="Profile" 
              className="rounded-lg w-full h-40 object-cover mb-4" 
            />
          ) : (
            <div className="rounded-lg w-full h-40 bg-gray-100 flex items-center justify-center mb-4">
              <span className="text-gray-400 text-sm">No profile picture selected</span>
            </div>
          )}
          <div className="w-full flex gap-4 mb-2">
            <label className="flex-1 flex flex-col items-center justify-center bg-gray-100 rounded-lg h-24 border border-dashed border-gray-300 cursor-pointer">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={e => setFrontId(e.target.files[0])} 
              />
              <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs text-gray-400">front of your id</span>
              {frontId && <span className="text-xs text-gray-500 mt-1">{frontId.name}</span>}
            </label>
            <label className="flex-1 flex flex-col items-center justify-center bg-gray-100 rounded-lg h-24 border border-dashed border-gray-300 cursor-pointer">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={e => setBackId(e.target.files[0])} 
              />
              <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs text-gray-400">back of your id</span>
              {backId && <span className="text-xs text-gray-500 mt-1">{backId.name}</span>}
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}