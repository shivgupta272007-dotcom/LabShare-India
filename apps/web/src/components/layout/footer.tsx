'use client'

import React from 'react'
import Link from 'next/link'
import { Shield, Sparkles, Heart } from 'lucide-react'
import { useLanguage } from '../../context/language-context'

export function Footer() {
  const { locale } = useLanguage()

  return (
    <footer className="border-t bg-card text-card-foreground mt-auto">
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white font-bold text-sm">
                LS
              </div>
              <span className="font-extrabold text-base">LabShare | लैबशेयर</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {locale === 'en'
                ? 'Empowering rural schools and underfunded coaching groups with idle science and technology labs after hours. Safe, audited, and transparent.'
                : 'खाली पड़ी विज्ञान और तकनीकी प्रयोगशालाओं को जरूरतमंद ग्रामीण स्कूलों से जोड़ना। सुरक्षित, पारदर्शी और सत्यापित।'}
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              <Shield className="w-4 h-4" />
              <span>
                {locale === 'en' ? 'Child Safety & Minimal PII Compliant' : 'बाल सुरक्षा एवं शून्य निजी डेटा भंडारित'}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {locale === 'en' ? 'Platform' : 'प्लेटफ़ॉर्म'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/labs" className="hover:text-primary">
                  {locale === 'en' ? 'Find Labs' : 'लैब खोजें'}
                </Link>
              </li>
              <li>
                <Link href="/impact" className="hover:text-primary">
                  {locale === 'en' ? 'Impact & Metrics' : 'प्रभाव एवं आंकड़े'}
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-primary">
                  {locale === 'en' ? 'Demo Accounts' : 'डेमो खाते'}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {locale === 'en' ? 'Governance' : 'पारदर्शिता एवं ऑडिट'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/admin/audit" className="hover:text-primary">
                  {locale === 'en' ? 'Immutable Audit Ledger' : 'अपरिवर्तनीय ऑडिट लेजर'}
                </Link>
              </li>
              <li>
                <Link href="/admin/verification" className="hover:text-primary">
                  {locale === 'en' ? 'UDISE Accreditation' : 'UDISE मान्यता प्रक्रिया'}
                </Link>
              </li>
              <li>
                <Link href="/admin/disputes" className="hover:text-primary">
                  {locale === 'en' ? 'Dispute Tribunal' : 'विवाद समाधान मंच'}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {locale === 'en' ? 'Bundelkhand Pilot' : 'बुंदेलखंड पायलट'}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {locale === 'en'
                ? 'Covers 7 districts: Jhansi, Lalitpur, Jalaun, Hamirpur, Mahoba, Banda, and Chitrakoot. Operating with Navodaya Vidyalaya Barwa Sagar and DPS Jhansi.'
                : '7 जिलों में संचालित: झांसी, ललितपुर, जालौन, हमीरपुर, महोबा, बांदा, चित्रकूट।'}
            </p>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} LabShare. Built for rural science education access.</p>
          <p className="mt-2 sm:mt-0 flex items-center space-x-1">
            <span>Designed with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>for rural students of India</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
