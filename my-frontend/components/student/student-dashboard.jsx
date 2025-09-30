"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Award, TrendingUp, Calendar } from "lucide-react"

export function StudentDashboard() {
  const [stats, setStats] = useState({
    totalResults: 0,
    totalCertificates: 0,
    averageScore: 0,
    recentResults: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // Mock data since backend endpoints might not exist yet
      // In real implementation, these would be actual API calls
      const mockResults = [
        {
          _id: "1",
          examName: "Mathematics Final 2024",
          year: 2024,
          scores: { mathematics: 85, physics: 78 },
          createdAt: "2024-01-15",
        },
        {
          _id: "2",
          examName: "Science Midterm 2024",
          year: 2024,
          scores: { chemistry: 92, biology: 88 },
          createdAt: "2024-01-10",
        },
      ]

      const mockCertificates = [
        {
          _id: "1",
          certificateId: "CERT001",
          examName: "Mathematics Final 2024",
          issuedAt: "2024-01-20",
        },
      ]

      // Calculate stats
      const totalScores = mockResults.reduce((acc, result) => {
        const scores = Object.values(result.scores)
        return acc + scores.reduce((sum, score) => sum + score, 0)
      }, 0)
      const totalSubjects = mockResults.reduce((acc, result) => acc + Object.keys(result.scores).length, 0)

      setStats({
        totalResults: mockResults.length,
        totalCertificates: mockCertificates.length,
        averageScore: totalSubjects > 0 ? Math.round(totalScores / totalSubjects) : 0,
        recentResults: mockResults.slice(0, 3),
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Results</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalResults}</div>
            <p className="text-xs text-muted-foreground">Exam results available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCertificates}</div>
            <p className="text-xs text-muted-foreground">Certificates issued</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}%</div>
            <p className="text-xs text-muted-foreground">Across all subjects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Year</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2024</div>
            <p className="text-xs text-muted-foreground">Current academic year</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Results */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Exam Results</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No exam results available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentResults.map((result) => (
                <div key={result._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{result.examName}</h4>
                    <p className="text-sm text-gray-600">Year: {result.year}</p>
                  </div>
                  <div className="flex gap-2">
                    {Object.entries(result.scores).map(([subject, score]) => (
                      <Badge key={subject} variant="secondary">
                        {subject}: {score}%
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
