import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { AmbientBackground } from '@/components/layout/AmbientBackground'
import { ScrollProgress } from '@/components/layout/ScrollProgress'

/**
 * Presentation shell: floating navbar, ambient background, scroll progress and
 * footer wrap every marketing / service-description page. The working tools live
 * in the Studio (StudioLayout), which deliberately renders none of this chrome.
 */
export function MarketingLayout() {
  const location = useLocation()
  // The navbar is fixed, so content needs clearance below it — except on the
  // home page, whose dark hero is designed to run underneath the transparent bar.
  const isHome = location.pathname === '/'

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-[#FBFBF8] text-[#211A14] dark:bg-ink-950 dark:text-white">
      <AmbientBackground />
      <ScrollProgress />
      <Navbar />
      <main className={isHome ? 'relative flex-1' : 'relative flex-1 pt-22 md:pt-26'}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
