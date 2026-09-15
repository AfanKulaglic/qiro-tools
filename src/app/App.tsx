import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

import { ThemeProvider } from '@/hooks/useThemeContext'
import { AuthProvider } from '@/hooks/useAuth'
import { AuthPromptProvider } from '@/hooks/useAuthPrompt'
import { ToastProvider } from '@/components/ui/ToastProvider'
import { MarketingLayout } from '@/components/layout/MarketingLayout'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

// The three tool pages each ship a heavy tool (firebase, qrcode, image
// conversion), so every route is code-split — the initial bundle stays small.
const HomePage = lazy(() => import('@/pages/HomePage'))
const ShortenPage = lazy(() => import('@/pages/ShortenPage'))
const HistoryPage = lazy(() => import('@/pages/HistoryPage'))
const ImageConverterPage = lazy(() => import('@/pages/ImageConverterPage'))
const VideoConverterPage = lazy(() => import('@/pages/VideoConverterPage'))
const AudioConverterPage = lazy(() => import('@/pages/AudioConverterPage'))
const GifMakerPage = lazy(() => import('@/pages/GifMakerPage'))
const UtmBuilderPage = lazy(() => import('@/pages/UtmBuilderPage'))
const BackgroundRemoverPage = lazy(() => import('@/pages/BackgroundRemoverPage'))
const ImageEnhancerPage = lazy(() => import('@/pages/ImageEnhancerPage'))
const PdfEditorPage = lazy(() => import('@/pages/PdfEditorPage'))
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
        {/* Whole site uses marketing chrome (navbar + footer). */}
        <Route element={<MarketingLayout />}>
          {/* Root renders the marketing home page. */}
          <Route path="/" element={<HomePage />} />

          {/* Tool home pages — full home-style layout with the working tool embedded */}
          {/* /qr-generator retired: QR lives on the homepage (HomeTools). Old links redirect here. */}
          <Route path="/qr-generator" element={<Navigate to="/" replace />} />
          <Route path="/shorten" element={<ShortenPage />} />
          <Route path="/image-converter" element={<ImageConverterPage />} />
          <Route path="/video-converter" element={<VideoConverterPage />} />
          <Route path="/audio-converter" element={<AudioConverterPage />} />
          <Route path="/gif-maker" element={<GifMakerPage />} />
          <Route path="/utm-builder" element={<UtmBuilderPage />} />
          <Route path="/background-remover" element={<BackgroundRemoverPage />} />
          <Route path="/image-enhancer" element={<ImageEnhancerPage />} />
          <Route path="/pdf-editor" element={<PdfEditorPage />} />

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

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Short-link resolver — OUTSIDE the marketing layout so a valid link
            redirects instantly with no navbar/footer flashing. Ranks below the
            static routes above and above the in-layout catch-all. `/s/:slug` is
            kept for backward compatibility with links minted as `/s/…`. */}
        <Route path="/s/:slug" element={<RedirectPage />} />
        <Route path="/:slug" element={<RedirectPage />} />

        {/* Legacy studio paths → the new tool pages (studio was removed). */}
        <Route path="/studio" element={<Navigate to="/" replace />} />
        <Route path="/studio/qr" element={<Navigate to="/" replace />} />
        <Route path="/studio/shorten" element={<Navigate to="/shorten" replace />} />
        <Route path="/studio/convert" element={<Navigate to="/image-converter" replace />} />
        <Route path="/studio/history" element={<Navigate to="/" replace />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
      </Suspense>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthPromptProvider>
          <ScrollToTop />
          <AppRoutes />
          <ToastProvider />
        </AuthPromptProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
