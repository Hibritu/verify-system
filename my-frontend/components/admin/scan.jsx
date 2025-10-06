"use client"
import { useEffect, useRef, useState } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import axios from "axios"
import { saveAs } from "file-saver"

export function ScanPage() {
  const [message, setMessage] = useState("")
  const scannerRef = useRef(null)
  const [active, setActive] = useState(false)
  const [initError, setInitError] = useState("")
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  useEffect(() => {
    // Environment checks before initializing the scanner
    if (typeof window !== 'undefined') {
      if (!window.isSecureContext) {
        setInitError("Camera access requires HTTPS or localhost. Please use a secure origin.")
        return
      }
      if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
        setInitError("Camera API not available in this browser. Try updating or use a different browser.")
        return
      }
    }

    if (active && !scannerRef.current) {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 })

      scanner.render(
        async (decodedText) => {
          try {
            const token = localStorage.getItem("token")
            if (!token) {
              setMessage("❌ Please login to download PDFs")
              return
            }
            // Decrypt QR code
            const decryptRes = await axios.post(
              `${API_BASE_URL}/pdf/decrypt`,
              { encrypted: decodedText },
              { headers: { Authorization: `Bearer ${token}` } }
            )

            const pdfUrl = decryptRes.data.downloadUrl || decryptRes.data.pdfUrl

            // Download PDF
            const pdfRes = await axios.get(pdfUrl, {
              responseType: 'blob',
              headers: { Authorization: `Bearer ${token}` },
            })

            saveAs(pdfRes.data, "certificate.pdf")
            setMessage("✅ PDF downloaded! You can now print it.")
          } catch (err) {
            console.error('Download failed:', err.response?.data || err.message)
            setMessage("❌ Download failed: " + (err.response?.data?.error || err.message))
          }

          console.log("Decoded text:", decodedText)
        },
        (error) => {
          const msg = typeof error === 'string' ? error : error?.message
          if (msg?.includes('NotAllowedError') || msg?.includes('Permission denied')) {
            setInitError('Camera permission denied. Please allow access in browser settings and reload.')
            return
          }
          if (msg?.includes('NotFoundError') || msg?.includes('no video input devices')) {
            setInitError('No camera found. Connect a camera and try again.')
            return
          }
          console.warn("QR scan error", error)
        }
      )

      scannerRef.current = scanner
    }

    return () => {
      if (scannerRef.current) scannerRef.current.clear().catch(console.error)
      scannerRef.current = null
    }
  }, [active])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Scan QR Code</h1>
          <p className="text-gray-600">Point your camera at a QR code to verify and download certificates</p>
        </div>

        {initError && (
          <div className="mb-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded p-3">{initError}</div>
        )}
        
        <div className="relative group">
          <div 
            id="reader" 
            className="mx-auto transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-lg rounded-lg overflow-hidden border-2 border-gray-200"
            style={{ width: "300px", minHeight: "300px" }} 
            ref={() => setActive(true)} 
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="border-4 border-dashed border-blue-200 rounded-lg w-11/12 h-5/6 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>
        
        <div className={`mt-6 text-center transition-all duration-300 ${message ? 'opacity-100 h-auto' : 'opacity-0 h-6'}`}>
          <p className={`inline-block px-4 py-2 rounded-lg ${message.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </p>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">Having trouble scanning? Make sure:</p>
          <ul className="mt-2 text-sm text-gray-500 space-y-1">
            <li className="hover:text-gray-700 transition-colors">• The QR code is well-lit</li>
            <li className="hover:text-gray-700 transition-colors">• The code is fully within the frame</li>
            <li className="hover:text-gray-700 transition-colors">• Your camera has proper focus</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
