"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Calendar, TrendingUp } from "lucide-react"

export function ExamResults() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchExamResults()
  }, [])

  const fetchExamResults = async () => {
    try {
      setLoading(true)
      // Mock data - replace with actual API call
      const mockResults = [
        {
          _id: "1",
          examName: "Mathematics Final Examination 2024",
          year: 2024,
          scores: {
            mathematics: 85,
            physics: 78,
            chemistry: 82,
          },
          createdAt: "2024-01-15T10:00:00Z",
        },
        {
          _id: "2",
          examName: "Science Midterm Examination 2024",
          year: 2024,
          scores: {
            chemistry: 92,
            biology: 88,
            physics: 85,
          },
          createdAt: "2024-01-10T10:00:00Z",
        },
        {
          _id: "3",
          examName: "Literature and Arts 2023",
          year: 2023,
          scores: {
            literature: 90,
            history: 87,
            art: 93,
          },
          createdAt: "2023-12-15T10:00:00Z",
        },
      ]

      setResults(mockResults)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const calculateAverage = (scores) => {
    const values = Object.values(scores)
    return Math.round(values.reduce((sum, score) => sum + score, 0) / values.length)
  }

  const getGrade = (average) => {
    if (average >= 90) return { grade: "A", color: "bg-green-100 text-green-800" }
    if (average >= 80) return { grade: "B", color: "bg-blue-100 text-blue-800" }
    if (average >= 70) return { grade: "C", color: "bg-yellow-100 text-yellow-800" }
    if (average >= 60) return { grade: "D", color: "bg-orange-100 text-orange-800" }
    return { grade: "F", color: "bg-red-100 text-red-800" }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-gray-500">Loading exam results...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            My Exam Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {results.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No exam results available</p>
            </div>
          ) : (
            <div className="space-y-6">
              {results.map((result) => {
                const average = calculateAverage(result.scores)
                const gradeInfo = getGrade(average)

                return (
                  <Card key={result._id} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{result.examName}</CardTitle>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {result.year}
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4" />
                              Average: {average}%
                            </div>
                          </div>
                        </div>
                        <Badge className={gradeInfo.color}>Grade {gradeInfo.grade}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Performance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(result.scores).map(([subject, score]) => {
                            const subjectGrade = getGrade(score)
                            return (
                              <TableRow key={subject}>
                                <TableCell className="font-medium capitalize">{subject}</TableCell>
                                <TableCell>{score}%</TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className={subjectGrade.color}>
                                    {subjectGrade.grade}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                      <div className="mt-4 text-xs text-gray-500">
                        Exam taken on: {new Date(result.createdAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
