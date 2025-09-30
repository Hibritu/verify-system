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
import dynamic from 'next/dynamic';

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
);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <AdminLayout activeTab="users">
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="flex space-x-2 border-b border-gray-200 mb-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="pdfs">PDFs</TabsTrigger>
          <TabsTrigger value="scans">Scan QR Code</TabsTrigger>
        
          <TabsTrigger value="fingerprints">Fingerprints</TabsTrigger>
        </TabsList>

        {/* ✅ Each section only shows when active */}
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="results">
          <ExamResults />
        </TabsContent>

        <TabsContent value="certificates">
          <CertificateManagement />
        </TabsContent>

        <TabsContent value="pdfs">
          <PdfManagement />
        </TabsContent>

        <TabsContent value="scans">
          <ScanPage /> {/* ✅ Only visible when Scan QR Code tab is active */}
        </TabsContent>
       
        
        
        <TabsContent value="fingerprints">
          <FingerprintManagement />
        </TabsContent>
      </Tabs>
    </AdminLayout>
    
  )
}
