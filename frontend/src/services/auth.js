import apiClient from './apiClient'

export const register = async (data) => {
  try {
    const res = await apiClient.post('/auth/register', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return res.data 
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message)
    throw error
  }
}

export const sendOtp = async (email) => {
  try {
    const res = await apiClient.post('/auth/send-otp', { email })
    return res.data 
  } catch (error) {
    console.error('Send OTP error:', error.response?.data || error.message)
    throw error
  }
}

export const verifyOtp = async (email, otp) => {
  try {
    const res = await apiClient.post('/auth/verify-otp', { email, otp })
    return res.data 
  } catch (error) {
    console.error('Verify OTP error:', error.response?.data || error.message)
    throw error
  }
}

export const login = async (email, password) => {
  try {
    const res = await apiClient.post('/auth/login', { email, password })
    return res.data 
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message)
    throw error
  }
}

export const logout = async () => {
  try {
    await apiClient.post('/auth/logout')
  } catch (error) {
    console.error('Logout error:', error.response?.data || error.message)
    throw error
  }
}

export const getCurrentUser = async (id) => {
  try {
    const res = await apiClient.get('/auth/me', { id })
    return res.data 
  } catch (error) {
    console.error('Get current user error:', error.response?.data || error.message)
    throw error
  }
} 

export const getUser = async (id) => {
  try {
    const res = await apiClient.get(`/users/${id}`)
    return res.data 
  } catch (error) {
    console.error('Get current user error:', error.response?.data || error.message)
    throw error
  }
}