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
      {/* Top Pan-India National Network Ribbon */}
      <div className="bg-slate-900 text-slate-100 px-4 py-1 text-xs flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="bg-emerald-600 text-white font-bold px-2 py-0.5 rounded text-[10px] tracking-wider uppercase shadow-sm">
            PAN-INDIA
          </span>
          <span className="text-slate-300 hidden sm:inline">
            {locale === 'en'
              ? 'National School & Community Lab Network – Active Across All 28 States & UTs'
              : 'राष्ट्रीय विद्यालय एवं सामुदायिक प्रयोगशाला नेटवर्क – 28 राज्यों में सक्रिय'}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="hidden sm:inline text-slate-400">
            {locale === 'en' ? 'Logged In Role:' : 'सक्रिय भूमिका:'}
          </span>
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center space-x-1 font-semibold text-emerald-400 hover:text-white"
            >
              <span>{roleLabels[role]?.[locale]}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {roleDropdownOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-card border rounded-md shadow-lg py-1 z-50 text-foreground">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground border-b">
                  Switch Active Role / भूमिका बदलें
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
        {/* Official Brand Logo */}
        <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group shrink-0">
          <div className="bg-white rounded-xl px-2 sm:px-2.5 py-1 shadow-xs border border-slate-200/90 flex items-center justify-center transition-all group-hover:shadow-md group-hover:scale-[1.02]">
            <img
              src="/logo.png"
              alt="LabShare India | लैबशेयर इंडिया - हर लैब, हर बच्चे के लिए"
              className="h-8 sm:h-10 md:h-11 w-auto object-contain"
            />
          </div>
        </Link>

        {/* Desktop Navigation Links (Responsive Tablet md -> Laptop lg) */}
        <nav className="hidden md:flex items-center space-x-0.5 lg:space-x-1 text-xs lg:text-sm font-medium">
          <Link
            href="/labs"
            className={`px-2 lg:px-3 py-1.5 lg:py-2 rounded-md transition-colors hover:bg-muted ${
              pathname === '/labs' ? 'text-primary font-bold bg-muted/60' : 'text-foreground/80'
            }`}
          >
            {t('nav.labs')}
          </Link>

          {role === 'TEACHER_SPONSOR' && (
            <Link
              href="/bookings"
              className={`px-2 lg:px-3 py-1.5 lg:py-2 rounded-md transition-colors hover:bg-muted ${
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
                className={`px-2 lg:px-3 py-1.5 lg:py-2 rounded-md transition-colors hover:bg-muted relative ${
                  pathname === '/manager/inbox' ? 'text-primary font-bold bg-muted/60' : 'text-foreground/80'
                }`}
              >
                <span>{locale === 'en' ? 'Inbox' : 'इनबॉक्स'}</span>
                <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-amber-950 font-bold text-[10px] rounded-full">
                  1
                </span>
              </Link>
              <Link
                href="/manager/schedule"
                className={`px-2 lg:px-3 py-1.5 lg:py-2 rounded-md transition-colors hover:bg-muted ${
                  pathname === '/manager/schedule' ? 'text-primary font-bold bg-muted/60' : 'text-foreground/80'
                }`}
              >
                {locale === 'en' ? "Today's Ops" : 'आज का चेक-इन'}
              </Link>
            </>
          )}

          {role === 'OWNER_SCHOOL' && (
            <Link
              href="/owner/labs"
              className={`px-2 lg:px-3 py-1.5 lg:py-2 rounded-md transition-colors hover:bg-muted ${
                pathname === '/owner/labs' ? 'text-primary font-bold bg-muted/60' : 'text-foreground/80'
              }`}
            >
              {locale === 'en' ? 'Labs & Rules' : 'लैब एवं नियम'}
            </Link>
          )}

          {role === 'ADMIN' && (
            <>
              <Link
                href="/admin/audit"
                className={`px-2 lg:px-3 py-1.5 lg:py-2 rounded-md transition-colors hover:bg-muted ${
                  pathname === '/admin/audit' ? 'text-primary font-bold bg-muted/60' : 'text-foreground/80'
                }`}
              >
                {locale === 'en' ? 'Audit' : 'ऑडिट'}
              </Link>
              <Link
                href="/admin/verification"
                className={`px-2 lg:px-3 py-1.5 lg:py-2 rounded-md transition-colors hover:bg-muted ${
                  pathname === '/admin/verification' ? 'text-primary font-bold bg-muted/60' : 'text-foreground/80'
                }`}
              >
                {locale === 'en' ? 'Verify' : 'सत्यापन'}
              </Link>
              <Link
                href="/admin/disputes"
                className={`px-2 lg:px-3 py-1.5 lg:py-2 rounded-md transition-colors hover:bg-muted ${
                  pathname === '/admin/disputes' ? 'text-primary font-bold bg-muted/60' : 'text-foreground/80'
                }`}
              >
                {locale === 'en' ? 'Disputes' : 'विवाद'}
              </Link>
            </>
          )}

          <Link
            href="/impact"
            className={`px-2 lg:px-3 py-1.5 lg:py-2 rounded-md transition-colors hover:bg-muted ${
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

      {/* Mobile Drawer (Touch-Optimized for Phones & Tablets) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-card/98 backdrop-blur-lg px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200 shadow-xl">
          {/* Active Persona Banner on Mobile */}
          <div className="p-2.5 rounded-xl bg-muted/60 border flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">
              {locale === 'en' ? 'Active Persona:' : 'सक्रिय भूमिका:'}
            </span>
            <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${roleLabels[role]?.color}`}>
              {roleLabels[role]?.[locale]}
            </span>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <Link
              href="/labs"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                pathname === '/labs' ? 'bg-primary text-white' : 'hover:bg-muted text-foreground'
              }`}
            >
              {t('nav.labs')}
            </Link>

            {role === 'TEACHER_SPONSOR' && (
              <Link
                href="/bookings"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  pathname === '/bookings' ? 'bg-primary text-white' : 'hover:bg-muted text-foreground'
                }`}
              >
                {t('nav.bookings')}
              </Link>
            )}

            {role === 'MANAGER' && (
              <>
                <Link
                  href="/manager/inbox"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    pathname === '/manager/inbox' ? 'bg-primary text-white' : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <span>{locale === 'en' ? 'Request Inbox' : 'अनुरोध इनबॉक्स'}</span>
                  <span className="px-2 py-0.5 bg-amber-500 text-amber-950 font-bold text-xs rounded-full">
                    1 Pending
                  </span>
                </Link>
                <Link
                  href="/manager/schedule"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    pathname === '/manager/schedule' ? 'bg-primary text-white' : 'hover:bg-muted text-foreground'
                  }`}
                >
                  {locale === 'en' ? "Today's Check-in Console" : 'आज का चेक-इन कंसोल'}
                </Link>
              </>
            )}

            {role === 'OWNER_SCHOOL' && (
              <Link
                href="/owner/labs"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  pathname === '/owner/labs' ? 'bg-primary text-white' : 'hover:bg-muted text-foreground'
                }`}
              >
                {locale === 'en' ? 'My Labs & Sharing Rules' : 'मेरी लैब एवं साझा नियम'}
              </Link>
            )}

            {role === 'ADMIN' && (
              <>
                <Link
                  href="/admin/audit"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    pathname === '/admin/audit' ? 'bg-primary text-white' : 'hover:bg-muted text-foreground'
                  }`}
                >
                  {locale === 'en' ? 'Cryptographic Audit Chain' : 'ऑडिट लेजर'}
                </Link>
                <Link
                  href="/admin/verification"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    pathname === '/admin/verification' ? 'bg-primary text-white' : 'hover:bg-muted text-foreground'
                  }`}
                >
                  {locale === 'en' ? 'Institution Verification Queue' : 'संस्था सत्यापन सूची'}
                </Link>
                <Link
                  href="/admin/disputes"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    pathname === '/admin/disputes' ? 'bg-primary text-white' : 'hover:bg-muted text-foreground'
                  }`}
                >
                  {locale === 'en' ? 'Dispute Tribunal' : 'विवाद ट्रिब्यूनल'}
                </Link>
              </>
            )}

            <Link
              href="/impact"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                pathname === '/impact' ? 'bg-primary text-white' : 'hover:bg-muted text-foreground'
              }`}
            >
              {locale === 'en' ? 'Impact & Telemetry' : 'प्रभाव एवं आंकड़े'}
            </Link>
          </div>

          {/* Quick Mobile Role Switcher */}
          <div className="pt-2 border-t">
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
              {locale === 'en' ? 'Quick Switch Role:' : 'भूमिका बदलें:'}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r)
                    setMobileMenuOpen(false)
                  }}
                  className={`p-2 rounded-lg text-left text-xs font-semibold border transition-all ${
                    role === r
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                      : 'border-border bg-card hover:bg-muted text-muted-foreground'
                  }`}
                >
                  {roleLabels[r][locale]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
