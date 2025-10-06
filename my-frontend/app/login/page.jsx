
"use client"

import { LoginForm } from "@/components/auth/login-form"
import { FadeIn } from "@/components/motion/fade-in"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 dark:from-blue-600 dark:via-indigo-700 dark:to-purple-800 from-blue-100 via-indigo-200 to-purple-200 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 dark:bg-white/10 bg-blue-500/20 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-white/5 dark:bg-white/5 bg-indigo-500/15 rounded-full animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-16 h-16 bg-white/10 dark:bg-white/10 bg-purple-500/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-40 right-10 w-24 h-24 bg-white/5 dark:bg-white/5 bg-indigo-500/15 rounded-full animate-pulse animation-delay-2000"></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 dark:bg-white/30 bg-blue-600/40 rounded-full animate-bounce"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white/40 dark:bg-white/40 bg-indigo-600/50 rounded-full animate-bounce animation-delay-2000"></div>
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-white/25 dark:bg-white/25 bg-purple-600/35 rounded-full animate-bounce"></div>
      </div>

      <FadeIn delay={0.2}>
        <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-white/20 dark:bg-white/20 bg-blue-500/30 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <span className="text-3xl">🎓</span>
              </div>
              <h2 className="text-4xl font-extrabold text-white dark:text-white text-gray-900 mb-2 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-lg text-blue-100 dark:text-blue-100 text-gray-700 font-medium">
                Sign in to your account
              </p>
            </div>
        </div>
          
          <div className="glass dark:glass bg-white/80 dark:bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-white/20 border-gray-200/50 backdrop-blur-xl">
        <LoginForm />
      </div>
          
          <div className="text-center">
            <p className="text-blue-100 dark:text-blue-100 text-gray-700 text-sm">
              Don't have an account?{" "}
              <a 
                href="/register" 
                className="text-white dark:text-white text-blue-600 dark:hover:text-blue-200 hover:text-blue-700 font-semibold transition-colors duration-200 underline decoration-white/50 dark:decoration-white/50 decoration-blue-500/50 hover:decoration-white dark:hover:decoration-white hover:decoration-blue-700"
              >
                Create one here
              </a>
            </p>
          </div>
        </div>
      </FadeIn>
    </div>
  )
}
