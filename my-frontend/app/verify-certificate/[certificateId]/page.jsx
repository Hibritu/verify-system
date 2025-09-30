"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { publicAPI } from "@/lib/api"
import { CheckCircle, XCircle, Calendar, User, FileText, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CertificateVerificationPage() {
  const params = useParams()
  const certificateId = params?.certificateId
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (certificateId) {
      verifyCertificate()
    }
  }, [certificateId])

  const verifyCertificate = async () => {
    try {
      setLoading(true)
      const response = await publicAPI.verifyCertificate(certificateId)
      setResult(response)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Verifying certificate...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Certificate Verification</h1>
          <p className="mt-2 text-gray-600">Verifying certificate ID: {certificateId}</p>
        </div>

        {error ? (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : result ? (
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                Certificate Verified Successfully
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Certificate Information</h3>
                  <div className="space-y-2">
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
                  <h3 className="font-medium text-gray-900 mb-3">Student Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        <strong>Name:</strong> {result.userId?.name || result.user?.name || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        <strong>Email:</strong> {result.userId?.email || result.user?.email || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {(result.examResultId || result.examResult) && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Exam Details</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm mb-2">
                      <strong>Exam:</strong> {(result.examResultId?.examName || result.examResult?.examName) || "N/A"}
                    </p>
                    <p className="text-sm mb-2">
                      <strong>Year:</strong> {(result.examResultId?.year || result.examResult?.year) || "N/A"}
                    </p>
                    {(result.examResultId?.scores || result.examResult?.scores) && (
                      <div>
                        <strong className="text-sm">Scores:</strong>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Object.entries(result.examResultId?.scores || result.examResult?.scores || {}).map(([subject, score]) => (
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

              <div className="text-center pt-4 border-t">
                <div className="inline-flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">This certificate is authentic and valid</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Verified on {new Date().toLocaleDateString()} via the official verification system
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}


