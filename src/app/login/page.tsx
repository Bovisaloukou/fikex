import Link from "next/link";
import { Banknote } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left brand panel - hidden on mobile, shown on desktop */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#2D5A27] items-center justify-center">
        <div className="text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/15 mx-auto mb-6">
            <Banknote className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">FiKex</h1>
          <p className="mt-2 text-lg text-green-200">
            Acc&egrave;s &agrave; la finance &agrave; tous
          </p>
        </div>
      </div>

      {/* Right content / Mobile full */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo - mobile only */}
        <div className="lg:hidden flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#2D5A27]">
            <Banknote className="h-10 w-10 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">FiKex</h1>
            <p className="mt-1 text-gray-500">
              Acc&egrave;s &agrave; la finance &agrave; tous
            </p>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1 min-h-24 lg:min-h-0 lg:flex-none" />

        {/* Buttons */}
        <div className="w-full max-w-sm space-y-3">
          <Link
            href="/login/register"
            className="block w-full rounded-full bg-[#2D5A27] py-4 text-center text-base font-semibold text-white transition-colors hover:bg-[#234A1F]"
          >
            Cr&eacute;er un compte
          </Link>
          <Link
            href="/login/otp"
            className="block w-full rounded-full border border-gray-300 bg-white py-4 text-center text-base font-semibold text-gray-900 transition-colors hover:bg-gray-50"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
