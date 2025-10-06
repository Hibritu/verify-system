"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { adminAPI } from "@/lib/api"
import { Plus, Trash2 } from "lucide-react"

export function ExamResults() {
  const [formData, setFormData] = useState({
    userId: "",
    examName: "",
    year: new Date().getFullYear(),
    scores: {},
  })
  const [subjects, setSubjects] = useState([{ name: "", score: "" }])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      // Convert subjects array to scores object
      const scores = {}
      subjects.forEach((subject) => {
        if (subject.name && subject.score) {
          scores[subject.name] = Number.parseFloat(subject.score)
        }
      })

      const resultData = {
        ...formData,
        scores,
      }

      const response = await adminAPI.uploadExamResult(resultData)
      setMessage(`Exam result uploaded successfully! ID: ${response.examResultId}`)

      // Reset form
      setFormData({
        userId: "",
        examName: "",
        year: new Date().getFullYear(),
        scores: {},
      })
      setSubjects([{ name: "", score: "" }])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addSubject = () => {
    setSubjects([...subjects, { name: "", score: "" }])
  }

  const removeSubject = (index) => {
    setSubjects(subjects.filter((_, i) => i !== index))
  }

  const updateSubject = (index, field, value) => {
    const updated = subjects.map((subject, i) => (i === index ? { ...subject, [field]: value } : subject))
    setSubjects(updated)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Exam Results</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="userId">Student User ID</Label>
              <Input
                id="userId"
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                placeholder="Enter student's user ID"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="examName">Exam Name</Label>
              <Input
                id="examName"
                value={formData.examName}
                onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
                placeholder="e.g., Final Examination 2024"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: Number.parseInt(e.target.value) })}
              min="2020"
              max="2030"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Subject </Label>
              <Button type="button" variant="outline" size="sm" onClick={addSubject}>
                <Plus className="h-4 w-4 mr-2" />
                Add Subject
              </Button>
            </div>

            {subjects.map((subject, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Input
                    placeholder="Subject name (e.g., Mathematics)"
                    value={subject.name}
                    onChange={(e) => updateSubject(index, "name", e.target.value)}
                  />
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    placeholder="Score"
                    min="0"
                    max="100"
                    value={subject.score}
                    onChange={(e) => updateSubject(index, "score", e.target.value)}
                  />
                </div>
                {subjects.length > 1 && (
                  <Button type="button" variant="outline" size="sm" onClick={() => removeSubject(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Uploading..." : "Upload Exam Result"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
