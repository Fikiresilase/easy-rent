import React, { createContext, useContext, useEffect, useState } from 'react'
import * as authService from '../services/auth'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    console.log('Initializing user from storage:', {
      hasUser: !!storedUser,
      user: storedUser ? JSON.parse(storedUser) : null
    });
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem('token');
    console.log('Initializing token from storage:', {
      hasToken: !!storedToken,
      token: storedToken ? `${storedToken.substring(0, 10)}...` : null,
      length: storedToken?.length
    });
    return storedToken;
  });
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const isAuthenticated = !!user && !!token

  useEffect(() => {
    if (user && token) {
      console.log('Storing auth data:', {
        hasUser: !!user,
        hasToken: !!token,
        tokenLength: token.length
      });
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    } else {
      console.log('Clearing auth data');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [user, token]);

  const login = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const { user, token } = await authService.login(email, password)
      console.log('Login successful:', {
        hasUser: !!user,
        hasToken: !!token,
        tokenLength: token?.length
      });
      setUser(user)
      setToken(token)
      return { success: true }
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.message || 'Login failed')
      return { success: false, error: err.response?.data?.message || 'Login failed' }
    } finally {
      setLoading(false)
    }
  }

  const register = async (data) => {
    setLoading(true)
    setError(null)
    try {
      const { user, token } = await authService.register(data)
      console.log('Registration successful:', {
        hasUser: !!user,
        hasToken: !!token,
        tokenLength: token?.length
      });
      setUser(user)
      setToken(token)
      return { success: true }
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.message || 'Registration failed')
      return { success: false, error: err.response?.data?.message || 'Registration failed' }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    console.log('Logging out, clearing auth data');
    setUser(null)
    setToken(null)
    authService.logout()
  }
  const currentUser =async (id) => {
    const  user  = await authService.getCurrentUser(id)
    return user
    
  }

  return (
    <AuthContext.Provider value={{ user,setUser, token, isAuthenticated, loading, error, login, register, logout,currentUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  return useContext(AuthContext)
} 