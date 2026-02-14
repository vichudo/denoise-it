"use client";

import { Check, Globe } from "lucide-react";

import { OUTPUT_LANGUAGES } from "@/lib/constants";
import { useOutputLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageToggle() {
  const { language, setLanguage } = useOutputLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Globe
            className={`h-[1.2rem] w-[1.2rem] transition-opacity ${language === "en" ? "opacity-40" : "opacity-100"}`}
          />
          <span className="sr-only">Output language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {OUTPUT_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
          >
            <span className="flex w-full items-center justify-between gap-2">
              {lang.name}
              {language === lang.code && <Check className="size-3.5" />}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
