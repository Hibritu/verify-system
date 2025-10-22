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
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (response.ok) {
      authService.setToken(data.token)
      authService.setUser({ id: data._id, role: data.role })
      return { success: true, user: { id: data._id, role: data.role } }
    } else {
      return { success: false, message: data.message }
    }
  },

  // Register user
  register: async (name, email, password, role = "student") => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password, role }),
    })

    const data = await response.json()

    if (response.ok) {
      authService.setToken(data.token)
      authService.setUser({ id: data._id, role: data.role })
      return { success: true, user: { id: data._id, role: data.role } }
    } else {
      return { success: false, message: data.message }
    }
  },

  // Logout user
  logout: () => {
    authService.removeToken()
    window.location.href = "/login"
  },
}
