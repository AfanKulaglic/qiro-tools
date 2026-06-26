import { Outlet } from 'react-router-dom'
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
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-[#FBFBF8] text-[#211A14] dark:bg-ink-950 dark:text-white">
      <AmbientBackground />
      <ScrollProgress />
      <Navbar />
      <main className="relative flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
