"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FadeIn } from "@/components/motion/fade-in"
import { ThemeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin") {
        router.push("/admin")
      } else if (user.role === "student") {
        router.push("/student")
      } else if (user.role === "verifier") {
        router.push("/verifier")
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <FadeIn>
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-500 from-indigo-100 via-purple-200 to-pink-200 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>
        {/* Enhanced animated background elements */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-48 h-48 bg-white/5 rounded-full animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-40 right-10 w-36 h-36 bg-white/5 rounded-full animate-pulse animation-delay-2000"></div>
          
          {/* Floating particles */}
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-white/30 rounded-full animate-bounce"></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-white/40 rounded-full animate-bounce animation-delay-2000"></div>
          <div className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5 bg-white/25 rounded-full animate-bounce"></div>
          <div className="absolute bottom-1/4 right-1/4 w-1.5 h-1.5 bg-white/35 rounded-full animate-bounce animation-delay-2000"></div>
          
          {/* Gradient orbs */}
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/2 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        </div>

        <Card className="w-full max-w-4xl shadow-2xl relative z-10 border-0 glass dark:glass bg-white/90 dark:bg-white/10 backdrop-blur-xl">
          <CardHeader className="text-center pb-8">
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-4 shadow-lg animate-float">
                <span className="text-4xl">🎓</span>
        </div>
              <CardTitle className="text-5xl font-extrabold text-white dark:text-white text-gray-900 mb-3 tracking-tight text-gradient bg-gradient-to-r from-white to-blue-100 dark:from-white dark:to-blue-100">
                Exam Verification System
              </CardTitle>
            </div>
            <CardDescription className="text-xl text-blue-100 dark:text-blue-100 text-gray-700 font-medium">
              Secure digital certificate management and verification platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center p-8 glass dark:glass bg-white/90 dark:bg-white/10 rounded-2xl shadow-lg border border-white/20 dark:border-white/20 border-gray-200/50 hover-scale backdrop-blur-sm">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👨‍🎓</span>
                </div>
                <h3 className="font-bold text-2xl mb-3 text-white dark:text-white text-gray-900">For Students</h3>
                <p className="text-blue-100 dark:text-blue-100 text-gray-700 mb-6 leading-relaxed">View your exam results and download certificates</p>
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full h-12 font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-0.5 rounded-xl"
                >
                  Student Login
                </Button>
              </div>
              <div className="text-center p-8 glass dark:glass bg-white/90 dark:bg-white/10 rounded-2xl shadow-lg border border-white/20 dark:border-white/20 border-gray-200/50 hover-scale backdrop-blur-sm">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🛡️</span>
                </div>
                <h3 className="font-bold text-2xl mb-3 text-white dark:text-white text-gray-900">For Administrators</h3>
                <p className="text-blue-100 dark:text-blue-100 text-gray-700 mb-6 leading-relaxed">Manage users, upload results, and issue certificates</p>
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full h-12 font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:-translate-y-0.5 rounded-xl"
                >
                  Admin Login
                </Button>
              </div>
            </div>

            <div className="text-center p-8 glass rounded-2xl shadow-lg border border-white/20 hover-scale backdrop-blur-sm">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="font-bold text-2xl mb-3 text-white dark:text-white text-gray-900">Verify Certificate</h3>
              <p className="text-blue-100 dark:text-blue-100 text-gray-700 mb-6 leading-relaxed">Check the authenticity of any certificate</p>
              <Button
                onClick={() => router.push("/verify")}
                className="w-full h-12 font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:-translate-y-0.5 rounded-xl"
              >
                Verify Certificate
              </Button>
            </div>

            <div className="text-center pt-6 border-t border-white/20 dark:border-white/20 border-gray-300/30">
              <p className="text-blue-100 dark:text-blue-100 text-gray-700 mb-6 text-lg">New to the system?</p>
              <Button
                onClick={() => router.push("/register")}
                className="h-12 px-8 font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:-translate-y-0.5 rounded-xl shadow-lg"
              >
                Create Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </FadeIn>
  )
}