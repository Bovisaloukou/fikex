"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Delete, Loader2, Phone } from "lucide-react";
import { getBusinessByPhone } from "@/server/actions/businesses";
import { setAuthCookie } from "@/server/actions/auth";

export default function OtpPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [code, setCode] = useState<string[]>(["", "", "", ""]);
  const [countdown, setCountdown] = useState(24);
  const [loading, setLoading] = useState(false);

  // Countdown timer for resend
  useEffect(() => {
    if (step !== "otp" || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [step, countdown]);

  function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setError("");
    setStep("otp");
    setCountdown(24);
  }

  async function loginWithPhone() {
    setLoading(true);
    setError("");
    try {
      const business = await getBusinessByPhone(phone.trim());
      if (business) {
        await setAuthCookie(business.id);
        router.push("/dashboard");
      } else {
        setError("Aucun compte trouvé pour ce numéro. Créez un compte d'abord.");
        setCode(["", "", "", ""]);
        setLoading(false);
      }
    } catch {
      setError("Une erreur est survenue. Réessayez.");
      setLoading(false);
    }
  }

  function handleKeyPress(digit: string) {
    const nextEmpty = code.findIndex((d) => d === "");
    if (nextEmpty === -1) return;

    const newCode = [...code];
    newCode[nextEmpty] = digit;
    setCode(newCode);

    // Auto-submit when all 4 digits are entered
    if (nextEmpty === 3) {
      setTimeout(() => loginWithPhone(), 300);
    }
  }

  function handleBackspace() {
    const lastFilled = code.reduce(
      (acc: number, d: string, i: number) => (d !== "" ? i : acc),
      -1
    );
    if (lastFilled === -1) return;

    const newCode = [...code];
    newCode[lastFilled] = "";
    setCode(newCode);
  }

  function handleResend() {
    setCountdown(24);
    setCode(["", "", "", ""]);
    setError("");
  }

  function handleSubmit() {
    const filled = code.every((d) => d !== "");
    if (!filled) return;
    loginWithPhone();
  }

  const formatCountdown = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const keypadKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "backspace"];

  return (
    <div className="min-h-screen bg-gray-50 lg:bg-gray-100">
      <div className="max-w-lg mx-auto px-6 py-4 lg:py-12">
        <div className="lg:bg-white lg:rounded-2xl lg:shadow-sm lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link
              href={step === "otp" ? "#" : "/login"}
              onClick={(e) => {
                if (step === "otp") {
                  e.preventDefault();
                  setStep("phone");
                  setCode(["", "", "", ""]);
                  setError("");
                  setLoading(false);
                }
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </Link>
            <button
              type="button"
              className="text-sm font-medium text-[#2D5A27] cursor-pointer"
            >
              Besoin d&apos;aide ?
            </button>
          </div>

          {/* Icon */}
          <div className="flex justify-center mt-6 mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F5E3]">
              {step === "phone" ? (
                <Phone className="h-8 w-8 text-[#2D5A27]" />
              ) : (
                <ShieldCheck className="h-8 w-8 text-[#2D5A27]" />
              )}
            </div>
          </div>

          {step === "phone" ? (
            <>
              {/* Phone step */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Se connecter
                </h1>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  Entrez votre num&eacute;ro de t&eacute;l&eacute;phone pour acc&eacute;der &agrave; votre compte
                </p>
              </div>

              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Num&eacute;ro de t&eacute;l&eacute;phone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    placeholder="+229 01 97 00 00 00"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setError(""); }}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-[#2D5A27] focus:ring-1 focus:ring-[#2D5A27] focus:outline-none transition-colors"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 text-center">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={!phone.trim()}
                  className="w-full rounded-full bg-[#2D5A27] py-4 text-base font-semibold text-white transition-colors hover:bg-[#234A1F] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Continuer
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500">
                Pas encore de compte ?{" "}
                <Link href="/login/register" className="font-medium text-[#2D5A27]">
                  Cr&eacute;er un compte
                </Link>
              </p>
            </>
          ) : (
            <>
              {/* OTP step */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Code de s&eacute;curit&eacute;
                </h1>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  Saisissez le code &agrave; 4 chiffres que nous venons d&apos;envoyer
                  par SMS au{" "}
                  <span className="font-medium text-gray-700">
                    {phone}
                  </span>
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-600 text-center mb-4">{error}</p>
              )}

              {/* OTP Input boxes */}
              <div className="flex justify-center gap-3 mb-4">
                {code.map((digit, i) => (
                  <div
                    key={i}
                    className={`flex h-14 w-14 items-center justify-center rounded-xl border-2 text-2xl font-bold transition-colors ${
                      digit
                        ? "border-[#2D5A27] bg-white text-gray-900"
                        : i === code.findIndex((d) => d === "")
                          ? "border-[#2D5A27] bg-white text-gray-900"
                          : "border-gray-200 bg-gray-50 text-gray-400"
                    }`}
                  >
                    {digit || ""}
                  </div>
                ))}
              </div>

              {/* Resend link */}
              <div className="text-center mb-6">
                {countdown > 0 ? (
                  <p className="text-sm text-gray-500">
                    Code non re&ccedil;u ? Renvoyer ({formatCountdown(countdown)})
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-sm font-medium text-[#2D5A27] cursor-pointer"
                  >
                    Renvoyer le code
                  </button>
                )}
              </div>

              {/* Custom numeric keypad */}
              <div className="max-w-xs mx-auto">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {keypadKeys.map((key, i) => {
                    if (key === "") {
                      return <div key={i} />;
                    }
                    if (key === "backspace") {
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={handleBackspace}
                          className="flex h-14 items-center justify-center rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer"
                        >
                          <Delete className="h-6 w-6" />
                        </button>
                      );
                    }
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleKeyPress(key)}
                        className="flex h-14 items-center justify-center rounded-xl text-xl font-semibold text-gray-900 hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer"
                      >
                        {key}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!code.every((d) => d !== "") || loading}
                className="w-full rounded-full bg-[#2D5A27] py-4 text-base font-semibold text-white transition-colors hover:bg-[#234A1F] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
