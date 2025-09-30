"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { authService } from "@/lib/auth"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount
    const token = authService.getToken()
    const userData = authService.getUser()

    if (token && userData) {
      setUser(userData)
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const result = await authService.login(email, password)
    if (result.success) {
      setUser(result.user)
    }
    return result
  }

  const register = async (name, email, password, role) => {
    const result = await authService.register(name, email, password, role)
    if (result.success) {
      setUser(result.user)
    }
    return result
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isStudent: user?.role === "student",
    isVerifier: user?.role === "verifier",
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
