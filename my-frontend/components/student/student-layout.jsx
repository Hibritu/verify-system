"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { User, FileText, Award, LogOut } from "lucide-react"

export function StudentLayout({ children, activeTab = "dashboard", tabs = ["dashboard", "results", "certificates"] }) {
  const { logout, user } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const gridColsClass = tabs.length === 1 ? "grid-cols-1" : tabs.length === 2 ? "grid-cols-2" : "grid-cols-3"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Student Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, Student</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} className="space-y-6">
          <TabsList className={`grid w-full ${gridColsClass}`}>
            {tabs.includes("dashboard") && (
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
            )}
            {tabs.includes("results") && (
              <TabsTrigger value="results" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                My Results
              </TabsTrigger>
            )}
            {tabs.includes("certificates") && (
              <TabsTrigger value="certificates" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                My Certificates
              </TabsTrigger>
            )}
          </TabsList>
          {children}
        </Tabs>
      </main>
    </div>
  )
}
