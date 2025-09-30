"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { adminAPI } from "@/lib/api"

export function FingerprintManagement() {
  const [userId, setUserId] = useState("")
  const [data, setData] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await adminAPI.enrollFingerprint(userId, data)
      setMessage(`Fingerprint enrolled successfully! Fingerprint ID: ${response.fingerprintId}`)
      setUserId("")
      setData("")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enroll Fingerprint</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data">Fingerprint Data</Label>
            <Input
              id="data"
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder="Enter fingerprint data (hash/base64)"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Enrolling..." : "Enroll Fingerprint"}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">About Fingerprint Enrollment</h4>
          <p className="text-sm text-blue-700">
            Enrolling a fingerprint stores fingerprint data linked to a user for future verification.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
