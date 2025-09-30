"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { publicAPI } from "@/lib/api"
import { Search, CheckCircle, XCircle, Calendar, User, FileText } from "lucide-react"

export function CertificateVerification() {
  const [certificateId, setCertificateId] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!certificateId.trim()) return

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await publicAPI.verifyCertificate(certificateId.trim())
      setResult(response)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Verify Certificate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="certificateId">Certificate ID</Label>
              <Input
                id="certificateId"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
                placeholder="Enter certificate ID (e.g., CERT2024001)"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Verify Certificate"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Certificate Verified
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Certificate Information</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>ID:</strong> {result.certificateId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Issued:</strong> {new Date(result.issuedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={result.revoked ? "destructive" : "default"}>
                      {result.revoked ? "Revoked" : "Valid"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Student Information</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Name:</strong> {result.userId?.name || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      <strong>Email:</strong> {result.userId?.email || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {result.examResultId && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Exam Details</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">
                    <strong>Exam:</strong> {result.examResultId.examName || "N/A"}
                  </p>
                  <p className="text-sm">
                    <strong>Year:</strong> {result.examResultId.year || "N/A"}
                  </p>
                  {result.examResultId.scores && (
                    <div className="mt-2">
                      <strong className="text-sm">Scores:</strong>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {Object.entries(result.examResultId.scores).map(([subject, score]) => (
                          <Badge key={subject} variant="secondary">
                            {subject}: {score}%
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
