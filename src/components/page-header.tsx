"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { type ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  rightAction?: ReactNode;
  showBack?: boolean;
}

export function PageHeader({ title, rightAction, showBack = true }: PageHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center bg-white px-4 sm:px-6 lg:px-8 border-b border-gray-100">
      {/* Left: back button */}
      <div className="w-10">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Retour"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Center: title */}
      <h1 className="flex-1 text-center font-semibold text-gray-900 truncate">
        {title}
      </h1>

      {/* Right: optional action */}
      <div className="w-10 flex justify-end">
        {rightAction}
      </div>
    </header>
  );
}
