"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { AdminLayout } from "@/components/admin/admin-layout"
import { UserManagement } from "@/components/admin/user-management"
import { ExamResults } from "@/components/admin/exam-results"
import { CertificateManagement } from "@/components/admin/certificate-management"
import { FingerprintManagement } from "@/components/admin/fingerprint-management"
import { ScanPage } from "@/components/admin/scan"
import { PdfManagement } from "@/components/admin/pdf-management"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import dynamic from 'next/dynamic'

// Dynamically import the QRScanner component with SSR disabled
const QRCodeScanner = dynamic(
  () => import('@/components/certifcate/qr-scanner').then(({ QRCodeScanner: Component }) => Component),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
)

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-50">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <AdminLayout activeTab="users">
      <div className="relative min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 py-8 px-2">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-48 h-48 bg-white/5 rounded-full animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-40 right-10 w-36 h-36 bg-white/5 rounded-full animate-pulse animation-delay-2000"></div>
          
          {/* Floating particles */}
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-white/30 rounded-full animate-bounce"></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-white/40 rounded-full animate-bounce animation-delay-2000"></div>
          <div className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5 bg-white/25 rounded-full animate-bounce"></div>
          
          {/* Gradient orbs */}
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/2 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto glass rounded-3xl shadow-2xl p-8 border border-white/20 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🛡️</span>
        </div>
            <div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">
                Admin Dashboard
          </h1>
              <p className="text-indigo-200 mt-1">Manage your exam verification system</p>
            </div>
          </div>
          
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="flex space-x-2 mb-8 bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-white/20">
              <TabsTrigger value="users" className="flex items-center gap-2 px-4 py-3 rounded-xl data-[state=active]:bg-white/20 data-[state=active]:text-white text-indigo-200 hover:text-white transition-all duration-300">
                <span>👥</span> Users
              </TabsTrigger>
              <TabsTrigger value="results" className="flex items-center gap-2 px-4 py-3 rounded-xl data-[state=active]:bg-white/20 data-[state=active]:text-white text-indigo-200 hover:text-white transition-all duration-300">
                <span>📊</span> Results
              </TabsTrigger>
              <TabsTrigger value="certificates" className="flex items-center gap-2 px-4 py-3 rounded-xl data-[state=active]:bg-white/20 data-[state=active]:text-white text-indigo-200 hover:text-white transition-all duration-300">
                <span>🎓</span> Certificates
              </TabsTrigger>
              <TabsTrigger value="pdfs" className="flex items-center gap-2 px-4 py-3 rounded-xl data-[state=active]:bg-white/20 data-[state=active]:text-white text-indigo-200 hover:text-white transition-all duration-300">
                <span>📄</span> PDFs
              </TabsTrigger>
              <TabsTrigger value="scans" className="flex items-center gap-2 px-4 py-3 rounded-xl data-[state=active]:bg-white/20 data-[state=active]:text-white text-indigo-200 hover:text-white transition-all duration-300">
                <span>🔍</span> Scan QR Code
              </TabsTrigger>
              <TabsTrigger value="fingerprints" className="flex items-center gap-2 px-4 py-3 rounded-xl data-[state=active]:bg-white/20 data-[state=active]:text-white text-indigo-200 hover:text-white transition-all duration-300">
                <span>🖐️</span> Fingerprints
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="glass rounded-2xl p-6 border border-white/20 backdrop-blur-sm">
              <UserManagement />
            </TabsContent>
            <TabsContent value="results" className="glass rounded-2xl p-6 border border-white/20 backdrop-blur-sm">
              <ExamResults />
            </TabsContent>
            <TabsContent value="certificates" className="glass rounded-2xl p-6 border border-white/20 backdrop-blur-sm">
              <CertificateManagement />
            </TabsContent>
            <TabsContent value="pdfs" className="glass rounded-2xl p-6 border border-white/20 backdrop-blur-sm">
              <PdfManagement />
            </TabsContent>
            <TabsContent value="scans" className="glass rounded-2xl p-6 border border-white/20 backdrop-blur-sm">
              <ScanPage />
            </TabsContent>
            <TabsContent value="fingerprints" className="glass rounded-2xl p-6 border border-white/20 backdrop-blur-sm">
              <FingerprintManagement />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  )
}