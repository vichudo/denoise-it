"use client";

import { Check, Globe } from "lucide-react";

import { OUTPUT_LANGUAGES } from "@/lib/constants";
import { UI_LOCALES } from "@/i18n";
import { useTranslation } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageToggle() {
  const { language, setLanguage, t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Globe
            className={`h-[1.2rem] w-[1.2rem] transition-opacity ${language === "en" ? "opacity-40" : "opacity-100"}`}
          />
          <span className="sr-only">{t("language.srOnly")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {OUTPUT_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
          >
            <span className="flex w-full items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                {lang.name}
                {!UI_LOCALES.has(lang.code) && (
                  <span className="text-muted-foreground bg-muted rounded px-1 py-0.5 text-[10px] font-medium leading-none">
                    EN UI
                  </span>
                )}
              </span>
              {language === lang.code && <Check className="size-3.5" />}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
