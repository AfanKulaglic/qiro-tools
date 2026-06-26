import { LegalLayout, type LegalSection } from '@/components/layout/LegalLayout'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const SECTIONS: LegalSection[] = [
  {
    id: 'overview',
    heading: 'Overview',
    body: (
      <p>
        This Privacy Policy explains what data LinkQR Tools processes and where. We designed the
        product to keep as much as possible on your device.
      </p>
    ),
  },
  {
    id: 'browser-processing',
    heading: 'In-browser processing',
    body: (
      <ul className="list-disc space-y-1.5 pl-5">
        <li>QR code generation happens entirely in your browser.</li>
        <li>Image conversion happens entirely in your browser using the Canvas API.</li>
        <li>Images are never uploaded to a server.</li>
      </ul>
    ),
  },
  {
    id: 'short-links',
    heading: 'Short links',
    body: (
      <ul className="list-disc space-y-1.5 pl-5">
        <li>When you create a short link, its destination URL is stored in Firebase Firestore.</li>
        <li>A click count and last-clicked timestamp may be stored and updated on each visit.</li>
        <li>Firebase infrastructure may process short-link data to deliver redirects.</li>
      </ul>
    ),
  },
  {
    id: 'local-storage',
    heading: 'Local storage',
    body: (
      <p>
        Your recent links, QR code history, image-conversion metadata, and theme preference are
        stored in your browser&apos;s localStorage. This data stays on your device and can be cleared
        at any time from the History page or your browser settings.
      </p>
    ),
  },
  {
    id: 'accounts',
    heading: 'Accounts',
    body: <p>The current version has no user accounts. You can use all tools without signing up.</p>,
  },
  {
    id: 'abuse',
    heading: 'Abuse handling',
    body: (
      <p>
        Links used for phishing, malware, spam, or other abuse may be disabled or removed. We may
        retain minimal information necessary to prevent abuse.
      </p>
    ),
  },
]

export default function PrivacyPage() {
  useDocumentTitle('Privacy Policy — LinkQR Tools', 'How LinkQR Tools handles your data and privacy.')
  return (
    <LegalLayout badge="Legal" title="Privacy Policy" updated="June 2026" sections={SECTIONS} />
  )
}
