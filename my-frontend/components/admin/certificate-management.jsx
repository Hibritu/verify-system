"use client"

"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { adminAPI } from "@/lib/api"
import { toast } from "sonner"
import dynamic from 'next/dynamic'

// Constants
const ADMIN_SIGNATURES = [
  {
    name: "Dr. Sarah Johnson",
    title: "Dean of Academic Affairs",
    signature: "/signatures/dean-signature.png"
  },
  {
    name: "Prof. Michael Chen",
    title: "Registrar",
    signature: "/signatures/registrar-signature.png"
  }
]

// Helper functions
const computeGrade = (score) => {
  if (typeof score !== 'number') return null
  if (score > 85) return 'A'
  if (score >= 80) return 'A-'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  if (score >= 50) return 'D'
  return 'F'
}

const computeExamStats = (scoresObj) => {
  const entries = scoresObj ? Object.entries(scoresObj) : []
  const subjects = entries.map(([subject, score]) => ({ 
    subject, 
    score: Number(score) 
  }))
  
  const total = subjects.reduce((acc, s) => acc + (isNaN(s.score) ? 0 : s.score), 0)
  const count = subjects.length || 1
  const average = total / count
  
  return { 
    subjects, 
    total: Math.round(total * 100) / 100,
    count, 
    average: Math.round(average * 100) / 100
  }
}

export function CertificateManagement() {
  const [formData, setFormData] = useState({
    userId: "",
    examResultId: "",
  })
  const [loading, setLoading] = useState(false)
  const [certificate, setCertificate] = useState(null)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.userId || !formData.examResultId) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    setError("")
    setCertificate(null)

    try {
      const response = await adminAPI.generateCertificate(formData)
      setCertificate(response.certificate)
      setFormData({ userId: "", examResultId: "" })
      toast.success("Certificate generated successfully")
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to generate certificate"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const printStyles = `
    @page {
      size: A4 landscape;
      margin: 0.5cm;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Times New Roman', serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .no-print {
      display: none !important;
    }
    .print-only {
      display: block !important;
    }
    .certificate-container {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
    }
  `

  const certificateStyles = `
    .certificate-container {
      background:rgb(244, 239, 231);
      border: 15px double #070708d3;
      padding: 2.5rem;
      position: relative;
      max-width: 1000px;
      margin: 0 auto;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      page-break-after: always;
      page-break-inside: avoid;
    }
    .certificate-header {
      text-align: center;
      margin-bottom: 2rem;
      position: relative;
    }
    .certificate-title {
      font-size: 2.5rem;
      color: #101011ff;
      margin-bottom: 0.5rem;
      font-weight: 700;
      letter-spacing: 1px;
    }
    .certificate-seal {
      position: absolute;
      right: 2rem;
      top: 0;
      width: 120px;
      opacity: 0.9;
    }
    .recipient-name {
      font-size: 2.2rem;
      color: #1a237e;
      margin: 1.5rem 0;
      font-weight: 600;
    }
    .signature-container {
      display: flex;
      justify-content: space-around;
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 2px solid #0d47a1;
    }
    .signature-box {
      text-align: center;
      min-width: 220px;
    }
    .signature-line {
      border-top: 1px solid #333;
      width: 180px;
      margin: 4rem auto 1rem;
      position: relative;
    }
    .signature-line:before {
      content: "";
      position: absolute;
      top: -3px;
      left: 0;
      right: 0;
      border-top: 1px solid #666;
    }
    .signature-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1a237e;
      margin-top: 0.5rem;
    }
    .signature-title {
      font-size: 0.9rem;
      color: #555;
      font-style: italic;
    }
    .score-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .score-value {
      font-size: 1.8rem;
      font-weight: 700;
      margin-top: 0.5rem;
    }
    @media print {
      body {
        background: white !important;
      }
      .no-print {
        display: none !important;
      }
      .certificate-container {
        border: none;
        padding: 0;
        box-shadow: none;
      }
    }
  `

  const [isClient, setIsClient] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDownloadPDF = async () => {
    if (!certificate || typeof window === 'undefined' || isDownloading) return;
    
    setIsDownloading(true);
    
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('certificate-content');
      
      if (!element) {
        throw new Error('Certificate content not found');
      }
      
      const opt = {
        margin: 0,
        filename: `certificate-${certificate.certificateId}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
          scale: 1.5,
          useCORS: true,
          logging: false,
          letterRendering: true,
          backgroundColor: '#fff9f0'
        },
        jsPDF: { 
          unit: 'mm',
          format: 'a4',
          orientation: 'landscape'
        }
      };
      
      // Directly use the element without cloning for simplicity
      await html2pdf().set(opt).from(element).save();
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to download certificate. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  

  const { subjects = [], total = 0, count = 0, average = 0 } = 
    certificate?.exam?.scores ? computeExamStats(certificate.exam.scores) : {}
  const grade = computeGrade(average)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Certificate</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="userId">Student User ID</Label>
              <Input
                id="userId"
                value={formData.userId}
                onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                placeholder="Enter student's user ID"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="examResultId">Exam Result ID</Label>
              <Input
                id="examResultId"
                value={formData.examResultId}
                onChange={(e) => setFormData(prev => ({ ...prev, examResultId: e.target.value }))}
                placeholder="Enter exam result ID"
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Generating..." : "Generate Certificate"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {certificate && (
        <div className="print:fixed print:inset-0 print:z-60 print:bg-white">
          <Card className="print:border-0 print:shadow-none">
            <CardHeader className="print:hidden flex flex-row items-center justify-between">
              <CardTitle>Certificate Preview</CardTitle>
              <div className="flex gap-2">
                
                <Button 
                  variant="outline"
                  onClick={handleDownloadPDF}
                  disabled={!isClient || isDownloading}
                >
                  {isDownloading ? 'Generating PDF...' : 'Download PDF'}
                </Button>
                
              </div>
            </CardHeader>
            <CardContent>
              <div id="certificate-content" className="certificate-container">
                <style jsx>{certificateStyles}</style>
                
                {/* Header with Seal */}
                <div className="certificate-header">
                  <h1 className="certificate-title">Certificate of Achievement</h1>
                  <div className="text-gray-600 space-x-4 text-sm">
                    <span>ID: <span className="font-mono">{certificate.certificateId}</span></span>
                    <span>•</span>
                    <span>Issued: {new Date(certificate.issuedAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                 
                </div>

                {/* Recipient Info */}
                <div className="text-center my-12">
                  <p className="text-gray-600 text-lg">This is to certify that</p>
                  <h2 className="recipient-name">{certificate.user.name}</h2>
                  <p className="text-gray-600 text-lg">has successfully completed the requirements for</p>
                  <p className="text-2xl font-semibold mt-4 text-blue-800">
                    {certificate.exam.examName} - {certificate.exam.year}
                  </p>
                </div>

                {/* Exam Results */}
                <div className="my-12">
                  <h3 className="text-2xl font-semibold text-center mb-6 text-gray-800">Examination Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-3xl mx-auto">
                    {subjects.map((s) => (
                      <div key={s.subject} className="flex justify-between items-center px-5 py-3 border rounded-lg bg-white shadow-sm">
                        <span className="font-medium text-gray-800">{s.subject}</span>
                        <span className="font-semibold text-blue-700">{s.score?.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-6 mt-10">
                    <div className="score-card" style={{ background: '#e3f2fd' }}>
                      <div className="text-blue-700 font-medium">Average Score</div>
                      <div className="score-value" style={{ color: '#0d47a1' }}>{average.toFixed(1)}</div>
                    </div>
                    <div className="score-card" style={{ background: '#e8f5e9' }}>
                      <div className="text-green-700 font-medium">Final Grade</div>
                      <div className="score-value" style={{ color: '#2e7d32' }}>{grade}</div>
                    </div>
                    <div className="score-card" style={{ background: '#f3e5f5' }}>
                      <div className="text-purple-700 font-medium">Total Marks</div>
                      <div className="score-value" style={{ color: '#6a1b9a' }}>{total}</div>
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="flex flex-wrap justify-around">
                    {ADMIN_SIGNATURES.map((admin, i) => (
                      <div key={i} className="text-center my-4 w-full sm:w-1/2 px-4">
                        <div className="h-24 mb-2 flex flex-col items-center justify-end">
                          <div className="w-48 h-1 bg-gray-300 relative">
                            <div className="absolute inset-0 border-t border-dashed border-gray-400"></div>
                          </div>
                        </div>
                        <div className="font-semibold text-gray-800 mt-2">{admin.name}</div>
                        <div className="text-sm text-gray-600 italic">{admin.title}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verification Section */}
                <div className="mt-8 text-center border-t border-gray-200 pt-6">
                  <p className="text-xs text-gray-500 mt-2">
                    Certificate ID: {certificate.certificateId}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Issued on: {new Date(certificate.issuedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}