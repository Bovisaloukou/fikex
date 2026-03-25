"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { updateBusiness } from "@/server/actions/businesses";
import { User, Camera, ChevronRight, Loader2, LogOut } from "lucide-react";
import type { Business } from "@/server/db/schema";
import { clearCookie } from "@/lib/client-auth";

interface ProfileFormProps {
  business: Business | null;
}

export function ProfileForm({ business }: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(business?.name ?? "");
  const [sector, setSector] = useState(business?.sector ?? "");
  const [city, setCity] = useState(business?.city ?? "");
  const [saving, setSaving] = useState(false);

  function handleLogout() {
    clearCookie("fikex_business_id");
    router.push("/login");
  }

  async function handleSave() {
    if (!business) return;
    setSaving(true);
    try {
      await updateBusiness(business.id, {
        name,
        sector: sector || null,
        city: city || null,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Mon Profil" />

      <div className="max-w-lg mx-auto px-4 pb-8 pt-6 space-y-6">
        {/* Avatar */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200">
              <User className="h-10 w-10 text-gray-400" />
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#2D5A27] text-white shadow-md cursor-pointer"
              aria-label="Changer la photo"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Section: ENTREPRISE & ACTIVITE */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
            Entreprise & Activit&eacute;
          </p>
          <div className="rounded-xl bg-white shadow-sm">
            <div className="px-4 py-3">
              <label htmlFor="business-name" className="block text-xs text-gray-400">
                Nom de la boutique
              </label>
              <input
                id="business-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-0.5 w-full bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:text-gray-300"
                placeholder="Nom de votre entreprise"
              />
            </div>
            <div className="mx-4 border-t border-gray-100" />
            <div className="px-4 py-3">
              <label htmlFor="sector" className="block text-xs text-gray-400">
                Type d&apos;activit&eacute;
              </label>
              <input
                id="sector"
                type="text"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="mt-0.5 w-full bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:text-gray-300"
                placeholder="Ex: Commerce g&eacute;n&eacute;ral"
              />
            </div>
          </div>
        </div>

        {/* Section: LOCALISATION */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
            Localisation
          </p>
          <div className="rounded-xl bg-white shadow-sm">
            <div className="px-4 py-3">
              <label htmlFor="city" className="block text-xs text-gray-400">
                Adresse physique
              </label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-0.5 w-full bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:text-gray-300"
                placeholder="Ville, quartier"
              />
            </div>
            <div className="mx-4 border-t border-gray-100" />
            <div className="px-4 py-3">
              <button
                type="button"
                className="flex items-center gap-1.5 text-sm font-medium text-[#2D5A27] cursor-pointer"
              >
                <span>📍</span>
                Mettre &agrave; jour la g&eacute;olocalisation
              </button>
            </div>
          </div>
        </div>

        {/* Section: FINANCEMENT */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
            Financement
          </p>
          <div className="rounded-xl bg-white shadow-sm">
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-3 cursor-pointer"
            >
              <div className="text-left">
                <p className="text-xs text-gray-400">
                  Institution de microfinance
                </p>
                <p className="mt-0.5 text-sm font-medium text-gray-900">
                  PADME B&eacute;nin
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-300" />
            </button>
          </div>
        </div>

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-full bg-[#2D5A27] py-4 font-medium text-white transition-colors hover:bg-[#234A1F] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          {saving && <Loader2 className="h-5 w-5 animate-spin" />}
          {saving ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-full border border-red-200 py-4 font-medium text-red-600 transition-colors hover:bg-red-50 cursor-pointer flex items-center justify-center gap-2"
        >
          <LogOut className="h-5 w-5" />
          Se d&eacute;connecter
        </button>
      </div>
    </div>
  );
}
