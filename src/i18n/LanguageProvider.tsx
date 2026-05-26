import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { languages, translations, type Language, type TranslationDict } from "./translations"

const STORAGE_KEY = "receipt-maker:language"
const DEFAULT_LANGUAGE: Language = "fa"

type LanguageContextValue = {
  language: Language
  setLanguage: (lang: Language) => void
  t: TranslationDict
  dir: "ltr" | "rtl"
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === "en" || stored === "fa" || stored === "ar") return stored
  return DEFAULT_LANGUAGE
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage)

  useEffect(() => {
    const meta = languages.find((l) => l.code === language)!
    document.documentElement.lang = language
    document.documentElement.dir = meta.dir
    window.localStorage.setItem(STORAGE_KEY, language)
  }, [language])

  const value: LanguageContextValue = {
    language,
    setLanguage: setLanguageState,
    t: translations[language],
    dir: languages.find((l) => l.code === language)!.dir,
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider")
  return ctx
}

export function useT() {
  return useLanguage().t
}
