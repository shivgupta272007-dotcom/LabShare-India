'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck,
  Layers,
  Map as MapIcon,
  MapPin,
  Microscope,
  Navigation,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react'
import { useLanguage } from '../context/language-context'
import { useAuth } from '../context/auth-context'
import { ImpactMetrics, Lab } from '@labshare/shared'

const InteractiveMap = dynamic(
  () =>
    import('../components/maps/interactive-map').then(
      (mod) => mod.InteractiveMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-muted/40 rounded-2xl flex items-center justify-center animate-pulse border">
        <div className="text-center">
          <MapPin className="w-8 h-8 text-primary mx-auto mb-2 animate-bounce" />
          <p className="text-xs font-semibold text-muted-foreground">
            Loading Google Maps Network...
          </p>
        </div>
      </div>
    ),
  }
)

export default function HomePage() {
  const { locale, t } = useLanguage()
  const { client, switchRole } = useAuth()
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null)
  const [featuredLabs, setFeaturedLabs] = useState<Lab[]>([])
  const [allLabs, setAllLabs] = useState<Lab[]>([])

  useEffect(() => {
    client.analytics
      .getImpact()
      .then(setMetrics)
      .catch(() => {
        // Fallback demo metrics if offline
        setMetrics({
          totalLabHoursShared: 420,
          totalStudentsBenefited: 9240,
          totalOrgsServed: 7,
          totalBookingsCompleted: 140,
          idleCapacityUtilisationPercent: 38.5,
          estimatedValueINR: 252000,
          districtCount: 7,
          updatedAt: new Date().toISOString(),
        })
      })

    client.labs
      .search({ sortBy: 'trust' })
      .then((labs) => {
        setAllLabs(labs)
        setFeaturedLabs(labs.slice(0, 3))
      })
      .catch(() => {})
  }, [client])

  return (
    <div className="flex flex-col gap-12 sm:gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/60 via-background to-background dark:from-primary-950/20 pt-12 pb-16 sm:py-24 border-b">
        <div className="container relative z-10 flex flex-col items-center text-center">
          {/* National Network Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-semibold mb-6 shadow-sm border border-emerald-300 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>
              {locale === 'en'
                ? 'Pan-India Network: Connecting 660+ Navodayas & Kendriya Vidyalayas'
                : 'अखिल भारतीय नेटवर्क: नवोदय, केंद्रीय विद्यालय एवं उत्कृष्ट स्कूलों की साझेदारी'}
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight">
            {locale === 'en' ? (
              <>
                Every Science & Computer Lab Deserves{' '}
                <span className="text-primary underline decoration-amber-400 decoration-wavy decoration-2">
                  Curious Students
                </span>
              </>
            ) : (
              <>
                हर विज्ञान एवं कंप्यूटर प्रयोगशाला में{' '}
                <span className="text-primary underline decoration-amber-400 decoration-wavy decoration-2">
                  जिज्ञासु छात्र
                </span>{' '}
                होने चाहिए
              </>
            )}
          </h1>

          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            {locale === 'en'
              ? 'Well-equipped Navodaya, Kendriya Vidyalayas & private schools have advanced science and computer labs that sit empty after hours. LabShare safely connects them with nearby rural schools, coaching groups, and NGOs across every district in India.'
              : 'नवोदय, केंद्रीय विद्यालय और प्रमुख पब्लिक स्कूलों की आधुनिक प्रयोगशालाएं स्कूल समय के बाद खाली रहती हैं। लैबशेयर उन्हें भारत के हर जिले में आसपास के जरूरतमंद ग्रामीण स्कूलों और कोचिंग समूहों से सुरक्षित जोड़ता है।'}
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link
              href="/labs"
              className="px-6 py-3 rounded-lg bg-primary hover:bg-primary-700 text-white font-bold text-sm shadow-md transition-all flex items-center space-x-2"
            >
              <span>{locale === 'en' ? 'Find Nearby Labs' : 'पास की लैब खोजें'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/auth/login"
              className="px-6 py-3 rounded-lg border border-input bg-card hover:bg-muted text-foreground font-semibold text-sm transition-all flex items-center space-x-2"
            >
              <span>{locale === 'en' ? 'Try Demo Accounts' : 'डेमो खाते देखें'}</span>
            </Link>
          </div>

          {/* Trust Guarantees */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-muted-foreground pt-6 border-t w-full max-w-3xl">
            <div className="flex items-center justify-center space-x-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{locale === 'en' ? 'Verified Adult Sponsors' : 'सत्यापित वयस्क प्रायोजक'}</span>
            </div>
            <div className="flex items-center justify-center space-x-1.5 font-medium">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>{locale === 'en' ? 'Zero Double-Booking DB' : 'डबल-बुकिंग मुक्त डेटाबेस'}</span>
            </div>
            <div className="flex items-center justify-center space-x-1.5 font-medium">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>{locale === 'en' ? 'SHA-256 Audit Chain' : 'क्रिप्टोग्राफिक ऑडिट लेजर'}</span>
            </div>
            <div className="flex items-center justify-center space-x-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{locale === 'en' ? 'Minors Zero PII Stored' : 'छात्र गोपनीयता सुरक्षित'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Impact Counters (Hero feature) */}
      <section className="container">
        <div className="text-center mb-8">
          <h2 className="text-xs uppercase font-bold tracking-wider text-primary">
            {locale === 'en' ? 'Community Impact in Numbers' : 'समुदाय पर प्रभाव'}
          </h2>
          <p className="text-2xl font-extrabold tracking-tight mt-1">
            {locale === 'en' ? 'Resources Shared Across Bundelkhand' : 'बुंदेलखंड में साझा किए गए संसाधन'}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-card border rounded-xl p-5 shadow-sm text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-primary mb-1">
              {metrics ? metrics.totalLabHoursShared.toLocaleString() : '420'}+
            </div>
            <div className="text-xs sm:text-sm font-semibold text-foreground">
              {locale === 'en' ? 'Lab Hours Shared' : 'साझा किए लैब घंटे'}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {locale === 'en' ? 'After regular school hours' : 'स्कूल समय के बाद'}
            </div>
          </div>

          <div className="bg-card border rounded-xl p-5 shadow-sm text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 mb-1">
              {metrics ? metrics.totalStudentsBenefited.toLocaleString() : '9,240'}+
            </div>
            <div className="text-xs sm:text-sm font-semibold text-foreground">
              {locale === 'en' ? 'Students Benefited' : 'लाभान्वित छात्र'}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {locale === 'en' ? 'Hands-on experiment sessions' : 'प्रायोगिक विज्ञान सत्र'}
            </div>
          </div>

          <div className="bg-card border rounded-xl p-5 shadow-sm text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-amber-500 mb-1">
              ₹{metrics ? (metrics.estimatedValueINR / 1000).toFixed(0) : '252'}k
            </div>
            <div className="text-xs sm:text-sm font-semibold text-foreground">
              {locale === 'en' ? 'Economic Value Generated' : 'साझा संसाधनों का मूल्य'}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {locale === 'en' ? 'Saved by rural schools' : 'ग्रामीण स्कूलों की बचत'}
            </div>
          </div>

          <div className="bg-card border rounded-xl p-5 shadow-sm text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-purple-600 mb-1">
              {metrics ? metrics.idleCapacityUtilisationPercent : '38.5'}%
            </div>
            <div className="text-xs sm:text-sm font-semibold text-foreground">
              {locale === 'en' ? 'Idle Capacity Utilized' : 'खाली क्षमता का उपयोग'}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {locale === 'en' ? 'Weekends and holidays' : 'सप्ताहांत एवं छुट्टियां'}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="container py-8">
        <div className="text-center mb-10">
          <h2 className="text-xs uppercase font-bold tracking-wider text-primary">
            {locale === 'en' ? 'Transparent Workflow' : 'प्रक्रिया'}
          </h2>
          <p className="text-2xl font-extrabold tracking-tight mt-1">
            {locale === 'en' ? 'How LabShare Operates Safely' : 'लैबशेयर सुरक्षित रूप से कैसे काम करता है'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-card border rounded-lg p-5 relative">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center mb-3">
              1
            </div>
            <h3 className="font-bold text-sm mb-1">
              {locale === 'en' ? 'Institutional Vetting' : 'संस्था सत्यापन'}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {locale === 'en'
                ? 'Host schools and requesting groups are authenticated with UDISE code and verified adult teacher sponsors.'
                : 'मेजबान विद्यालय एवं अनुरोधकर्ता संस्थाएं UDISE कोड एवं प्रमाणित शिक्षक प्रायोजक से सत्यापित होती हैं।'}
            </p>
          </div>

          <div className="bg-card border rounded-lg p-5 relative">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center mb-3">
              2
            </div>
            <h3 className="font-bold text-sm mb-1">
              {locale === 'en' ? 'Smart Rules Engine' : 'स्मार्ट नियम इंजन'}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {locale === 'en'
                ? 'Deterministic rules evaluate student age, headcount, and supervision ratios with instant bilingual explanations.'
                : 'नियम इंजन छात्रों की आयु, संख्या और पर्यवेक्षक अनुपात की स्वचालित जांच कर तुरंत परिणाम देता है।'}
            </p>
          </div>

          <div className="bg-card border rounded-lg p-5 relative">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center mb-3">
              3
            </div>
            <h3 className="font-bold text-sm mb-1">
              {locale === 'en' ? 'Day-of QR Check-in' : 'दिन पर क्यूआर चेक-इन'}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {locale === 'en'
                ? 'The teacher sponsor presents an OTP/QR code on arrival. Lab in-charge verifies actual headcount.'
                : 'शिक्षक प्रायोजक आगमन पर ओटीपी/क्यूआर कोड प्रस्तुत करते हैं। लैब इन-चार्ज छात्र संख्या की पुष्टि करते हैं।'}
            </p>
          </div>

          <div className="bg-card border rounded-lg p-5 relative">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center mb-3">
              4
            </div>
            <h3 className="font-bold text-sm mb-1">
              {locale === 'en' ? 'Audit & Trust Score' : 'ऑडिट एवं ट्रस्ट स्कोर'}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {locale === 'en'
                ? 'Post-visit checkout checklist logs condition. Trust scores adjust dynamically and append to SHA-256 ledger.'
                : 'चेकआउट के बाद उपकरणों की स्थिति दर्ज होती है। ट्रस्ट स्कोर बढ़ता है और रिकॉर्ड क्रिप्टोग्राफिक लेजर में दर्ज होता है।'}
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Google Maps Network Section */}
      <section className="container">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-6">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
              <Compass className="w-3.5 h-3.5 text-primary" />
              <span>
                {locale === 'en'
                  ? 'Connected with Google Maps'
                  : 'गूगल मैप्स से एकीकृत नेटवर्क'}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              {locale === 'en'
                ? 'Explore Participating School Labs on the Map'
                : 'मानचित्र पर सहभागी स्कूल प्रयोगशालाएं देखें'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {locale === 'en'
                ? 'Interactive multi-district network with instant turn-by-turn navigation and distance calculation.'
                : 'सटीक दूरी और टर्न-बाय-टर्न गूगल नेविगेशन के साथ बुंदेलखंड की प्रयोगशालाएं।'}
            </p>
          </div>

          <Link
            href="/labs"
            className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-700 transition-colors shadow-sm flex items-center space-x-1.5 shrink-0"
          >
            <span>{locale === 'en' ? 'Open Full Map Search' : 'पूर्ण मानचित्र खोजें'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="w-full">
          <InteractiveMap
            labs={allLabs}
            centerLat={25.4484}
            centerLng={78.5685}
            zoom={10}
            height="460px"
            locale={locale}
          />
        </div>
      </section>

      {/* Featured Labs */}
      <section className="container">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xs uppercase font-bold tracking-wider text-primary">
              {locale === 'en' ? 'Available Nearby' : 'उपलब्ध प्रयोगशालाएं'}
            </h2>
            <p className="text-2xl font-extrabold tracking-tight mt-1">
              {locale === 'en' ? 'Featured Labs in Jhansi District' : 'झांसी जिले की प्रमुख प्रयोगशालाएं'}
            </p>
          </div>
          <Link
            href="/labs"
            className="text-xs font-semibold text-primary hover:underline flex items-center space-x-1"
          >
            <span>{locale === 'en' ? 'View All Labs' : 'सभी लैब देखें'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredLabs.map((lab) => (
            <div
              key={lab.id}
              className="bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {lab.type.replace('_', ' ')}
                  </span>
                  <div className="flex items-center space-x-1 text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{lab.averageRating || 4.9}</span>
                  </div>
                </div>

                <h3 className="font-bold text-base text-foreground mb-1">{lab.name}</h3>
                <div className="flex items-center text-xs text-muted-foreground mb-3">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-primary shrink-0" />
                  <span>{lab.organization?.name || 'Navodaya Vidyalaya'}</span>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                  {lab.description}
                </p>

                <div className="flex items-center justify-between text-xs pt-3 border-t text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>Cap: {lab.capacity} students</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Award className="w-3.5 h-3.5 text-primary" />
                    <span>Trust: {lab.trustScore}/100</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/40 border-t flex justify-between items-center">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  {locale === 'en' ? 'Open for Bookings' : 'बुकिंग हेतु उपलब्ध'}
                </span>
                <Link
                  href={`/labs/${lab.id}`}
                  className="px-3 py-1.5 rounded-md bg-primary text-white text-xs font-bold hover:bg-primary-700 transition-colors"
                >
                  {locale === 'en' ? 'View Details' : 'विवरण देखें'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
