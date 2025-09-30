"use client"
import dynamic from "next/dynamic"

const RegisterForm = dynamic(() => import("@/components/auth/register-form").then(m => m.RegisterForm), {
  ssr: false,
  loading: () => null,
})

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Exam Verification System</h2>
          <p className="mt-2 text-sm text-gray-600">Create your account</p>
        </div>
        <RegisterForm />
        <div className="text-center">
          <a href="/login" className="text-sm text-blue-600 hover:text-blue-500">
            Already have an account? Sign in here
          </a>
        </div>
      </div>
    </div>
  )
}