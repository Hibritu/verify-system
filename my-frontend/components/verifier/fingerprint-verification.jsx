"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { publicAPI } from "@/lib/api"
import { Fingerprint, CheckCircle, XCircle, User } from "lucide-react"

export function FingerprintVerification() {
  const [formData, setFormData] = useState({
    userId: "",
    fingerprintId: "",
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!formData.userId.trim() || !formData.fingerprintId.trim()) return

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await publicAPI.verifyFingerprint(formData.userId.trim(), formData.fingerprintId.trim())
      setResult(response)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5" />
            Verify Fingerprint
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  value={formData.userId}
                  onChange={(e) => handleInputChange("userId", e.target.value)}
                  placeholder="Enter user ID"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fingerprintId">Fingerprint ID</Label>
                <Input
                  id="fingerprintId"
                  value={formData.fingerprintId}
                  onChange={(e) => handleInputChange("fingerprintId", e.target.value)}
                  placeholder="Enter fingerprint ID"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Verify Fingerprint"}
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
        <Card className={`border-l-4 ${result.match ? "border-l-green-500" : "border-l-red-500"}`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${result.match ? "text-green-700" : "text-red-700"}`}>
              {result.match ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              Fingerprint Verification Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm">
                  <strong>User ID:</strong> {formData.userId}
                </p>
                <p className="text-sm">
                  <strong>Fingerprint ID:</strong> {formData.fingerprintId}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <strong>Match Status:</strong>
              <Badge variant={result.match ? "default" : "destructive"}>{result.match ? "MATCH" : "NO MATCH"}</Badge>
            </div>

            <Alert variant={result.match ? "default" : "destructive"}>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>

            {result.match && (
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  <strong>Verification Successful:</strong> The fingerprint belongs to the specified user and can be
                  trusted for identity verification.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
