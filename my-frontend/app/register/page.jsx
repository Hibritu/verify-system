"use client"
import dynamic from "next/dynamic"
import { FadeIn } from "@/components/motion/fade-in"
import { ThemeToggle } from "@/components/theme-toggle"

const RegisterForm = dynamic(() => import("@/components/auth/register-form").then(m => m.RegisterForm), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
    </div>
  ),
})

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-800 dark:from-purple-600 dark:via-indigo-700 dark:to-blue-800 from-purple-100 via-indigo-200 to-blue-200 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-white/5 rounded-full animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-16 h-16 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-40 right-10 w-24 h-24 bg-white/5 rounded-full animate-pulse animation-delay-2000"></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-bounce"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white/40 rounded-full animate-bounce animation-delay-2000"></div>
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-white/25 rounded-full animate-bounce"></div>
      </div>

      <FadeIn delay={0.2}>
        <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <span className="text-3xl">✨</span>
              </div>
              <h2 className="text-4xl font-extrabold text-white dark:text-white text-gray-900 mb-2 tracking-tight">
                Join Us Today
              </h2>
              <p className="text-lg text-purple-100 dark:text-purple-100 text-gray-700 font-medium">
                Create your account
              </p>
            </div>
        </div>
          
          <div className="glass dark:glass bg-white/80 dark:bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-white/20 border-gray-200/50 backdrop-blur-xl">
        <RegisterForm />
          </div>
          
        <div className="text-center">
            <p className="text-purple-100 dark:text-purple-100 text-gray-700 text-sm">
              Already have an account?{" "}
              <a 
                href="/login" 
                className="text-white dark:text-white text-purple-600 dark:hover:text-purple-200 hover:text-purple-700 font-semibold transition-colors duration-200 underline decoration-white/50 dark:decoration-white/50 decoration-purple-500/50 hover:decoration-white dark:hover:decoration-white hover:decoration-purple-700"
              >
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </FadeIn>
    </div>
  )
}