'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Locale, translations } from '@labshare/shared'

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  setLocale: () => {},
  t: (k) => k,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    const saved = localStorage.getItem('labshare_locale') as Locale
    if (saved && (saved === 'en' || saved === 'hi')) {
      setLocaleState(saved)
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('labshare_locale', newLocale)
  }

  const t = (key: string, params?: Record<string, string | number>): string => {
    const dict = translations[locale] as Record<string, string>
    const fallbackDict = translations.en as Record<string, string>

    let text = dict[key] || fallbackDict[key] || key

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
      })
    }

    return text
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
