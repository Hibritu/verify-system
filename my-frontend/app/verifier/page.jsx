"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { VerifierLayout } from "@/components/verifier/verifier-layout"
import { CertificateVerification } from "@/components/certifcate/certificate-verification"
import { FingerprintVerification } from "@/components/verifier/fingerprint-verification"
import { Tabs, TabsContent } from "@/components/ui/tabs"

export default function VerifierPortal() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== "verifier")) {
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

  if (!user || user.role !== "verifier") {
    return null
  }

  return (
    <VerifierLayout activeTab="verify">
      <Tabs defaultValue="verify">
        <TabsContent value="verify">
          <CertificateVerification />
        </TabsContent>
        <TabsContent value="fingerprint">
          <FingerprintVerification />
        </TabsContent>
      </Tabs>
    </VerifierLayout>
  )
}
