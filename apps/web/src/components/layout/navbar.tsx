'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bell,
  Building2,
  Calendar,
  CheckCircle,
  ChevronDown,
  Compass,
  FileCheck2,
  Layers,
  Menu,
  Moon,
  School,
  Search,
  ShieldAlert,
  Sun,
  UserCheck,
  Users,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/auth-context'
import { useLanguage } from '../../context/language-context'
import { UserRole } from '@labshare/shared'

export function Navbar() {
  const pathname = usePathname()
  const { role, switchRole, user } = useAuth()
  const { locale, setLocale, t } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    if (!isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const roleLabels: Record<UserRole, { en: string; hi: string; color: string }> = {
    TEACHER_SPONSOR: { en: 'Teacher Sponsor (NGO/School)', hi: 'शिक्षक प्रायोजक', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
    MANAGER: { en: 'Lab Manager (Navodaya)', hi: 'लैब प्रभारी', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
    OWNER_SCHOOL: { en: 'School Principal (DPS)', hi: 'स्कूल प्रमुख', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
    ADMIN: { en: 'Platform Admin', hi: 'एडमिन', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Demo Notification Ribbon */}
      <div className="bg-primary-900 text-primary-50 px-4 py-1 text-xs flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="bg-amber-500 text-amber-950 font-bold px-1.5 py-0.5 rounded text-[10px]">DEMO MODE</span>
          <span>
            {locale === 'en'
              ? 'Bundelkhand Pilot: JNV Barwa Sagar, DPS Jhansi, 5 Community Schools'
              : 'बुंदेलखंड पायलट: जेएनवी बरुआ सागर, डीपीएस झांसी एवं 5 ग्रामीण विद्यालय'}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="hidden sm:inline text-primary-200">
            {locale === 'en' ? 'Active Role:' : 'सक्रिय भूमिका:'}
          </span>
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center space-x-1 font-semibold text-amber-300 hover:text-white"
            >
              <span>{roleLabels[role]?.[locale]}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {roleDropdownOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-card border rounded-md shadow-lg py-1 z-50 text-foreground">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground border-b">
                  Switch Role / भूमिका बदलें
                </div>
                {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      switchRole(r)
                      setRoleDropdownOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-muted flex items-center justify-between ${
                      role === r ? 'font-bold text-primary' : ''
                    }`}
                  >
                    <span>{roleLabels[r][locale]}</span>
                    {role === r && <CheckCircle className="w-3.5 h-3.5 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-700 flex items-center justify-center text-white shadow-sm font-bold text-xl">
            LS
          </div>
          <div>
            <div className="font-extrabold text-lg tracking-tight flex items-center space-x-1.5 text-foreground">
              <span>LabShare</span>
              <span className="text-xs font-normal text-muted-foreground">|</span>
              <span className="text-sm font-bold text-primary">लैबशेयर</span>
            </div>
            <div className="text-[10px] text-muted-foreground">
              {locale === 'en' ? 'Rural School & Lab Network' : 'ग्रामीण विद्यालय एवं प्रयोगशाला नेटवर्क'}
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
          <Link
            href="/labs"
            className={`px-3 py-2 rounded-md transition-colors hover:bg-muted ${
              pathname === '/labs' ? 'text-primary font-bold bg-muted/60' : 'text-foreground/80'
            }`}
          >
            {t('nav.labs')}
          </Link>

          {role === 'TEACHER_SPONSOR' && (
            <Link
              href="/bookings"
              className={`px-3 py-2 rounded-md transition-colors hover:bg-muted ${
                pathname === '/bookings' ? 'text-primary font-bold bg-muted/60' : 'text-foreground/80'
              }`}
            >
              {t('nav.bookings')}
            </Link>
          )}

          {role === 'MANAGER' && (
            <>
              <Link
                href="/manager/inbox"
                className={`px-3 py-2 rounded-md transition-colors hover:bg-muted relative ${
                  pathname === '/manager/inbox' ? 'text-primary font-bold bg-muted/60' : 'text-foreground/80'
                }`}
              >
                <span>{locale === 'en' ? 'Request Inbox' : 'अनुरोध इनबॉक्स'}</span>
                <span className="ml-1.5 px-1.5 py-0.2 bg-amber-500 text-amber-950 font-bold text-[10px] rounded-full">
                  1
                </span>
              </Link>
              <Link
                href="/manager/schedule"
                className={`px-3 py-2 rounded-md transition-colors hover:bg-muted ${
                  pathname === '/manager/schedule' ? 'text-primary font-bold bg-muted/60' : 'text-foreground/80'
                }`}
              >
                {locale === 'en' ? "Today's Check-in" : 'आज का चेक-इन'}
              </Link>
            </>
          )}

          {role === 'OWNER_SCHOOL' && (
            <Link
              href="/owner/labs"
              className={`px-3 py-2 rounded-md transition-colors hover:bg-muted ${
                pathname === '/owner/labs' ? 'text-primary font-bold bg-muted/60' : 'text-foreground/80'
              }`}
            >
              {locale === 'en' ? 'My Labs & Rules' : 'मेरी लैब एवं नियम'}
            </Link>
          )}

          {role === 'ADMIN' && (
            <>
              <Link
                href="/admin/audit"
                className={`px-3 py-2 rounded-md transition-colors hover:bg-muted ${
                  pathname === '/admin/audit' ? 'text-primary font-bold bg-muted/60' : 'text-foreground/80'
                }`}
              >
                {locale === 'en' ? 'Audit Chain' : 'ऑडिट लेजर'}
              </Link>
              <Link
                href="/admin/verification"
                className={`px-3 py-2 rounded-md transition-colors hover:bg-muted ${
                  pathname === '/admin/verification' ? 'text-primary font-bold bg-muted/60' : 'text-foreground/80'
                }`}
              >
                {locale === 'en' ? 'Verification' : 'संस्था सत्यापन'}
              </Link>
              <Link
                href="/admin/disputes"
                className={`px-3 py-2 rounded-md transition-colors hover:bg-muted ${
                  pathname === '/admin/disputes' ? 'text-primary font-bold bg-muted/60' : 'text-foreground/80'
                }`}
              >
                {locale === 'en' ? 'Disputes' : 'विवाद ट्रिब्यूनल'}
              </Link>
            </>
          )}

          <Link
            href="/impact"
            className={`px-3 py-2 rounded-md transition-colors hover:bg-muted ${
              pathname === '/impact' ? 'text-primary font-bold bg-muted/60' : 'text-foreground/80'
            }`}
          >
            {locale === 'en' ? 'Impact' : 'प्रभाव'}
          </Link>
        </nav>

        {/* Right Action Icons: Language Toggle, Theme, Role Badge */}
        <div className="flex items-center space-x-2.5">
          {/* Language Toggle */}
          <button
            onClick={() => setLocale(locale === 'en' ? 'hi' : 'en')}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-md border border-input bg-background hover:bg-muted text-foreground transition-colors"
            title="Toggle English / हिंदी"
          >
            <span className={locale === 'hi' ? 'text-primary font-bold' : ''}>हिंदी</span>
            <span>/</span>
            <span className={locale === 'en' ? 'text-primary font-bold' : ''}>EN</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md border border-input hover:bg-muted text-foreground"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Current Role Badge */}
          <div className="hidden lg:flex items-center space-x-2">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${roleLabels[role]?.color}`}
            >
              {roleLabels[role]?.[locale]}
            </span>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-muted"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-card px-4 py-3 space-y-2">
          <Link
            href="/labs"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium hover:text-primary"
          >
            {t('nav.labs')}
          </Link>
          <Link
            href="/bookings"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium hover:text-primary"
          >
            {t('nav.bookings')}
          </Link>
          <Link
            href="/manager/inbox"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium hover:text-primary"
          >
            {locale === 'en' ? 'Manager Inbox' : 'प्रबंधक इनबॉक्स'}
          </Link>
          <Link
            href="/impact"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium hover:text-primary"
          >
            {locale === 'en' ? 'Impact Dashboard' : 'प्रभाव डैशबोर्ड'}
          </Link>
        </div>
      )}
    </header>
  )
}
