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
import { AnimatedCounter } from '../components/ui/animated-counter'
import { getDefaultLabPhotos } from '../components/labs/photo-gallery'

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
      {/* Hero Section with Split Visuals & Animations */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/70 via-background to-background dark:from-primary-950/20 pt-10 pb-16 sm:py-20 border-b">
        <div className="container relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Mission, Headline & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
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
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight leading-tight">
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

            <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed">
              {locale === 'en'
                ? 'Well-equipped Navodaya, Kendriya Vidyalayas & private schools have advanced science and computer labs that sit empty after hours. LabShare safely connects them with nearby rural schools, coaching groups, and NGOs across every city and district in India.'
                : 'नवोदय, केंद्रीय विद्यालय और प्रमुख पब्लिक स्कूलों की आधुनिक प्रयोगशालाएं स्कूल समय के बाद खाली रहती हैं। लैबशेयर उन्हें भारत के हर शहर और जिले में आसपास के जरूरतमंद ग्रामीण स्कूलों और कोचिंग समूहों से सुरक्षित जोड़ता है।'}
            </p>

            {/* CTA Buttons */}
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/labs"
                className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-700 text-white font-bold text-sm shadow-md transition-all flex items-center space-x-2 hover:scale-102"
              >
                <span>{locale === 'en' ? 'Find Labs in Any City' : 'किसी भी शहर में लैब खोजें'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/auth/login"
                className="px-6 py-3 rounded-xl border border-input bg-card hover:bg-muted text-foreground font-semibold text-sm transition-all flex items-center space-x-2"
              >
                <span>{locale === 'en' ? 'Institutional Sign In' : 'संस्थागत साइन इन'}</span>
              </Link>
            </div>

            {/* Trust Guarantees */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-muted-foreground pt-5 border-t w-full">
              <div className="flex items-center space-x-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified Sponsors</span>
              </div>
              <div className="flex items-center space-x-1.5 font-medium">
                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero Double-Booking</span>
              </div>
              <div className="flex items-center space-x-1.5 font-medium">
                <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>SHA-256 Ledger</span>
              </div>
              <div className="flex items-center space-x-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Minors Zero PII</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Laboratory Showcase Card with Floating Badges */}
          <div className="lg:col-span-5 relative w-full flex items-center justify-center">
            <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-border group bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80"
                alt="Students in Science Laboratory"
                className="w-full h-[360px] sm:h-[420px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/20 pointer-events-none" />

              {/* Bottom Caption */}
              <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary text-white mb-1.5 inline-block">
                  Atal Tinkering & Composite Science
                </span>
                <p className="font-bold text-sm sm:text-base leading-snug drop-shadow-md">
                  Hands-On STEM & Robotics Lab
                </p>
                <p className="text-xs text-slate-300 drop-shadow-sm flex items-center space-x-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-primary-400" />
                  <span>Jawahar Navodaya Vidyalaya Campus Network</span>
                </p>
              </div>

              {/* Floating Badge 1 (Top Left): Verified Adults */}
              <div className="absolute -top-3 -left-3 z-20 animate-float bg-card/95 backdrop-blur-md border border-border rounded-xl px-3 py-2 shadow-lg flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground font-semibold">Teacher Vouched</div>
                  <div className="text-xs font-bold text-foreground">100% Supervised</div>
                </div>
              </div>

              {/* Floating Badge 2 (Top Right): Google Maps */}
              <div className="absolute -top-3 -right-3 z-20 animate-float-slow bg-card/95 backdrop-blur-md border border-border rounded-xl px-3 py-2 shadow-lg flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground font-semibold">Navigation</div>
                  <div className="text-xs font-bold text-foreground">Google Maps GPS</div>
                </div>
              </div>

              {/* Floating Badge 3 (Bottom Right): Trust Score */}
              <div className="absolute bottom-16 -right-3 z-20 animate-float bg-card/95 backdrop-blur-md border border-border rounded-xl px-3 py-2 shadow-lg flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground font-semibold">Verified Trust</div>
                  <div className="text-xs font-bold text-foreground">98/100 Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Impact Counters (Hero feature with Animated Numbers) */}
      <section className="container">
        <div className="text-center mb-8">
          <h2 className="text-xs uppercase font-bold tracking-wider text-primary">
            {locale === 'en' ? 'National Impact Metrics' : 'अखिल भारतीय प्रभाव'}
          </h2>
          <p className="text-2xl font-extrabold tracking-tight mt-1">
            {locale === 'en'
              ? 'Educational Resources Shared Across India'
              : 'भारत भर में साझा किए गए प्रयोगशाला संसाधन'}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-card border rounded-2xl p-5 shadow-sm text-center hover:shadow-md transition-shadow">
            <div className="text-3xl sm:text-4xl font-extrabold text-primary mb-1">
              <AnimatedCounter
                value={metrics ? metrics.totalLabHoursShared : 552}
                suffix="+"
              />
            </div>
            <div className="text-xs sm:text-sm font-semibold text-foreground">
              {locale === 'en' ? 'Lab Hours Shared' : 'साझा किए लैब घंटे'}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {locale === 'en' ? 'After regular school hours' : 'स्कूल समय के बाद'}
            </div>
          </div>

          <div className="bg-card border rounded-2xl p-5 shadow-sm text-center hover:shadow-md transition-shadow">
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 mb-1">
              <AnimatedCounter
                value={metrics ? metrics.totalStudentsBenefited : 12144}
                suffix="+"
              />
            </div>
            <div className="text-xs sm:text-sm font-semibold text-foreground">
              {locale === 'en' ? 'Students Benefited' : 'लाभान्वित छात्र'}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {locale === 'en' ? 'Hands-on experiment sessions' : 'प्रायोगिक विज्ञान सत्र'}
            </div>
          </div>

          <div className="bg-card border rounded-2xl p-5 shadow-sm text-center hover:shadow-md transition-shadow">
            <div className="text-3xl sm:text-4xl font-extrabold text-amber-500 mb-1">
              <AnimatedCounter
                value={metrics ? Math.round(metrics.estimatedValueINR / 1000) : 331}
                prefix="₹"
                suffix="k"
              />
            </div>
            <div className="text-xs sm:text-sm font-semibold text-foreground">
              {locale === 'en' ? 'Economic Value Generated' : 'साझा संसाधनों का मूल्य'}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {locale === 'en' ? 'Saved by rural schools & NGOs' : 'ग्रामीण स्कूलों की बचत'}
            </div>
          </div>

          <div className="bg-card border rounded-2xl p-5 shadow-sm text-center hover:shadow-md transition-shadow">
            <div className="text-3xl sm:text-4xl font-extrabold text-purple-600 mb-1">
              <AnimatedCounter
                value={metrics ? metrics.idleCapacityUtilisationPercent : 38.5}
                suffix="%"
                decimals={1}
              />
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
              {locale === 'en' ? 'Verified Institutions' : 'सत्यापित विद्यालय'}
            </h2>
            <p className="text-2xl font-extrabold tracking-tight mt-1">
              {locale === 'en'
                ? 'Featured Labs Across India'
                : 'भारत भर की प्रमुख विद्यालय प्रयोगशालाएं'}
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
          {featuredLabs.map((lab) => {
            const photoUrl =
              lab.photos?.[0]?.url ||
              getDefaultLabPhotos(lab.type, lab.name)[0]?.url
            return (
              <div
                key={lab.id}
                className="group bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
              >
                <div>
                  {/* Photo Header */}
                  <div className="relative w-full h-44 overflow-hidden bg-slate-900">
                    <img
                      src={photoUrl}
                      alt={lab.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                    <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20">
                        {lab.type.replace('_', ' ')}
                      </span>
                      <div className="flex items-center space-x-1 text-xs font-bold text-amber-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{lab.averageRating || 4.9}</span>
                      </div>
                    </div>

                    <div className="absolute bottom-2.5 left-3 right-3 z-10 text-white">
                      <h3 className="font-bold text-base leading-snug drop-shadow-md truncate">
                        {lab.name}
                      </h3>
                      <div className="flex items-center text-xs text-slate-300 drop-shadow-sm mt-0.5">
                        <MapPin className="w-3 h-3 mr-1 text-primary-400 shrink-0" />
                        <span className="truncate">
                          {lab.organization?.name || 'School'} • {lab.organization?.district}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                      {lab.description}
                    </p>

                    <div className="flex items-center justify-between text-xs pt-3 border-t text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        <span className="font-medium text-foreground">Cap: {lab.capacity}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-bold text-primary">Trust: {lab.trustScore}/100</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted/40 border-t flex justify-between items-center">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{locale === 'en' ? 'Open for Bookings' : 'बुकिंग हेतु उपलब्ध'}</span>
                  </span>
                  <Link
                    href={`/labs/${lab.id}`}
                    className="px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-700 transition-colors shadow-sm"
                  >
                    {locale === 'en' ? 'View Details' : 'विवरण देखें'}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
