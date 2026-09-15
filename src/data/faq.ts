export interface FaqItem {
  q: string
  a: string
}

export interface FaqCategory {
  category: string
  items: FaqItem[]
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    category: 'General',
    items: [
      {
        q: 'What is LinkQR Tools?',
        a: 'LinkQR Tools is a clean, all-in-one workspace for shortening links, generating QR codes, and converting images. It is designed to be fast and simple — no clutter, no complicated setup.',
      },
      {
        q: 'Is it free?',
        a: 'Yes — you get 3 free actions across all tools, no account needed. Sign in and receive 3 more free actions. After that, a Pro plan unlocks unlimited use.',
      },
      {
        q: 'Do I need an account?',
        a: 'Not to start. Your first 3 actions work without signing up, and sign-in gives you 3 more free actions. Your recent links, QR codes, and conversions are stored locally in your browser.',
      },
      {
        q: 'Can I use it commercially?',
        a: 'Yes, for legitimate business use such as campaigns, menus, flyers, and product links. Phishing, malware, and spam are strictly prohibited.',
      },
    ],
  },
  {
    category: 'URL Shortener',
    items: [
      {
        q: 'How does the shortener work?',
        a: 'When you create a short link we store a small record in Firebase Firestore that maps a slug (e.g. /s/abc123) to your destination URL. Visiting the short link redirects to the original and counts the click.',
      },
      {
        q: 'Can I use my own domain?',
        a: 'Yes. Point a subdomain such as go.yourdomain.com to Firebase Hosting and set VITE_SHORT_DOMAIN. Generated links then use go.yourdomain.com/slug instead of the default /s/slug format.',
      },
      {
        q: 'Can I create custom aliases?',
        a: 'Yes. Add a custom alias (3–32 lowercase letters, numbers, and hyphens) to make links memorable, like go.yourdomain.com/summer-sale.',
      },
      {
        q: 'Are links permanent?',
        a: 'Links remain active as long as the underlying Firebase project is running and the link has not been disabled for abuse. We do not guarantee permanent availability.',
      },
      {
        q: 'Is Bitly used?',
        a: 'No. The shortener is our own system built on Firebase Firestore. We do not use Bitly, TinyURL, Cuttly, or Rebrandly APIs.',
      },
      {
        q: 'Is Firebase Dynamic Links used?',
        a: 'No. Firebase Dynamic Links is deprecated. We use a simple Firestore + redirect route approach that you fully control.',
      },
    ],
  },
  {
    category: 'QR Codes',
    items: [
      {
        q: 'Are QR codes unlimited?',
        a: 'QR generation runs locally in your browser. Every visitor gets 3 free actions across all tools (sign-in adds 3 more); Pro removes the cap entirely.',
      },
      {
        q: 'Can I download PNG?',
        a: 'Yes. You can download high-resolution PNG files, and SVG for crisp printing at any size.',
      },
      {
        q: 'Can I customize colors?',
        a: 'Yes. You can set the foreground and background colors, use a transparent background, and adjust size and error-correction level.',
      },
      {
        q: 'Can I use QR codes for print?',
        a: 'Absolutely. Use the SVG download for posters, flyers, and menus so the code stays sharp at large sizes.',
      },
    ],
  },
  {
    category: 'Image Converter',
    items: [
      {
        q: 'Are images uploaded?',
        a: 'No. Image conversion happens entirely in your browser using the Canvas API. Your files never leave your device.',
      },
      {
        q: 'Which formats are supported?',
        a: 'You can convert between JPG, PNG, and WebP in any direction (e.g. PNG → WebP, JPG → PNG).',
      },
      {
        q: 'Why does JPG remove transparency?',
        a: 'JPG does not support transparency. When converting a transparent PNG to JPG, the transparent areas are filled with a background color you choose.',
      },
      {
        q: 'Can I batch convert files?',
        a: 'The current version converts one image at a time. Bulk conversion is on the roadmap.',
      },
    ],
  },
  {
    category: 'Privacy',
    items: [
      {
        q: 'What data is stored?',
        a: 'Only short links are stored server-side (in Firebase Firestore), along with a click count. QR codes and image conversions are never stored on a server.',
      },
      {
        q: 'Are images stored?',
        a: 'No. Images are processed in memory in your browser and discarded when you leave the page.',
      },
      {
        q: 'Are QR codes stored?',
        a: 'No. We keep only a small local history entry (the content and date) in your browser so you can regenerate them.',
      },
      {
        q: 'What is saved in localStorage?',
        a: 'Your recent short links, QR code history, image-conversion metadata, and your theme preference — all on your device only.',
      },
    ],
  },
]

/** A short, curated set used on the home page FAQ preview. */
export const FAQ_PREVIEW: FaqItem[] = [
  FAQ_CATEGORIES[0].items[1], // Is this really free?
  FAQ_CATEGORIES[1].items[1], // Can I use my own domain?
  FAQ_CATEGORIES[2].items[0], // Are QR codes unlimited?
  FAQ_CATEGORIES[3].items[0], // Are images uploaded?
  FAQ_CATEGORIES[1].items[5], // Firebase Dynamic Links?
  FAQ_CATEGORIES[1].items[3], // Are short links permanent?
]
