import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

import { ThemeProvider } from '@/hooks/useThemeContext'
import { AuthProvider } from '@/hooks/useAuth'
import { ToastProvider } from '@/components/ui/ToastProvider'
import { MarketingLayout } from '@/components/layout/MarketingLayout'
import { StudioLayout } from '@/components/studio/StudioLayout'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

// Landing page stays eager — it's the most common entry and the LCP target.
import HomePage from '@/pages/HomePage'

// Every other route is code-split so the initial bundle only ships the landing
// page + shell. Heavy deps (firebase, qrcode, image conversion) load on demand.
const ShortenPage = lazy(() => import('@/pages/ShortenPage'))
const QRGeneratorPage = lazy(() => import('@/pages/QRGeneratorPage'))
const ImageConverterPage = lazy(() => import('@/pages/ImageConverterPage'))
const FeaturesPage = lazy(() => import('@/pages/FeaturesPage'))
const UseCasesPage = lazy(() => import('@/pages/UseCasesPage'))
const PricingPage = lazy(() => import('@/pages/PricingPage'))
const HelpPage = lazy(() => import('@/pages/HelpPage'))
const FAQPage = lazy(() => import('@/pages/FAQPage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'))
const TermsPage = lazy(() => import('@/pages/TermsPage'))
const RedirectPage = lazy(() => import('@/pages/RedirectPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

const StudioHomePage = lazy(() => import('@/pages/studio/StudioHomePage'))
const QRStudioPage = lazy(() => import('@/pages/studio/QRStudioPage'))
const ShortenStudioPage = lazy(() => import('@/pages/studio/ShortenStudioPage'))
const ConvertStudioPage = lazy(() => import('@/pages/studio/ConvertStudioPage'))
const StudioHistoryPage = lazy(() => import('@/pages/studio/StudioHistoryPage'))

/** Centered fallback shown while a route's chunk is being fetched. */
function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoadingSpinner className="text-2xl" />
    </div>
  )
}

/** Scrolls back to the top whenever the route changes. */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

function AppRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageFallback />}>
      <Routes location={location} key={location.pathname}>
        {/* Presentation site — marketing chrome (navbar + footer) */}
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<HomePage />} />

          {/* Service-description pages (no working tool — they link into Studio) */}
          <Route path="/shorten" element={<ShortenPage />} />
          <Route path="/qr-generator" element={<QRGeneratorPage />} />
          <Route path="/image-converter" element={<ImageConverterPage />} />

          {/* Marketing */}
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/use-cases" element={<UseCasesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Legal */}
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* Short-link resolver — must stay above the catch-all */}
          <Route path="/:slug" element={<RedirectPage />} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Studio — auth-gated workspace shell (sidebar, no marketing chrome).
            RequireAuth blocks every studio route for signed-out visitors. */}
        <Route path="/studio" element={<RequireAuth />}>
          <Route element={<StudioLayout />}>
            <Route index element={<StudioHomePage />} />
            <Route path="qr" element={<QRStudioPage />} />
            <Route path="shorten" element={<ShortenStudioPage />} />
            <Route path="convert" element={<ConvertStudioPage />} />
            <Route path="history" element={<StudioHistoryPage />} />
          </Route>
        </Route>

        {/* Legacy history path → studio */}
        <Route path="/history" element={<Navigate to="/studio/history" replace />} />
      </Routes>
      </Suspense>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ScrollToTop />
        <AppRoutes />
        <ToastProvider />
      </AuthProvider>
    </ThemeProvider>
  )
}
