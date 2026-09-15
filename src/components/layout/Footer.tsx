import { Fragment, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  ArrowUpRight,
  Check,
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { TOOLS } from '@/data/tools'

/**
 * Essentio-style footer — black surface with a rounded top edge, animated
 * marquee band, newsletter form, and a four-column grid for navigation
 * and contact. Replaces the standalone MarqueeStrip + Newsletter sections
 * on the home page (those still exist for any other page that needs them).
 *
 *   ┌──────────────────────────────────────────────┐
 *   │  animate-marquee (yellow + white phrases)    │
 *   │                                              │
 *   │  Newsletter heading       Subscribe form     │
 *   │  ───────────────────────────────────         │
 *   │  Logo + tagline   |  Pages  |  Studio  |  Cnt │
 *   └──────────────────────────────────────────────┘
 */

const MARQUEE_PHRASES = [
  { text: 'Short links · ready in a click', accent: true },
  { text: 'QR codes · print-ready, no watermark', accent: false },
  { text: 'Convert image, video & audio · in your browser', accent: true },
  { text: 'Remove backgrounds · private, on-device AI', accent: false },
  { text: 'Free to start · no signup required', accent: true },
]

const COLUMNS = [
  {
    title: 'Tools',
    links: TOOLS.map((t) => ({ label: t.navLabel, to: t.to })),
  },
  {
    title: 'Pages',
    links: [
      { label: 'Features', to: '/features' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'Use cases', to: '/use-cases' },
      { label: 'About', to: '/about' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', to: '/blog' },
      { label: 'Changelog', to: '/changelog' },
      { label: 'Status', to: '/status' },
      { label: 'Contact', to: '/contact' },
    ],
  },
]

const SOCIALS = [
  { Icon: Instagram, label: 'Instagram', to: '#' },
  { Icon: Twitter, label: 'Twitter', to: '#' },
  { Icon: Facebook, label: 'Facebook', to: '#' },
  { Icon: Youtube, label: 'YouTube', to: '#' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative z-10 overflow-hidden rounded-t-3xl bg-black pt-15 text-white md:rounded-t-[100px] md:pt-20 lg:pt-32.5 lg:pb-20 md:pb-10 pb-7.5">
      {/* 1. Animated marquee — yellow + white phrases, looping */}
      <div className="relative whitespace-nowrap pb-15 pt-15 lg:pb-25">
        <div className="animate-marquee flex items-center">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center space-x-15 px-6" aria-hidden={dup === 1}>
              {MARQUEE_PHRASES.map((p, i) => (
                <Fragment key={`${dup}-${i}`}>
                  <h2
                    className={`text-3xl md:text-5xl lg:text-7xl ${
                      p.accent ? 'text-accent-yellow' : 'text-white'
                    }`}
                  >
                    {p.text}
                  </h2>
                  <span className="text-3xl text-white md:text-5xl lg:text-7xl">*</span>
                </Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="container-full">
        {/* 2. Newsletter — heading left, inline form right */}
        <NewsletterBlock />

        <div className="lg:mt-20 lg:mb-20 mt-10 mb-12.5 h-px w-full bg-white/10" />

        {/* 3. Five-column footer grid: Logo(2) | Tools | Pages | Resources | Contact */}
        <div className="grid grid-cols-2 gap-7.5 md:grid-cols-5 lg:gap-10">
          {/* Column 1 — Logo + tagline + designed-by (spans 2 cols on desktop) */}
          <div className="col-span-2 flex flex-col justify-between">
            <div>
              <div className="mb-7.5 flex items-center gap-2">
                <Logo className="text-white" />
              </div>
              <p className="mb-8 max-w-sm text-base leading-relaxed text-white/70">
                One place to shorten links, generate QR codes, and convert images — fast, private,
                and genuinely free to start.
              </p>
            </div>
            <p className="mt-auto text-sm tracking-normal text-white/50">
              © {year} Qiro · Made with care
            </p>
          </div>

          {/* Columns 2–5 — links + contact */}
          <div className="grid grid-cols-2 gap-7.5 md:grid-cols-4 lg:gap-10">
            {COLUMNS.map((col) => (
              <div key={col.title} className="flex flex-col space-y-3 font-bold uppercase">
                <h4 className="mb-2 text-lg font-bold uppercase tracking-normal text-white">
                  {col.title}
                </h4>
                {col.links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-sm transition-colors hover:text-accent-yellow"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}

            {/* Contact + socials */}
            <div className="col-span-2 flex flex-col justify-between md:col-span-1">
              <div className="space-y-2 text-sm">
                <h4 className="mb-2 text-lg font-bold uppercase tracking-normal text-white">
                  Contact
                </h4>
                <a
                  href="mailto:hello@qiro.tools"
                  className="block text-sm transition-colors hover:text-primary"
                >
                  hello@qiro.tools
                </a>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  A small, focused toolkit — built so sharing on the web feels lighter.
                </p>
              </div>

              <div className="mt-5 flex gap-4 md:mt-3 lg:mt-5">
                {SOCIALS.map(({ Icon, label, to }) => (
                  <Link
                    key={label}
                    to={to}
                    aria-label={label}
                    className="grid size-10.5 place-items-center rounded-full bg-white text-default-800 transition-all hover:bg-accent-yellow"
                  >
                    <Icon className="size-5" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tiny bottom strip — keeps "Designed by …" rhythm from Essentio */}
        <div className="mt-15 flex flex-col items-start justify-between gap-2 border-t border-white/10 py-7 text-xs text-white/50 sm:flex-row sm:items-center">
          <p>Made with care in {year}</p>
          <Link
            to="/privacy"
            className="inline-flex items-center gap-1 transition-colors hover:text-accent-yellow"
          >
            Privacy Policy
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </footer>
  )
}

/**
 * Newsletter form — extracted so the parent layout can drop in different
 * sub-headings without re-implementing the form logic.
 */
function NewsletterBlock() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setDone(true)
  }

  return (
    <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
      <h3 className="max-w-md text-3xl font-normal leading-normal text-white lg:text-4xl">
        Get the latest on Qiro — new tools, features, and quiet improvements.
      </h3>

      <div className="w-full max-w-md">
        {done ? (
          <div className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-5 py-3 text-base font-medium text-white">
            <Check className="h-4 w-4 text-accent-green" />
            You&apos;re on the list — thanks!
          </div>
        ) : (
          <>
            <form
              onSubmit={submit}
              className="relative mb-3 flex rounded-lg bg-white pe-2 ps-5 py-2"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full grow rounded-l-lg border-0 bg-white py-2 text-lg text-default-800 outline-none placeholder:text-default-800"
              />
              <button
                type="submit"
                className="absolute inset-e-2 top-1/2 -translate-y-1/2 rounded-md bg-primary px-6 py-2 text-base font-bold uppercase tracking-tight text-white transition-colors hover:bg-accent-yellow hover:text-default-800 md:inset-e-2"
              >
                Subscribe
              </button>
            </form>
            <p className="text-base text-white">
              By clicking subscribe, you accept our{' '}
              <Link to="/privacy" className="text-primary transition-colors hover:text-accent-yellow">
                Privacy Policy
              </Link>
              .
            </p>
          </>
        )}
      </div>
    </div>
  )
}
