import React from 'react'
import type { Metadata, Viewport } from 'next'
import '../styles/globals.css'
import { LanguageProvider } from '../context/language-context'
import { AuthProvider } from '../context/auth-context'
import { Navbar } from '../components/layout/navbar'
import { Footer } from '../components/layout/footer'

export const metadata: Metadata = {
  title: 'LabShare | Rural School & Community Lab Network',
  description:
    'Connecting idle school labs with rural schools and community groups in Bundelkhand. Safe, verified, transparent, and bilingual.',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#0f766e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <LanguageProvider>
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
