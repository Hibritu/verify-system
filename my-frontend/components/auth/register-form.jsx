"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"

export function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await register(formData.name, formData.email, formData.password, formData.role)

    if (result.success) {
      // Non-admin users require approval
      setError("Registration successful! Please wait for admin approval before logging in.")
    } else {
      setError(result.message)
    }

    setLoading(false)
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant={error.includes("successful") ? "default" : "destructive"} className={`border-2 ${error.includes("successful") ? "border-green-400/50 bg-green-50/90" : "border-red-400/50 bg-red-50/90"} backdrop-blur-sm`}>
          <AlertDescription className={error.includes("successful") ? "text-green-700" : "text-red-700"}>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-700 font-semibold">Full Name</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            required
            placeholder="Enter your full name"
            className="h-12 border-gray-300/50 focus:border-purple-500 focus:ring-purple-500/20 bg-white/80 backdrop-blur-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700 font-semibold">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            required
            placeholder="Enter your email"
            className="h-12 border-gray-300/50 focus:border-purple-500 focus:ring-purple-500/20 bg-white/80 backdrop-blur-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700 font-semibold">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            required
            placeholder="Create a password"
            className="h-12 border-gray-300/50 focus:border-purple-500 focus:ring-purple-500/20 bg-white/80 backdrop-blur-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="text-gray-700 font-semibold">Role</Label>
          <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
            <SelectTrigger className="h-12 border-gray-300/50 focus:border-purple-500 focus:ring-purple-500/20 bg-white/80 backdrop-blur-sm">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="verifier">Verifier</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5" 
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Creating account...
          </div>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  )
}