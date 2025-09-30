"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FadeIn } from "@/components/motion/fade-in"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // Redirect authenticated users to their respective dashboards
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold text-gray-900 mb-2">Exam Verification System</CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Secure digital certificate management and verification platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="text-center p-6 bg-white rounded-lg border">
                <h3 className="font-semibold text-lg mb-2">For Students</h3>
                <p className="text-gray-600 mb-4">View your exam results and download certificates</p>
                <Button onClick={() => router.push("/login")} className="w-full">
                  Student Login
                </Button>
              </div>
              <div className="text-center p-6 bg-white rounded-lg border">
                <h3 className="font-semibold text-lg mb-2">For Administrators</h3>
                <p className="text-gray-600 mb-4">Manage users, upload results, and issue certificates</p>
                <Button onClick={() => router.push("/login")} variant="outline" className="w-full">
                  Admin Login
                </Button>
              </div>
            </div>

            <div className="text-center p-6 bg-white rounded-lg border">
              <h3 className="font-semibold text-lg mb-2">Verify Certificate</h3>
              <p className="text-gray-600 mb-4">Check the authenticity of any certificate</p>
              <Button onClick={() => router.push("/verify")} variant="secondary" className="w-full">
                Verify Certificate
              </Button>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-gray-600 mb-4">New to the system?</p>
              <Button onClick={() => router.push("/register")} variant="secondary">
                Create Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </FadeIn>
  )
}
