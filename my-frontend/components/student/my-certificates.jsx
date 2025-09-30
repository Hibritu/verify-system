"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Award, Download, Eye, Calendar, QrCode } from "lucide-react"
import { studentAPI } from "@/lib/api"

export function MyCertificates() {
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedCertificate, setSelectedCertificate] = useState(null)

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      setLoading(true)
      const data = await studentAPI.getMyCertificates()
      setCertificates(Array.isArray(data) ? data : (data?.certificates || []))
    } catch (err) {
      setError(err.message || "Failed to load certificates")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (certificate) => {
    const element = document.createElement("a")
    const file = new Blob(
      [
        `Certificate ID: ${certificate.certificateId}\nExam: ${certificate.examName}\nIssued: ${new Date(certificate.issuedAt).toLocaleDateString()}`,
      ],
      { type: "text/plain" },
    )
    element.href = URL.createObjectURL(file)
    element.download = `certificate-${certificate.certificateId}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-gray-500">Loading certificates...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            My Certificates
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {certificates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No certificates available</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {certificates.map((certificate) => (
                <Card key={certificate._id} className="border-l-4 border-l-green-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{certificate.examName}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Issued: {new Date(certificate.issuedAt).toLocaleDateString()}
                          </div>
                          <Badge variant="outline">ID: {certificate.certificateId}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedCertificate(certificate)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Certificate Details</DialogTitle>
                            </DialogHeader>
                            {selectedCertificate && (
                              <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Certificate Information</h4>
                                    <div className="space-y-2 text-sm">
                                      <p>
                                        <strong>ID:</strong> {selectedCertificate.certificateId}
                                      </p>
                                      <p>
                                        <strong>Exam:</strong> {selectedCertificate.examName}
                                      </p>
                                      <p>
                                        <strong>Year:</strong> {selectedCertificate.year}
                                      </p>
                                      <p>
                                        <strong>Issued:</strong>{" "}
                                        {new Date(selectedCertificate.issuedAt).toLocaleDateString()}
                                      </p>
                                      <p>
                                        <strong>Status:</strong>
                                        <Badge
                                          className="ml-2"
                                          variant={selectedCertificate.revoked ? "destructive" : "default"}
                                        >
                                          {selectedCertificate.revoked ? "Revoked" : "Valid"}
                                        </Badge>
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Exam Results</h4>
                                    <div className="space-y-2 text-sm">
                                      {Object.entries(selectedCertificate.examResult.scores || {}).map(([subject, score]) => (
                                        <p key={subject}>
                                          <strong className="capitalize">{subject}:</strong> {score}%
                                        </p>
                                      ))}
                                      <p>
                                        <strong>Average:</strong> {selectedCertificate.examResult.average}%
                                      </p>
                                      <p>
                                        <strong>Grade:</strong> {selectedCertificate.examResult.grade}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="text-center">
                                  <h4 className="font-medium mb-4 flex items-center justify-center gap-2">
                                    <QrCode className="h-4 w-4" />
                                    Verification QR Code
                                  </h4>
                                  <img
                                    src={selectedCertificate.qrCode || "/placeholder.svg"}
                                    alt="Certificate QR Code"
                                    className="mx-auto border rounded-lg"
                                  />
                                  <p className="text-xs text-gray-500 mt-2">
                                    Scan this QR code to verify the certificate authenticity
                                  </p>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button variant="outline" size="sm" onClick={() => handleDownload(certificate)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">
                          Average Score: <span className="font-medium">{certificate.examResult.average}%</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Grade: <span className="font-medium">{certificate.examResult.grade}</span>
                        </p>
                      </div>
                      <Badge variant={certificate.revoked ? "destructive" : "default"}>
                        {certificate.revoked ? "Revoked" : "Valid"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
