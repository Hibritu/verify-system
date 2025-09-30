import { CertificateVerification } from "@/components/certifcate/certificate-verification"


export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Certificate Verification</h1>
          <p className="mt-2 text-gray-600">Enter a certificate ID to verify its authenticity</p>
        </div>
        <CertificateVerification />
      </div>
    </div>
  )
}
