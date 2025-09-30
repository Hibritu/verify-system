"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { StudentLayout } from "@/components/student/student-layout"
import { MyCertificates } from "@/components/student/my-certificates"
import { Tabs, TabsContent } from "@/components/ui/tabs"

export default function StudentPortal() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== "student")) {
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

  if (!user || user.role !== "student") {
    return null
  }

  return (
    <StudentLayout activeTab="certificates" tabs={["certificates"]}>
      <Tabs defaultValue="certificates">
        <TabsContent value="certificates">
          <MyCertificates />
        </TabsContent>
      </Tabs>
    </StudentLayout>
  )
}
