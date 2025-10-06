import { CertificateVerification } from "@/components/certifcate/certificate-verification"
import { FadeIn } from "@/components/motion/fade-in"

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-emerald-700 to-teal-800 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-white/5 rounded-full animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-16 h-16 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-40 right-10 w-24 h-24 bg-white/5 rounded-full animate-pulse animation-delay-2000"></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-bounce"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white/40 rounded-full animate-bounce animation-delay-2000"></div>
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-white/25 rounded-full animate-bounce"></div>
      </div>

      <FadeIn delay={0.2}>
        <div className="max-w-2xl mx-auto relative z-10">
        <div className="text-center mb-8">
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <span className="text-3xl">🔍</span>
              </div>
              <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
                Certificate Verification
              </h1>
              <p className="text-lg text-green-100 font-medium">
                Enter a certificate ID to verify its authenticity
              </p>
            </div>
        </div>
          
          <div className="glass rounded-3xl p-8 shadow-2xl border border-white/20 backdrop-blur-xl">
        <CertificateVerification />
      </div>
        </div>
      </FadeIn>
    </div>
  )
}
