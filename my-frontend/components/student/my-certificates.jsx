"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Award, Download, Eye, Calendar, QrCode } from "lucide-react"
import { studentAPI } from "@/lib/api"
import { toast } from "sonner"

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

const ADMIN_SIGNATURES = [
  {
    name: "Dr. Sarah Johnson",
    title: "Dean of Academic Affairs"
  },
  {
    name: "Prof. Michael Chen",
    title: "Registrar"
  }
]

export function MyCertificates() {
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedCertificate, setSelectedCertificate] = useState(null)
  const [isDownloading, setIsDownloading] = useState(false)

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

  const handleDownloadPDF = async (certificate) => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    
    try {
      console.log('Starting PDF generation...');
      
      // Get exam stats from the certificate
      const { subjects = [], total = 0, count = 0, average = 0 } = 
        certificate?.examResult?.scores ? computeExamStats(certificate.examResult.scores) : {}
      const grade = computeGrade(average)
      
      // Use html2canvas with options to capture the full certificate
      const html2canvas = (await import('html2canvas')).default;
      
      // Create a temporary certificate element for PDF generation
      const tempDiv = document.createElement('div');
      tempDiv.className = 'certificate-container';
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.minWidth = '600px';
      tempDiv.style.minHeight = '400px';
      tempDiv.style.width = 'auto';
      tempDiv.style.height = 'auto';
      tempDiv.style.maxWidth = '800px';
      tempDiv.style.background = '#f4efdf';
      tempDiv.style.border = '10px double #070708';
      tempDiv.style.padding = '25px';
      tempDiv.style.fontFamily = 'Times New Roman, serif';
      tempDiv.style.color = '#000000';
      tempDiv.style.boxSizing = 'border-box';
      tempDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 class="certificate-title" style="font-size: 28px; color: #101011; margin-bottom: 15px; font-weight: bold; letter-spacing: 1px;">Certificate of Achievement</h1>
          <div style="color: #666; font-size: 12px;">
            <span>ID: <span style="font-family: monospace;">${certificate.certificateId}</span></span>
            <span style="margin: 0 8px;">•</span>
            <span>Issued: ${new Date(certificate.issuedAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>

        <div style="text-align: center; margin: 25px 0;">
          <p style="color: #666; font-size: 14px;">This is to certify that</p>
          <h2 class="student-name" style="font-size: 24px; color: #1a237e; margin: 15px 0; font-weight: 600;">${certificate.user?.name || 'Student'}</h2>
          <p style="color: #666; font-size: 14px;">has successfully completed the requirements for</p>
          <p class="exam-name" style="font-size: 18px; font-weight: 600; margin-top: 10px; color: #1e40af;">
            ${certificate.examName} - ${certificate.year}
          </p>
        </div>

        <div style="margin: 25px 0;">
          <h3 class="results-title" style="font-size: 18px; font-weight: 600; text-align: center; margin-bottom: 15px; color: #1f2937;">Examination Results</h3>
          <div style="max-width: 500px; margin: 0 auto 20px;">
            ${subjects.map((s) => `
              <div class="subject-row" style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; margin: 3px 0; border: 1px solid #ccc; background: #f9f9f9; border-radius: 3px; font-size: 12px;">
                <span class="subject-name" style="font-weight: 500; color: #1f2937;">${s.subject}</span>
                <span class="subject-score" style="font-weight: 600; color: #1d4ed8;">${s.score?.toFixed(1)}</span>
              </div>
            `).join('')}
          </div>
          
          <div style="display: flex; justify-content: center; gap: 15px; margin-top: 20px;">
            <div class="stats-container" style="background: #e3f2fd; display: inline-block; padding: 10px 15px; margin: 5px; border-radius: 6px; text-align: center; min-width: 80px;">
              <div style="color: #1d4ed8; font-weight: 500; font-size: 11px;">Average Score</div>
              <div style="color: #0d47a1; font-size: 16px; font-weight: bold; margin-top: 3px;">${average.toFixed(1)}</div>
            </div>
            <div class="grade-container" style="background: #e8f5e9; display: inline-block; padding: 10px 15px; margin: 5px; border-radius: 6px; text-align: center; min-width: 80px;">
              <div style="color: #15803d; font-weight: 500; font-size: 11px;">Final Grade</div>
              <div style="color: #2e7d32; font-size: 16px; font-weight: bold; margin-top: 3px;">${grade}</div>
            </div>
            <div class="total-container" style="background: #f3e5f5; display: inline-block; padding: 10px 15px; margin: 5px; border-radius: 6px; text-align: center; min-width: 80px;">
              <div style="color: #7c3aed; font-weight: 500; font-size: 11px;">Total Marks</div>
              <div style="color: #6a1b9a; font-size: 16px; font-weight: bold; margin-top: 3px;">${total}</div>
            </div>
          </div>
        </div>

        <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #ccc;">
          <div style="display: flex; justify-content: space-around; margin-top: 20px;">
            ${ADMIN_SIGNATURES.map((admin) => `
              <div style="text-align: center;">
                <div class="signature-line" style="width: 120px; height: 1px; background: #ccc; margin: 15px auto 8px;"></div>
                <div class="signature-name" style="font-weight: 600; color: #1f2937; margin-top: 8px; font-size: 12px;">${admin.name}</div>
                <div class="signature-title" style="font-size: 10px; color: #666; font-style: italic;">${admin.title}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="certificate-footer" style="margin-top: 20px; text-align: center; border-top: 1px solid #ccc; padding-top: 10px;">
          <p style="font-size: 10px; color: #999; margin: 3px 0;">
            Certificate ID: ${certificate.certificateId}
          </p>
          <p style="font-size: 10px; color: #999; margin: 3px 0;">
            Issued on: ${new Date(certificate.issuedAt).toLocaleDateString()}
          </p>
        </div>
      `;
      
      document.body.appendChild(tempDiv);
      
      // Wait for the element to be fully rendered
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get the actual dimensions of the certificate content
      const rect = tempDiv.getBoundingClientRect();
      const scrollWidth = tempDiv.scrollWidth;
      const scrollHeight = tempDiv.scrollHeight;
      
      console.log('Certificate dimensions:', { scrollWidth, scrollHeight });
      
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: Math.max(scrollWidth, 600),
        windowHeight: Math.max(scrollHeight, 400),
        width: scrollWidth,
        height: scrollHeight,
        foreignObjectRendering: false,
        removeContainer: true,
        imageTimeout: 0,
        onclone: (clonedDoc) => {
          // Inject CSS to override all colors with safe hex values
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * {
              color: #000000 !important;
              background-color: #ffffff !important;
              border-color: #cccccc !important;
            }
            .certificate-container {
              background-color: #f4efdf !important;
              border-color: #070708 !important;
            }
            .certificate-title {
              color: #101011 !important;
            }
            .student-name {
              color: #1a237e !important;
            }
            .exam-name {
              color: #1e40af !important;
            }
            .results-title {
              color: #1f2937 !important;
            }
            .subject-row {
              background-color: #f9f9f9 !important;
              border-color: #cccccc !important;
            }
            .subject-name {
              color: #1f2937 !important;
            }
            .subject-score {
              color: #1d4ed8 !important;
            }
            .stats-container {
              background-color: #e3f2fd !important;
            }
            .grade-container {
              background-color: #e8f5e9 !important;
            }
            .total-container {
              background-color: #f3e5f5 !important;
            }
            .signature-line {
              background-color: #cccccc !important;
            }
            .signature-name {
              color: #1f2937 !important;
            }
            .signature-title {
              color: #666666 !important;
            }
            .certificate-footer {
              color: #999999 !important;
            }
          `;
          clonedDoc.head.appendChild(style);
        }
      });
      
      // Convert canvas to PDF using jsPDF
      const { jsPDF } = await import('jspdf');
      const imgData = canvas.toDataURL('image/png');
      
      console.log('Canvas dimensions:', { width: canvas.width, height: canvas.height });
      
      // Calculate dimensions to fit the full certificate
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15; // Increased margin for better appearance
      
      // Calculate the size to fit the certificate on the page
      const maxWidth = pageWidth - (margin * 2);
      const maxHeight = pageHeight - (margin * 2);
      
      // Convert canvas pixels to mm (1 inch = 25.4mm, 96 DPI)
      const canvasWidthMM = (canvas.width * 25.4) / 96;
      const canvasHeightMM = (canvas.height * 25.4) / 96;
      
      console.log('Canvas dimensions in MM:', { canvasWidthMM, canvasHeightMM });
      console.log('Available space in MM:', { maxWidth, maxHeight });
      
      // Calculate scaling to fit the certificate without cropping
      const scaleX = maxWidth / canvasWidthMM;
      const scaleY = maxHeight / canvasHeightMM;
      const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
      
      const imgWidth = canvasWidthMM * scale;
      const imgHeight = canvasHeightMM * scale;
      
      console.log('Final image dimensions:', { imgWidth, imgHeight, scale });
      
      // Center the image on the page
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;
      
      console.log('Image position:', { x, y });
      
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      
      // Clean up
      document.body.removeChild(tempDiv);
      
      pdf.save(`certificate-${certificate.certificateId}.pdf`);
      console.log('PDF generation completed successfully');
      toast.success('Certificate downloaded successfully!');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(`Failed to download certificate: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
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

                                <div className="text-center pt-4 border-t">
                                  <Button 
                                    onClick={() => handleDownloadPDF(selectedCertificate)}
                                    disabled={isDownloading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    {isDownloading ? 'Generating PDF...' : 'Download Certificate PDF'}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDownloadPDF(certificate)}
                          disabled={isDownloading}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {isDownloading ? 'Generating...' : 'Download PDF'}
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
