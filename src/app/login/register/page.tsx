"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";
import { getOrCreateBusiness } from "@/server/actions/businesses";
import { setAuthCookie } from "@/server/actions/auth";

const activityTypes = [
  "Commerce",
  "Artisanat",
  "Services",
  "Agriculture",
  "Restauration",
  "Autre",
];

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    phone: "",
    name: "",
    sector: "",
    city: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.phone.trim() || !form.name.trim()) return;

    setLoading(true);
    try {
      const business = await getOrCreateBusiness({
        phone: form.phone.trim(),
        name: form.name.trim(),
        sector: form.sector || undefined,
        city: form.city.trim() || undefined,
      });

      if (business) {
        await setAuthCookie(business.id);
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-lg px-6 py-4">
        <div className="lg:bg-white lg:rounded-2xl lg:shadow-sm lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link
              href="/login"
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
              <ShieldCheck className="h-8 w-8 text-[#2D5A27]" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Cr&eacute;er un compte
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Entrez vos informations pour commencer
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Num&eacute;ro de t&eacute;l&eacute;phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="+229 01 97 00 00 00"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-[#2D5A27] focus:ring-1 focus:ring-[#2D5A27] focus:outline-none transition-colors"
              />
            </div>

            {/* Business name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Nom de la boutique
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Ex: Boutique Chez Ali"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-[#2D5A27] focus:ring-1 focus:ring-[#2D5A27] focus:outline-none transition-colors"
              />
            </div>

            {/* Activity type */}
            <div>
              <label
                htmlFor="sector"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Type d&apos;activit&eacute;
              </label>
              <select
                id="sector"
                name="sector"
                value={form.sector}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-[#2D5A27] focus:ring-1 focus:ring-[#2D5A27] focus:outline-none transition-colors appearance-none"
              >
                <option value="">S&eacute;lectionnez une activit&eacute;</option>
                {activityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* City */}
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Ville
              </label>
              <input
                id="city"
                name="city"
                type="text"
                placeholder="Ex: Cotonou"
                value={form.city}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-[#2D5A27] focus:ring-1 focus:ring-[#2D5A27] focus:outline-none transition-colors"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#2D5A27] py-4 text-base font-semibold text-white transition-colors hover:bg-[#234A1F] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-4 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              {loading ? "Cr\u00e9ation en cours..." : "Cr\u00e9er mon compte"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
