"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import { motion } from "framer-motion"
import { FadeIn } from "@/components/motion/fade-in"
import { Stagger, item } from "@/components/motion/stagger"
export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await login(email, password)

    if (result.success) {
      // Redirect based on user role
      if (result.user.role === "admin") {
        router.push("/admin")
      } else if (result.user.role === "student") {
        router.push("/student")
      } else if (result.user.role === "verifier") {
        router.push("/verifier")
      }
    } else {
      setError(result.message)
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive" className="border-red-400/50 bg-red-50/90 backdrop-blur-sm">
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-semibold">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            className="h-12 border-gray-300/50 dark:border-gray-600/50 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-semibold">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            className="h-12 border-gray-300/50 dark:border-gray-600/50 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5" 
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Signing in...
          </div>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  )
}
