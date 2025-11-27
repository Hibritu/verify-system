// Authentication utilities for JWT token management
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://verify-system-exam-result-system-backend.onrender.com/api"

export const authService = {
  // Store token in localStorage
  setToken: (token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token)
    }
  },

  // Get token from localStorage
  getToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token")
    }
    return null
  },

  // Remove token from localStorage
  removeToken: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    }
  },

  // Store user data
  setUser: (user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user))
    }
  },

  // Get user data
  getUser: () => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user")
      return user ? JSON.parse(user) : null
    }
    return null
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!authService.getToken()
  },

  // Get authorization headers
  getAuthHeaders: () => {
    const token = authService.getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  },

  // Login user
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Login failed" }))
        return { success: false, message: errorData.message || "Login failed" }
      }

      const data = await response.json()

      if (response.ok) {
        authService.setToken(data.token)
        authService.setUser({ id: data._id, role: data.role })
        return { success: true, user: { id: data._id, role: data.role } }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { 
        success: false, 
        message: error.message || "Failed to connect to server. Please check if the backend is running." 
      }
    }
  },

  // Register user
  register: async (name, email, password, role = "student") => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Registration failed" }))
        return { success: false, message: errorData.message || "Registration failed" }
      }

      const data = await response.json()

      if (response.ok) {
        authService.setToken(data.token)
        authService.setUser({ id: data._id, role: data.role })
        return { success: true, user: { id: data._id, role: data.role } }
      }
    } catch (error) {
      console.error("Registration error:", error)
      return { 
        success: false, 
        message: error.message || "Failed to connect to server. Please check if the backend is running." 
      }
    }
  },

  // Logout user
  logout: () => {
    authService.removeToken()
    window.location.href = "/login"
  },
}
