// API service functions for backend communication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://verify-system-exam-result-system-backend.onrender.com/api"

import { authService } from "./auth"

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...authService.getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(url, config)
  
  // Check if response is JSON
  const contentType = response.headers.get("content-type")
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text()
    throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`)
  }
  
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "API request failed")
  }

  return data
}

export const adminAPI = {
  // User management
  getUnapprovedUsers: () => apiRequest("/auth/unapproved"),
  approveUser: (userId) => apiRequest(`/auth/approve/${userId}`, { method: "PATCH" }),

  // Exam results
  uploadExamResult: (resultData) =>
    apiRequest("/results/upload", {
      method: "POST",
      body: JSON.stringify(resultData),
    }),
  getRecentExamResults: () => apiRequest("/results/recent"),

  // Certificates
  generateCertificate: (certificateData) =>
    apiRequest("/certificates/generate", {
      method: "POST",
      body: JSON.stringify(certificateData),
    }),

  // Fingerprint
  enrollFingerprint: (userId, data) =>
    apiRequest("/fingerprint/enroll", {
      method: "POST",
      body: JSON.stringify({ userId, data }),
    }),
}

export const publicAPI = {
  // Certificate verification
  verifyCertificate: (certificateId) => apiRequest(`/certificates/verify?certificateId=${certificateId}`),

  // Fingerprint verification
  verifyFingerprint: (userId, data) =>
    apiRequest("/fingerprint/verify", {
      method: "POST",
      body: JSON.stringify({ userId, data }),
    }),
}

export const studentAPI = {
  // Get student's exam results
  getMyExamResults: () => apiRequest("/results/my-results"),

  // Get student's certificates
  getMyCertificates: () => apiRequest("/certificates/my-certificates"),

  // Get specific certificate details
  getCertificateDetails: (certificateId) => apiRequest(`/certificates/details/${certificateId}`),
}
