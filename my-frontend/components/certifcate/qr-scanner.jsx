'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Dynamically import the QR scanner with SSR disabled
const QrScanner = dynamic(
  () => import('@yudiel/react-qr-scanner').then((mod) => mod.QrScanner),
  { ssr: false }
);

export function QRCodeScanner() {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleScan = async (result) => {
    if (result) {
      setLoading(true);
      setError('');
      
      try {
        // Extract the certificate ID from the URL if it's a full URL
        const url = new URL(result);
        const certificateId = url.pathname.split('/').pop();
        
        const response = await fetch(`/api/certificates/verify?certificateId=${certificateId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Verification failed');
        }
        
        setScanResult({
          valid: true,
          data: data,
          certificateId: certificateId
        });
      } catch (err) {
        setScanResult({
          valid: false,
          message: err.message || 'Invalid QR code or certificate not found'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleError = (err) => {
    console.error('QR Scanner error:', err);
    setError('Failed to initialize scanner. Please check camera permissions.');
  };

  const resetScanner = () => {
    setScanResult(null);
    setError('');
  };

  const viewCertificate = () => {
    if (scanResult?.valid) {
      router.push(`/verify-certificate/${scanResult.certificateId}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Scan Certificate QR Code</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 w-full">
          {error}
        </div>
      )}

      {!scanResult && !loading && (
        <div className="w-full rounded-lg overflow-hidden border-2 border-dashed border-gray-300 p-2">
          <QrScanner
            onDecode={handleScan}
            onError={handleError}
            constraints={{ 
              facingMode: 'environment',
              aspectRatio: 1 
            }}
            containerStyle={{
              width: '100%',
              maxWidth: '400px',
              margin: '0 auto',
              borderRadius: '0.5rem',
              overflow: 'hidden'
            }}
            videoStyle={{
              width: '100%',
              height: 'auto',
              objectFit: 'cover'
            }}
          />
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p>Verifying certificate...</p>
        </div>
      )}

      {scanResult && (
        <div className={`p-6 rounded-lg w-full text-center ${scanResult.valid ? 'bg-green-50' : 'bg-red-50'}`}>
          {scanResult.valid ? (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-800 mb-2">Valid Certificate</h3>
              <p className="text-green-700 mb-4">This certificate is valid and verified.</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={viewCertificate} className="bg-green-600 hover:bg-green-700">
                  View Certificate
                </Button>
                <Button variant="outline" onClick={resetScanner}>
                  Scan Another
                </Button>
              </div>
            </>
          ) : (
            <>
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-red-800 mb-2">Verification Failed</h3>
              <p className="text-red-700 mb-4">{scanResult.message || 'This certificate could not be verified.'}</p>
              <Button onClick={resetScanner} variant="outline">
                Try Again
              </Button>
            </>
          )}
        </div>
      )}

      <p className="mt-4 text-sm text-gray-500 text-center">
        Point your camera at a certificate QR code to verify its authenticity.
      </p>
    </div>
  );
}
