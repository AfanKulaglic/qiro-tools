import type { ReactNode } from 'react'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'

export interface LegalSection {
  id: string
  heading: string
  body: ReactNode
}

export function LegalLayout({
  badge,
  title,
  updated,
  sections,
}: {
  badge: string
  title: string
  updated: string
  sections: LegalSection[]
}) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-60 bg-radial-glow" />
      <Container>
        <header className="pt-16 pb-10 sm:pt-20">
          <Badge tone="blue">{badge}</Badge>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-[#211A14] dark:text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 text-sm text-faint">Last updated: {updated}</p>
        </header>

        <div className="grid gap-10 pb-24 lg:grid-cols-[220px_1fr]">
          {/* TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-faint">
                On this page
              </p>
              <nav className="space-y-1.5">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block text-sm text-muted transition-colors hover:text-accent-blue"
                  >
                    {s.heading}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <article className="max-w-3xl space-y-10">
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="text-xl font-bold text-[#211A14] dark:text-white">{s.heading}</h2>
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted">{s.body}</div>
              </section>
            ))}
          </article>
        </div>
      </Container>
    </div>
  )
}
