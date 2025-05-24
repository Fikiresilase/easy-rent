import apiClient from './apiClient'

export const register = async (data) => {
  try {
    const res = await apiClient.post('/auth/register', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return res.data // { user, token }
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message)
    throw error
  }
}

export const login = async (email, password) => {
  try {
    const res = await apiClient.post('/auth/login', { email, password })
    return res.data // { user, token }
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

export const getCurrentUser = async () => {
  try {
    const res = await apiClient.get('/auth/me')
    return res.data // { user }
  } catch (error) {
    console.error('Get current user error:', error.response?.data || error.message)
    throw error
  }
} 