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
    signature: "/signatures/u.png"
  },
  {
    name: "Prof. Michael Chen",
    title: "Registrar",
    signature: "/signatures/y.png"
  }
]

// Helper functions
const computeGrade = (score) => {
  if (typeof score !== 'number') return null
  if (score > 90) return 'A+'
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
  const [recentExamResults, setRecentExamResults] = useState([])
  const [signatureUrl, setSignatureUrl] = useState("")

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
      padding: 2rem;
      position: relative;
      max-width: 1200px;
      min-width: 1200px;
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
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    setIsClient(true);
    fetchRecentExamResults();
  }, []);

  const fetchRecentExamResults = async () => {
    setLoadingResults(true);
    try {
      const response = await adminAPI.getRecentExamResults();
      setRecentExamResults(response.examResults || []);
    } catch (err) {
      console.error('Failed to fetch recent exam results:', err);
      // Show user-friendly error message
      toast.error('Failed to load recent exam results. Please try again.');
      setRecentExamResults([]); // Set empty array on error
    } finally {
      setLoadingResults(false);
    }
  };

  const generateCertificateFromResult = async (examResult) => {
    setLoading(true);
    setError("");
    setCertificate(null);

    try {
      const response = await adminAPI.generateCertificate({
        userId: examResult.userId,
        examResultId: examResult._id
      });
      setCertificate(response.certificate);
      toast.success("Certificate generated successfully");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to generate certificate";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!certificate || typeof window === 'undefined' || isDownloading) return;
    
    setIsDownloading(true);
    
    try {
      console.log('Starting PDF generation from UI...');
      
      // Get the certificate element from the UI
      const element = document.getElementById('certificate-content');
      if (!element) {
        throw new Error('Certificate content not found');
      }
      
      // Use html2canvas with options to capture the full certificate
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        // Don't set fixed width/height to avoid cropping
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        // Force all colors to be simple
        foreignObjectRendering: false,
        removeContainer: true,
        imageTimeout: 0,
        onclone: (clonedDoc) => {
          // Remove any problematic styles from the cloned document
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * {
              color: #000000 !important;
              background-color: #ffffff !important;
              border-color: #000000 !important;
            }
            .certificate-container {
              background: #f4efdf !important;
              border: 10px double #070708 !important;
            }
            .cert-title {
              color: #101011 !important;
            }
            .recipient-name {
              color: #1a237e !important;
            }
            .exam-name {
              color: #1e40af !important;
            }
            .results-title {
              color: #1f2937 !important;
            }
            .subject-name {
              color: #1f2937 !important;
            }
            .subject-score {
              color: #1d4ed8 !important;
            }
            .score-label {
              color: #1976d2 !important;
            }
            .score-card.green .score-label {
              color: #388e3c !important;
            }
            .score-card.purple .score-label {
              color: #7b1fa2 !important;
            }
            .score-value {
              color: #0d47a1 !important;
            }
            .score-card.green .score-value {
              color: #2e7d32 !important;
            }
            .score-card.purple .score-value {
              color: #6a1b9a !important;
            }
            .signature-name {
              color: #1f2937 !important;
            }
            .signature-title {
              color: #666666 !important;
            }
            .footer-text {
              color: #999999 !important;
            }
          `;
          clonedDoc.head.appendChild(style);
        }
      });
      
      // Convert canvas to PDF using jsPDF
      const { jsPDF } = await import('jspdf');
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions to fit the full certificate
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10; // Small margin
      
      // Calculate the size to fit the certificate on the page
      const maxWidth = pageWidth - (margin * 2);
      const maxHeight = pageHeight - (margin * 2);
      
      // Calculate scaling to fit the certificate
      const scaleX = maxWidth / (canvas.width * 0.264583); // Convert pixels to mm
      const scaleY = maxHeight / (canvas.height * 0.264583);
      const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
      
      const imgWidth = (canvas.width * 0.264583) * scale;
      const imgHeight = (canvas.height * 0.264583) * scale;
      
      // Center the image on the page
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      
      pdf.save(`certificate-${certificate.certificateId}.pdf`);
      console.log('PDF generation completed successfully');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(`Failed to download certificate: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  

  const { subjects = [], total = 0, count = 0, average = 0 } = 
    certificate?.exam?.scores ? computeExamStats(certificate.exam.scores) : {}
  const grade = computeGrade(average)

  return (
    <div className="space-y-6">
      {/* Recent Exam Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Exam Results</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchRecentExamResults}
              disabled={loadingResults}
            >
              {loadingResults ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingResults ? (
            <div className="text-center py-4">Loading recent exam results...</div>
          ) : recentExamResults.length > 0 ? (
            <div className="space-y-3">
              {recentExamResults.slice(0, 5).map((result) => (
                <div key={result._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{result.examName} - {result.year}</div>
                    <div className="text-sm text-gray-600">User ID: {result.userId}</div>
                    <div className="text-sm text-gray-600">Result ID: {result._id}</div>
                  </div>
                  <Button 
                    onClick={() => generateCertificateFromResult(result)}
                    disabled={loading}
                    size="sm"
                  >
                    Generate Certificate
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No recent exam results found. Upload some exam results first.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Certificate Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Certificate Manually</CardTitle>
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

          <div className="space-y-2">
            <Label htmlFor="signatureUrl">Signature Image URL (optional)</Label>
            <Input
              id="signatureUrl"
              value={signatureUrl}
              onChange={(e) => setSignatureUrl(e.target.value)}
              placeholder="Paste a public PNG/JPG URL (transparent PNG recommended)"
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
        <div style={{ position: 'fixed', inset: '0', zIndex: 60, backgroundColor: 'white', overflowY: 'auto', padding: '16px' }} className="print:fixed print:inset-0 print:z-60 print:bg-white">
          <Card style={{ border: 'none', boxShadow: 'none' }} className="print:border-0 print:shadow-none">
            <CardHeader style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }} className="print:hidden flex flex-row items-center justify-between">
              <CardTitle>Certificate Preview</CardTitle>
              <div style={{ display: 'flex', gap: '8px' }}>
                
                <Button 
                  variant="outline"
                  onClick={handleDownloadPDF}
                  disabled={!isClient || isDownloading}
                >
                  {isDownloading ? 'Generating PDF...' : 'Download PDF'}
                </Button>
                
              </div>
            </CardHeader>
            <CardContent style={{ overflowX: 'auto' }}>
              <div id="certificate-content" style={{
                background: '#f4efdf',
                border: '10px double #070708',
                padding: '25px',
                position: 'relative',
                maxWidth: '600px',
                margin: '0 auto',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                fontFamily: 'Times New Roman, serif'
              }}>
                {/* Header with Seal */}
                <div style={{ textAlign: 'center', marginBottom: '20px', position: 'relative' }}>
                  <h1 style={{ 
                    fontSize: '28px', 
                    color: '#101011', 
                    marginBottom: '15px', 
                    fontWeight: '700', 
                    letterSpacing: '1px' 
                  }}>Certificate of Achievement</h1>
                  <div style={{ color: '#6b7280', fontSize: '12px' }}>
                    <span>ID: <span style={{ fontFamily: 'monospace' }}>{certificate.certificateId}</span></span>
                    <span style={{ margin: '0 8px' }}>•</span>
                    <span>Issued: {new Date(certificate.issuedAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                 
                </div>

                {/* Recipient Info */}
                <div style={{ textAlign: 'center', margin: '25px 0' }}>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>This is to certify that</p>
                  <h2 style={{ 
                    fontSize: '24px', 
                    color: '#1a237e', 
                    margin: '15px 0', 
                    fontWeight: '600' 
                  }}>{certificate.user.name}</h2>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>has successfully completed the requirements for</p>
                  <p style={{ fontSize: '18px', fontWeight: '600', marginTop: '10px', color: '#1e40af' }}>
                    {certificate.exam.examName} - {certificate.exam.year}
                  </p>
                </div>

                {/* Exam Results */}
                <div style={{ margin: '25px 0' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', textAlign: 'center', marginBottom: '15px', color: '#1f2937' }}>Examination Results</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '20px', maxWidth: '500px', margin: '0 auto 20px' }}>
                    {subjects.map((s) => (
                      <div key={s.subject} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: '3px', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', fontSize: '12px' }}>
                        <span style={{ fontWeight: '500', color: '#1f2937' }}>{s.subject}</span>
                        <span style={{ fontWeight: '600', color: '#1d4ed8' }}>{s.score?.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
                    <div style={{ background: '#e3f2fd', display: 'inline-block', padding: '10px 15px', margin: '5px', borderRadius: '6px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', minWidth: '80px' }}>
                      <div style={{ color: '#1d4ed8', fontWeight: '500', fontSize: '11px' }}>Average Score</div>
                      <div style={{ color: '#0d47a1', fontSize: '16px', fontWeight: 'bold', marginTop: '3px' }}>{average.toFixed(1)}</div>
                    </div>
                    <div style={{ background: '#e8f5e9', display: 'inline-block', padding: '10px 15px', margin: '5px', borderRadius: '6px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', minWidth: '80px' }}>
                      <div style={{ color: '#15803d', fontWeight: '500', fontSize: '11px' }}>Final Grade</div>
                      <div style={{ color: '#2e7d32', fontSize: '16px', fontWeight: 'bold', marginTop: '3px' }}>{grade}</div>
                    </div>
                    <div style={{ background: '#f3e5f5', display: 'inline-block', padding: '10px 15px', margin: '5px', borderRadius: '6px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', minWidth: '80px' }}>
                      <div style={{ color: '#7c3aed', fontWeight: '500', fontSize: '11px' }}>Total Marks</div>
                      <div style={{ color: '#6a1b9a', fontSize: '16px', fontWeight: 'bold', marginTop: '3px' }}>{total}</div>
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div style={{ marginTop: '25px', paddingTop: '15px', borderTop: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
                    {ADMIN_SIGNATURES.map((admin, i) => (
                      <div key={i} style={{ textAlign: 'center', margin: '10px 0', width: '100%', padding: '0 10px' }}>
                        <div style={{ height: '90px', marginBottom: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
                          {signatureUrl ? (
                            <img
                              src={signatureUrl}
                              alt="Signature"
                              crossOrigin="anonymous"
                              style={{ maxWidth: '160px', maxHeight: '60px', objectFit: 'contain', marginBottom: '6px' }}
                              onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                          ) : null}
                          <div style={{ width: '160px', height: '1px', backgroundColor: '#d1d5db', position: 'relative' }}>
                            <div style={{ position: 'absolute', inset: '0', borderTop: '1px dashed #9ca3af' }}></div>
                          </div>
                        </div>
                        <div style={{ fontWeight: '600', color: '#1f2937', marginTop: '8px', fontSize: '12px' }}>{admin.name}</div>
                        <div style={{ fontSize: '10px', color: '#6b7280', fontStyle: 'italic' }}>{admin.title}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verification Section */}
                <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #e5e7eb', paddingTop: '10px' }}>
                  <p style={{ fontSize: '10px', color: '#6b7280', marginTop: '5px' }}>
                    Certificate ID: {certificate.certificateId}
                  </p>
                  <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '3px' }}>
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