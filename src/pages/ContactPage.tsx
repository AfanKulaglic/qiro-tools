import { useState } from 'react'
import { toast } from 'sonner'
import { LifeBuoy, Building2, Lightbulb, Send } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const CHANNELS = [
  { icon: LifeBuoy, title: 'Support', text: 'Questions about using the tools or your links.' },
  { icon: Building2, title: 'Business inquiries', text: 'Partnerships, custom domains, and teams.' },
  { icon: Lightbulb, title: 'Feature requests', text: 'Tell us what would make LinkQR better.' },
]

export default function ContactPage() {
  useDocumentTitle('Contact — LinkQR Tools', 'Get in touch with the LinkQR Tools team.')

  const [sending, setSending] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    // MVP: no backend wired up. Acknowledge and reset.
    window.setTimeout(() => {
      setSending(false)
      ;(e.target as HTMLFormElement).reset()
      toast.success('Message form is ready for backend integration.')
    }, 700)
  }

  return (
    <PageShell
      badge="Contact"
      title="Contact us"
      subtitle="We usually reply within a couple of business days."
      wide
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* Channels */}
        <div className="space-y-4">
          {CHANNELS.map((c) => (
            <Card key={c.title} className="p-6">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-blue/15 to-accent-purple/15 text-accent-blue">
                  <c.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-[#211A14] dark:text-white">
                    {c.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{c.text}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Form */}
        <Card className="p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Input name="name" label="Name" placeholder="Jane Doe" required />
              <Input name="email" type="email" label="Email" placeholder="jane@example.com" required />
            </div>
            <Input name="subject" label="Subject" placeholder="How can we help?" required />
            <Textarea
              name="message"
              label="Message"
              placeholder="Tell us a bit more…"
              required
              className="min-h-[140px]"
            />
            <Button type="submit" size="lg" disabled={sending}>
              <Send className="h-4 w-4" />
              {sending ? 'Sending…' : 'Send message'}
            </Button>
          </form>
        </Card>
      </div>
    </PageShell>
  )
}
