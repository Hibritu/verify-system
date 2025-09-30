'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Suspense } from 'react';

// Dynamically import the QRCodeScanner component with SSR disabled
const QRCodeScanner = dynamic(
  () => import('@/components/certifcate/qr-scanner').then(mod => mod.QRCodeScanner),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
);

export default function ScanPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Verify Certificate</CardTitle>
          <CardDescription>
            Scan a certificate QR code to verify its authenticity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QRCodeScanner />
        </CardContent>
      </Card>
    </div>
  );
}
