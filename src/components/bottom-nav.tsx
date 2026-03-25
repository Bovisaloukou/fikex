"use client";

import { useState } from "react";
import { Camera, Mic, Keyboard } from "lucide-react";
import { VoiceInput } from "@/components/voice-input";
import { ScannerInput } from "@/components/scanner-input";
import { ManualInput } from "@/components/manual-input";

type ActiveModal = "voice" | "scanner" | "manual" | null;

export function BottomNav() {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-white border-t border-border">
          <div className="flex items-end justify-around px-4 py-2">
            {/* Scanner button */}
            <button
              type="button"
              onClick={() => setActiveModal("scanner")}
              className="flex flex-col items-center gap-1 py-2 px-3 text-muted transition-colors cursor-pointer"
            >
              <Camera className="h-6 w-6" />
              <span className="text-xs font-medium">Scanner</span>
            </button>

            {/* Voix button — elevated green circle */}
            <div className="flex flex-col items-center -mt-6">
              <button
                type="button"
                onClick={() => setActiveModal("voice")}
                className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-transform active:scale-95 cursor-pointer"
              >
                <Mic className="h-7 w-7" />
              </button>
              <span className="text-xs font-medium text-primary mt-1">Voix</span>
            </div>

            {/* Saisir button */}
            <button
              type="button"
              onClick={() => setActiveModal("manual")}
              className="flex flex-col items-center gap-1 py-2 px-3 text-muted transition-colors cursor-pointer"
            >
              <Keyboard className="h-6 w-6" />
              <span className="text-xs font-medium">Saisir</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Modals */}
      <VoiceInput
        isOpen={activeModal === "voice"}
        onClose={() => setActiveModal(null)}
      />
      <ScannerInput
        isOpen={activeModal === "scanner"}
        onClose={() => setActiveModal(null)}
      />
      <ManualInput
        isOpen={activeModal === "manual"}
        onClose={() => setActiveModal(null)}
      />
    </>
  );
}
