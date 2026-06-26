import { LegalLayout, type LegalSection } from '@/components/layout/LegalLayout'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const SECTIONS: LegalSection[] = [
  {
    id: 'acceptable-use',
    heading: 'Acceptable use',
    body: (
      <p>
        You agree to use LinkQR Tools only for lawful purposes. You are responsible for the links
        you create and the content they point to.
      </p>
    ),
  },
  {
    id: 'prohibited',
    heading: 'Prohibited activity',
    body: (
      <ul className="list-disc space-y-1.5 pl-5">
        <li>No phishing or deceptive links.</li>
        <li>No malware, viruses, or harmful code.</li>
        <li>No spam or mass unsolicited messaging.</li>
        <li>No illegal content of any kind.</li>
      </ul>
    ),
  },
  {
    id: 'availability',
    heading: 'Service availability',
    body: (
      <p>
        The service is provided “as is” and “as available”, without warranties of any kind. We do
        not guarantee permanent availability of the service or of any short link.
      </p>
    ),
  },
  {
    id: 'limits',
    heading: 'Technical limits',
    body: (
      <p>
        Short links rely on Firebase infrastructure and may be subject to fair-use and Firebase
        quota limits. Links may have technical limitations and can be disabled if they are abusive.
      </p>
    ),
  },
  {
    id: 'responsibility',
    heading: 'User responsibility',
    body: (
      <p>
        You are solely responsible for how you use the tools and for compliance with applicable laws
        and the terms of any destination you link to.
      </p>
    ),
  },
]

export default function TermsPage() {
  useDocumentTitle('Terms of Service — LinkQR Tools', 'The terms that govern your use of LinkQR Tools.')
  return <LegalLayout badge="Legal" title="Terms of Service" updated="June 2026" sections={SECTIONS} />
}
