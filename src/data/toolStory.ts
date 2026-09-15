import {
  Sparkles, ImageDown, QrCode, FileVideo, Clapperboard, Scissors, Zap, Palette,
  Crop, Gauge, Download, Layers, Maximize2, Lock, Eye, LineChart, Tag, Repeat, Film, Music,
  Scan, Type, Ruler, Volume2, FileType, Target, FileEdit,
  type LucideIcon,
} from 'lucide-react'
import type { ToolKey } from '@/hooks/useToolGate'

/**
 * Per-service marketing "story" — the copy and imagery shown in the four
 * sections below each tool's hero (BentoFeatures, Pricing, TestimonialsMasonry,
 * FeatureBanner). Every tool gets concrete, specific copy and topic-relevant
 * photos while the section layout/design stays identical. `DEFAULT_STORY` holds
 * the original generic content so the home page is unchanged.
 */

export interface StoryCard {
  title: string
  desc: string
  Icon: LucideIcon
}

/** A text review card. */
export interface TextItem {
  kind: 'text'
  quote: string
  name: string
  role: string
  social: 'instagram' | 'twitter' | 'facebook'
  starTone: 'yellow' | 'blue'
  avatar: string
}

/** An image card (overlay caption or a video "play" tile). */
export interface VisualItem {
  kind: 'visual'
  variant: 'overlay' | 'play'
  image: string
  caption: string
  overlay?: string
}

export type Item = TextItem | VisualItem

export interface BentoStory {
  eyebrow: string
  title: string
  intro: string
  /** Yellow accent icon card. */
  featureA: StoryCard
  /** Wide image card with an "Open" CTA. */
  showcase: { title: string; desc: string; image: string; ctaTo: string }
  /** Wide "100% Free"-style image card. */
  highlight: { eyebrow: string; title: string; desc: string; image: string }
  /** Light icon card. */
  featureB: StoryCard
  /** Blue gradient icon card. */
  featureC: StoryCard
}

export interface BannerStory {
  eyebrow: string
  lead: string
  highlight: string
  tail: string
  subtitle: string
  ctaLabel: string
  ctaTo: string
  image: string
}

export interface ToolStory {
  bento: BentoStory
  testimonials: { eyebrow: string; title: string; items: Item[] }
  banner: BannerStory
  pricing?: { eyebrow: string; title: string; subtitle: string; service?: 'link' | 'qr' | 'convert' | 'pdf' | 'bundle' }
}

const AV = ['/user/1.avif', '/user/2.avif', '/user/3.avif', '/user/4.avif']

/* ───────────────────────── Default (home) story ───────────────────────── */

export const DEFAULT_STORY: ToolStory = {
  bento: {
    eyebrow: 'Key',
    title: 'Features',
    intro: 'Built for everyday sharing — links, codes, images, and documents in one place.',
    featureA: { title: 'Custom QR styling', desc: 'Colors, logos, and shapes — codes that match your brand.', Icon: Sparkles },
    showcase: { title: 'Short links that convert', desc: 'Clean, branded links with click tracking built in.', image: '/feature-image-01.avif', ctaTo: '/shorten' },
    highlight: { eyebrow: '100% Free', title: 'History that saves everything', desc: 'Every link, code, and conversion — one click away again.', image: '/feature-image-02.avif' },
    featureB: { title: 'AI PDF editing', desc: 'Edit text, sign and chat with your documents.', Icon: FileEdit },
    featureC: { title: 'Private conversion', desc: 'Images convert in your browser.', Icon: ImageDown },
  },
  testimonials: {
    eyebrow: 'Testimonial',
    title: 'Customer reviews',
    items: [
      { kind: 'text', quote: 'Qiro replaced three different tabs I used to keep open. Short links and QR codes from the same place — finally.', name: 'Sophia M', role: 'Director', social: 'instagram', starTone: 'yellow', avatar: AV[2] },
      { kind: 'visual', variant: 'overlay', image: '/blog/testimonial-05.avif', caption: 'Custom aliases, click tracking, and a clean link on my own domain.', overlay: 'Branded short links, ready to share in seconds.' },
      { kind: 'text', quote: 'The QR generator is clean and the export is instantly print-ready. No watermark nonsense.', name: 'James R', role: 'Director', social: 'twitter', starTone: 'blue', avatar: AV[3] },
      { kind: 'visual', variant: 'play', image: '/blog/testimonial-06.avif', caption: 'See Qiro in 60 seconds' },
      { kind: 'visual', variant: 'overlay', image: '/blog/estimonial-07.avif', caption: 'High-resolution SVG and PNG exports, with optional center logo.', overlay: 'QR codes that match your brand and print beautifully.' },
      { kind: 'text', quote: 'I convert product photos to WebP all day. Knowing nothing gets uploaded is a real relief for client work.', name: 'Mike R', role: 'Director', social: 'twitter', starTone: 'blue', avatar: AV[1] },
      { kind: 'visual', variant: 'overlay', image: '/blog/testimonial-08.avif', caption: 'JPG · PNG · WebP, batch-friendly. Files never leave your device.', overlay: 'In-browser image conversion — private by design.' },
      { kind: 'text', quote: 'History view means I never lose a code I made last week. Small thing, huge time-saver.', name: 'Emma L', role: 'Director', social: 'facebook', starTone: 'yellow', avatar: AV[0] },
    ],
  },
  banner: {
    eyebrow: 'Ready to start?',
    lead: 'Everyday sharing,',
    highlight: 'elevated',
    tail: 'with intelligent tools.',
    subtitle: 'Discover how Qiro brings links, QR codes, and image conversion into one fast, private workspace — built to make every share effortless.',
    ctaLabel: 'Open Qiro',
    ctaTo: '/',
    image: '/cta-bg-image.avif',
  },
}

/* ───────────────────────── Per-service stories ───────────────────────── */

export const TOOL_STORY: Record<ToolKey, ToolStory> = {
  /* ── URL Shortener ── */
  shorten: {
    bento: {
      eyebrow: 'Why',
      title: 'Short links',
      intro: 'Turn long, messy URLs into clean branded links you can track, share and reuse.',
      featureA: { title: 'Custom aliases', desc: 'Pick the slug yourself — qiro.link/launch instead of random characters.', Icon: Tag },
      showcase: { title: 'Links that get clicked', desc: 'Short, trustworthy URLs people actually click — with a QR code generated for every link.', image: '/story/shorten/1.jpg', ctaTo: '/shorten' },
      highlight: { eyebrow: '100% Free', title: 'Click analytics built in', desc: 'See total clicks and the last time each link was opened — no extra tool, no setup.', image: '/story/shorten/2.jpg' },
      featureB: { title: 'QR for every link', desc: 'Each short link comes with a scannable code, ready to print.', Icon: QrCode },
      featureC: { title: 'Saved history', desc: 'Every link you make is kept so you can copy or reuse it later.', Icon: LineChart },
    },
    testimonials: {
      eyebrow: 'Testimonial',
      title: 'Loved by marketers',
      items: [
        { kind: 'text', quote: 'I shorten every campaign link through Qiro now. Custom aliases make them look professional in emails and bios.', name: 'Sophia M', role: 'Marketing lead', social: 'instagram', starTone: 'yellow', avatar: AV[2] },
        { kind: 'visual', variant: 'overlay', image: '/story/shorten/1.jpg', caption: 'qiro.link/spring-sale instead of a 90-character tracking URL.', overlay: 'Clean, branded links that build trust.' },
        { kind: 'text', quote: 'Click counts per link let me see which post drove traffic without opening Analytics. Huge time-saver.', name: 'James R', role: 'Growth', social: 'twitter', starTone: 'blue', avatar: AV[3] },
        { kind: 'visual', variant: 'overlay', image: '/story/shorten/2.jpg', caption: 'Total clicks and last-opened, right next to every link.', overlay: 'Know what is working at a glance.' },
        { kind: 'text', quote: 'Every link comes with a QR code, so the same link works on a flyer and in a tweet. Brilliant.', name: 'Emma L', role: 'Events', social: 'facebook', starTone: 'yellow', avatar: AV[0] },
      ],
    },
    banner: {
      eyebrow: 'Ready to share?',
      lead: 'Long links become',
      highlight: 'clean, clickable',
      tail: 'URLs in one click.',
      subtitle: 'Custom aliases, a QR code with every link, and click tracking built in — no signup needed to start.',
      ctaLabel: 'Shorten a link',
      ctaTo: '/shorten',
      image: '/story/shorten/3.jpg',
    },
    pricing: { eyebrow: 'Pricing', title: 'Free to start — Pro when you scale.', subtitle: 'Shorten links free forever. Upgrade for unlimited links, custom domains and deeper analytics.', service: 'link' },
  },

  /* ── QR Generator ── */
  qr: {
    bento: {
      eyebrow: 'Why',
      title: 'QR codes',
      intro: 'Generate branded QR codes that match your identity and stay crisp from screen to print.',
      featureA: { title: 'On-brand styling', desc: 'Colors, rounded shapes and a center logo — codes that look like you, not a tool.', Icon: Palette },
      showcase: { title: 'Codes for anything', desc: 'Link, text, Wi-Fi, contact and more — generate a scannable code in seconds.', image: '/story/qr/1.jpg', ctaTo: '/' },
      highlight: { eyebrow: '100% Free', title: 'Print-ready SVG & PNG', desc: 'Download lossless SVG for print or high-res PNG for screens — no watermark.', image: '/story/qr/2.jpg' },
      featureB: { title: 'Add your logo', desc: 'Drop a logo in the middle while staying perfectly scannable.', Icon: Sparkles },
      featureC: { title: 'Scans every time', desc: 'High error-correction keeps codes readable even when styled.', Icon: Scan },
    },
    testimonials: {
      eyebrow: 'Testimonial',
      title: 'Made for brands',
      items: [
        { kind: 'text', quote: 'Our menu QR matches the restaurant branding exactly — colors and logo in the middle. Guests actually compliment it.', name: 'Mike R', role: 'Owner', social: 'instagram', starTone: 'yellow', avatar: AV[1] },
        { kind: 'visual', variant: 'overlay', image: '/story/qr/1.jpg', caption: 'One code on the table links straight to the live menu.', overlay: 'A QR code that fits your brand.' },
        { kind: 'text', quote: 'SVG export is the killer feature. I drop it into print files and it stays razor sharp at any size.', name: 'James R', role: 'Designer', social: 'twitter', starTone: 'blue', avatar: AV[3] },
        { kind: 'visual', variant: 'play', image: '/story/qr/2.jpg', caption: 'From content to code in seconds' },
        { kind: 'text', quote: 'No watermark, no signup, instant download. Exactly what a QR tool should be.', name: 'Sophia M', role: 'Marketing', social: 'facebook', starTone: 'yellow', avatar: AV[2] },
      ],
    },
    banner: {
      eyebrow: 'Ready to scan?',
      lead: 'QR codes that look like',
      highlight: 'your brand',
      tail: 'not a tool.',
      subtitle: 'Customize content, colors, frame and logo, then download print-ready SVG or PNG — all in your browser.',
      ctaLabel: 'Make a QR code',
      ctaTo: '/',
      image: '/story/qr/3.jpg',
    },
    pricing: { eyebrow: 'Pricing', title: 'Beautiful codes, free to start.', subtitle: 'Generate and download QR codes free. Upgrade for batch generation and saved brand presets.', service: 'qr' },
  },

  /* ── Image Converter ── */
  convert: {
    bento: {
      eyebrow: 'Why',
      title: 'Convert',
      intro: 'Change image formats in your browser — nothing is uploaded, everything stays private.',
      featureA: { title: 'JPG · PNG · WebP', desc: 'Convert between the formats you actually use, plus AVIF and more.', Icon: FileType },
      showcase: { title: 'Private by design', desc: 'Conversion runs on your device. Your images never touch a server — ideal for client work.', image: '/story/convert/1.jpg', ctaTo: '/image-converter' },
      highlight: { eyebrow: '100% Free', title: 'Smaller files, same quality', desc: 'Switch to WebP or AVIF and cut file size dramatically without visible loss.', image: '/story/convert/2.jpg' },
      featureB: { title: 'Quality control', desc: 'Dial in compression and resize before you export.', Icon: Crop },
      featureC: { title: 'Instant download', desc: 'No queue, no upload — convert and save in a moment.', Icon: Download },
    },
    testimonials: {
      eyebrow: 'Testimonial',
      title: 'Trusted with private files',
      items: [
        { kind: 'text', quote: 'I batch-convert product photos to WebP all day. Knowing nothing gets uploaded is a real relief for client work.', name: 'Mike R', role: 'Photographer', social: 'twitter', starTone: 'blue', avatar: AV[1] },
        { kind: 'visual', variant: 'overlay', image: '/story/convert/1.jpg', caption: 'Files never leave the device — fully private.', overlay: 'In-browser conversion you can trust.' },
        { kind: 'text', quote: 'Switching hero images to WebP cut our page weight in half. Same quality, faster site.', name: 'James R', role: 'Web dev', social: 'twitter', starTone: 'blue', avatar: AV[3] },
        { kind: 'visual', variant: 'overlay', image: '/story/convert/2.jpg', caption: 'WebP & AVIF — big size savings, no visible loss.', overlay: 'Lighter images, happier load times.' },
        { kind: 'text', quote: 'No upload, no signup, no watermark. It just converts. Exactly what I wanted.', name: 'Emma L', role: 'Designer', social: 'facebook', starTone: 'yellow', avatar: AV[0] },
      ],
    },
    banner: {
      eyebrow: 'Ready to convert?',
      lead: 'Convert images without them',
      highlight: 'leaving your device',
      tail: '.',
      subtitle: 'JPG, PNG, WebP and AVIF — conversion happens in your browser. Nothing gets uploaded, everything stays private.',
      ctaLabel: 'Convert an image',
      ctaTo: '/image-converter',
      image: '/story/convert/3.jpg',
    },
    pricing: { eyebrow: 'Pricing', title: 'Private conversion, free to start.', subtitle: 'Convert images free in your browser. Upgrade for batch conversion and larger files.', service: 'convert' },
  },

  /* ── Video Converter ── */
  video: {
    bento: {
      eyebrow: 'Why',
      title: 'Video',
      intro: 'Convert video formats right in your browser — no upload, no install, fully private.',
      featureA: { title: 'MP4 · WebM · MOV', desc: 'Convert between the formats every platform expects.', Icon: FileVideo },
      showcase: { title: 'Runs on your device', desc: 'Powered by in-browser FFmpeg — your footage never gets uploaded to a server.', image: '/story/video/1.jpg', ctaTo: '/video-converter' },
      highlight: { eyebrow: '100% Free', title: 'Extract audio too', desc: 'Pull an MP3 out of any clip, or turn a short video into a GIF.', image: '/story/video/2.jpg' },
      featureB: { title: 'Resize & compress', desc: 'Shrink big files down to shareable sizes before export.', Icon: Ruler },
      featureC: { title: 'No watermark', desc: 'Clean output, every time — nothing stamped on your video.', Icon: Film },
    },
    testimonials: {
      eyebrow: 'Testimonial',
      title: 'For creators',
      items: [
        { kind: 'text', quote: 'I convert MOV clips from my phone to MP4 before editing. Fast, private, and no sketchy upload sites.', name: 'Sophia M', role: 'Creator', social: 'instagram', starTone: 'yellow', avatar: AV[2] },
        { kind: 'visual', variant: 'overlay', image: '/story/video/1.jpg', caption: 'FFmpeg runs in the browser — footage stays local.', overlay: 'Convert video without uploading it.' },
        { kind: 'text', quote: 'Pulling an MP3 out of an interview clip used to need a desktop app. Now it is two clicks.', name: 'James R', role: 'Podcaster', social: 'twitter', starTone: 'blue', avatar: AV[3] },
        { kind: 'visual', variant: 'play', image: '/story/video/2.jpg', caption: 'Convert, compress, extract' },
        { kind: 'text', quote: 'Compressed a 200MB clip to something I could actually email. No quality complaints.', name: 'Mike R', role: 'Editor', social: 'twitter', starTone: 'blue', avatar: AV[1] },
      ],
    },
    banner: {
      eyebrow: 'Ready to convert?',
      lead: 'Convert video without it',
      highlight: 'leaving your device',
      tail: '.',
      subtitle: 'MP4, WebM, GIF, MP3 and MOV — conversion happens in your browser. Nothing gets uploaded, everything stays private.',
      ctaLabel: 'Convert a video',
      ctaTo: '/video-converter',
      image: '/story/video/3.jpg',
    },
    pricing: { eyebrow: 'Pricing', title: 'In-browser video, free to start.', subtitle: 'Convert video free on your device. Upgrade for longer clips and faster processing.', service: 'convert' },
  },

  /* ── Audio Converter ── */
  audio: {
    bento: {
      eyebrow: 'Why',
      title: 'Audio',
      intro: 'Convert audio formats and extract sound from video — privately, in your browser.',
      featureA: { title: 'MP3 · WAV · M4A', desc: 'Convert between every common audio format, plus OGG and FLAC.', Icon: Music },
      showcase: { title: 'Extract from video', desc: 'Turn any clip into clean audio — perfect for podcasts, voice notes and samples.', image: '/story/audio/1.jpg', ctaTo: '/audio-converter' },
      highlight: { eyebrow: '100% Free', title: 'Stays on your device', desc: 'No upload, no account — your recordings never leave your computer.', image: '/story/audio/2.jpg' },
      featureB: { title: 'Pick the bitrate', desc: 'Balance quality and file size before you export.', Icon: Volume2 },
      featureC: { title: 'Instant export', desc: 'Convert and download in seconds, no queue.', Icon: Download },
    },
    testimonials: {
      eyebrow: 'Testimonial',
      title: 'For podcasters & musicians',
      items: [
        { kind: 'text', quote: 'I record voice memos as M4A and convert to MP3 for my editor. Quick and completely private.', name: 'James R', role: 'Podcaster', social: 'twitter', starTone: 'blue', avatar: AV[3] },
        { kind: 'visual', variant: 'overlay', image: '/story/audio/1.jpg', caption: 'Extract clean audio straight from a video clip.', overlay: 'From video to MP3 in two clicks.' },
        { kind: 'text', quote: 'WAV to MP3 without uploading my unreleased tracks anywhere. That privacy is the whole reason I use it.', name: 'Mike R', role: 'Producer', social: 'instagram', starTone: 'yellow', avatar: AV[1] },
        { kind: 'visual', variant: 'play', image: '/story/audio/2.jpg', caption: 'Convert and extract audio' },
        { kind: 'text', quote: 'Set the bitrate, hit convert, done. No bloated app to install.', name: 'Emma L', role: 'Editor', social: 'facebook', starTone: 'yellow', avatar: AV[0] },
      ],
    },
    banner: {
      eyebrow: 'Ready to convert?',
      lead: 'Convert audio without it',
      highlight: 'leaving your device',
      tail: '.',
      subtitle: 'MP3, WAV, OGG, M4A and FLAC — plus audio extraction from video. All in your browser, nothing gets uploaded.',
      ctaLabel: 'Convert audio',
      ctaTo: '/audio-converter',
      image: '/story/audio/3.jpg',
    },
    pricing: { eyebrow: 'Pricing', title: 'Private audio, free to start.', subtitle: 'Convert audio free in your browser. Upgrade for batch jobs and longer files.', service: 'convert' },
  },

  /* ── GIF Maker ── */
  gif: {
    bento: {
      eyebrow: 'Why',
      title: 'GIFs',
      intro: 'Turn a video clip into a crisp, shareable animated GIF — right in your browser.',
      featureA: { title: 'Trim the moment', desc: 'Pick the exact start and end so the loop lands perfectly.', Icon: Clapperboard },
      showcase: { title: 'Video to GIF, instantly', desc: 'Drop in a clip, set the length, and get a smooth animated GIF — no upload.', image: '/story/gif/1.jpg', ctaTo: '/gif-maker' },
      highlight: { eyebrow: '100% Free', title: 'Control size & speed', desc: 'Tune dimensions, frame rate and speed to keep the file small and snappy.', image: '/story/gif/2.jpg' },
      featureB: { title: 'Adjust speed', desc: 'Speed up or slow down the loop to get the right feel.', Icon: Repeat },
      featureC: { title: 'Private & instant', desc: 'Everything runs locally — nothing gets uploaded.', Icon: Zap },
    },
    testimonials: {
      eyebrow: 'Testimonial',
      title: 'For social & support',
      items: [
        { kind: 'text', quote: 'I turn screen recordings into GIFs for our docs. Trimming to the exact moment is so easy here.', name: 'Emma L', role: 'Support lead', social: 'facebook', starTone: 'yellow', avatar: AV[0] },
        { kind: 'visual', variant: 'overlay', image: '/story/gif/1.jpg', caption: 'Clip in, animated GIF out — no upload.', overlay: 'Make a GIF in seconds.' },
        { kind: 'text', quote: 'Size and speed controls keep my GIFs small enough to post anywhere without losing quality.', name: 'Sophia M', role: 'Social', social: 'instagram', starTone: 'yellow', avatar: AV[2] },
        { kind: 'visual', variant: 'play', image: '/story/gif/2.jpg', caption: 'Trim, tune, export' },
        { kind: 'text', quote: 'Finally a GIF maker with no watermark and no upload. Does exactly one thing, really well.', name: 'James R', role: 'Creator', social: 'twitter', starTone: 'blue', avatar: AV[3] },
      ],
    },
    banner: {
      eyebrow: 'Ready to loop?',
      lead: 'Make a GIF from video,',
      highlight: 'in your browser',
      tail: '.',
      subtitle: 'Trim a clip, adjust speed and size, and get an animated GIF. Nothing gets uploaded.',
      ctaLabel: 'Make a GIF',
      ctaTo: '/gif-maker',
      image: '/story/gif/3.jpg',
    },
    pricing: { eyebrow: 'Pricing', title: 'GIFs free, forever.', subtitle: 'Make GIFs free in your browser. Upgrade for longer clips and higher frame rates.', service: 'convert' },
  },

  /* ── UTM Builder ── */
  utm: {
    bento: {
      eyebrow: 'Why',
      title: 'UTM links',
      intro: 'Build properly tagged campaign URLs so you always know where your traffic comes from.',
      featureA: { title: 'Consistent tags', desc: 'Source, medium and campaign every time — no more guesswork in reports.', Icon: Tag },
      showcase: { title: 'Know what works', desc: 'Tag every link so Google Analytics shows exactly which post or ad drove the visit.', image: '/story/utm/1.jpg', ctaTo: '/utm-builder' },
      highlight: { eyebrow: '100% Free', title: 'Shorten as you build', desc: 'Long UTM strings are ugly — turn them into a clean short link in the same flow.', image: '/story/utm/2.jpg' },
      featureB: { title: 'Works everywhere', desc: 'Compatible with GA4 and every major analytics tool.', Icon: Target },
      featureC: { title: 'No typos', desc: 'A guided form keeps parameters clean and reusable.', Icon: Type },
    },
    testimonials: {
      eyebrow: 'Testimonial',
      title: 'For data-driven teams',
      items: [
        { kind: 'text', quote: 'Our whole team builds campaign links here now, so attribution in GA4 is finally consistent.', name: 'Sophia M', role: 'Marketing lead', social: 'instagram', starTone: 'yellow', avatar: AV[2] },
        { kind: 'visual', variant: 'overlay', image: '/story/utm/1.jpg', caption: 'Every visit traced back to the right campaign.', overlay: 'Attribution you can trust.' },
        { kind: 'text', quote: 'Building the UTM and shortening it in one step saves me copy-pasting between three tools.', name: 'James R', role: 'Performance', social: 'twitter', starTone: 'blue', avatar: AV[3] },
        { kind: 'visual', variant: 'overlay', image: '/story/utm/2.jpg', caption: 'Tagged and shortened in the same flow.', overlay: 'Clean links, clean data.' },
        { kind: 'text', quote: 'No more "facebook" vs "Facebook" splitting my reports. The form keeps tags consistent.', name: 'Mike R', role: 'Analyst', social: 'facebook', starTone: 'blue', avatar: AV[1] },
      ],
    },
    banner: {
      eyebrow: 'Ready to track?',
      lead: 'Build',
      highlight: 'trackable',
      tail: 'campaign links.',
      subtitle: 'Add UTM tags and know exactly where your traffic comes from — works with Google Analytics and every tracking tool.',
      ctaLabel: 'Build a UTM link',
      ctaTo: '/utm-builder',
      image: '/story/utm/3.jpg',
    },
    pricing: { eyebrow: 'Pricing', title: 'Track campaigns, free to start.', subtitle: 'Build UTM links free. Upgrade for saved presets and unlimited short links.', service: 'link' },
  },

  /* ── Background Remover ── */
  bg: {
    bento: {
      eyebrow: 'Why',
      title: 'Cut-outs',
      intro: 'Remove image backgrounds automatically with AI — a clean transparent PNG in seconds.',
      featureA: { title: 'One-click cut-out', desc: 'AI detects the subject and removes the background — no manual masking.', Icon: Scissors },
      showcase: { title: 'Clean, sharp edges', desc: 'Great around hair and fine detail, with an edge slider to refine the result.', image: '/story/bg/1.jpg', ctaTo: '/background-remover' },
      highlight: { eyebrow: '100% Private', title: 'Runs in your browser', desc: 'The AI model runs on your device — your photos are never uploaded to a server.', image: '/story/bg/2.jpg' },
      featureB: { title: 'Transparent PNG', desc: 'Download a ready-to-use cut-out with a transparent background.', Icon: Layers },
      featureC: { title: 'No signup', desc: 'Free to start instantly — drop an image and go.', Icon: Lock },
    },
    testimonials: {
      eyebrow: 'Testimonial',
      title: 'For shops & creators',
      items: [
        { kind: 'text', quote: 'Product shots on a clean transparent background in seconds. This replaced a paid subscription for me.', name: 'Mike R', role: 'Shop owner', social: 'instagram', starTone: 'yellow', avatar: AV[1] },
        { kind: 'visual', variant: 'overlay', image: '/story/bg/1.jpg', caption: 'Sharp edges, even around hair and fur.', overlay: 'A clean cut-out, automatically.' },
        { kind: 'text', quote: 'The fact that it runs in my browser means I can cut out client photos without uploading them anywhere.', name: 'Emma L', role: 'Designer', social: 'facebook', starTone: 'yellow', avatar: AV[0] },
        { kind: 'visual', variant: 'play', image: '/story/bg/2.jpg', caption: 'Drop a photo, get a PNG' },
        { kind: 'text', quote: 'Transparent PNG straight out, ready to drop onto any background. No fuss.', name: 'Sophia M', role: 'Marketing', social: 'twitter', starTone: 'blue', avatar: AV[2] },
      ],
    },
    banner: {
      eyebrow: 'Ready to cut out?',
      lead: 'Remove image backgrounds —',
      highlight: 'in your browser',
      tail: '.',
      subtitle: 'The AI model runs locally: you get a transparent PNG with clean edges. Images are never uploaded.',
      ctaLabel: 'Remove a background',
      ctaTo: '/background-remover',
      image: '/story/bg/3.jpg',
    },
    pricing: { eyebrow: 'Pricing', title: 'Cut-outs, free to start.', subtitle: 'Remove backgrounds free in your browser. Upgrade for batch processing and unlimited downloads.', service: 'convert' },
  },

  /* ── Image Enhancer ── */
  enhance: {
    bento: {
      eyebrow: 'Why',
      title: 'Enhance',
      intro: 'Upscale and sharpen photos with AI — more detail, less noise, all on your device.',
      featureA: { title: '2× / 4× upscale', desc: 'AI super-resolution adds real detail while enlarging the image.', Icon: Maximize2 },
      showcase: { title: 'Sharper, cleaner photos', desc: 'Recover detail, reduce noise and crisp up soft shots — then compare before/after.', image: '/story/enhance/1.jpg', ctaTo: '/image-enhancer' },
      highlight: { eyebrow: '100% Private', title: 'AI runs in your browser', desc: 'The model runs on your device — your photos never get uploaded to a server.', image: '/story/enhance/2.jpg' },
      featureB: { title: 'Strength slider', desc: 'Dial the finishing pass from natural to punchy.', Icon: Gauge },
      featureC: { title: 'Drag to compare', desc: 'A built-in before/after slider shows exactly what changed.', Icon: Eye },
    },
    testimonials: {
      eyebrow: 'Testimonial',
      title: 'For photographers',
      items: [
        { kind: 'text', quote: 'Old low-res photos finally look usable. The 4× upscale brought back detail I thought was gone.', name: 'Sophia M', role: 'Photographer', social: 'instagram', starTone: 'yellow', avatar: AV[2] },
        { kind: 'visual', variant: 'overlay', image: '/story/enhance/1.jpg', caption: 'More detail, less noise — drag to compare.', overlay: 'Before and after, side by side.' },
        { kind: 'text', quote: 'I love that it runs locally. I can enhance client images without uploading a single file.', name: 'Mike R', role: 'Retoucher', social: 'twitter', starTone: 'blue', avatar: AV[1] },
        { kind: 'visual', variant: 'play', image: '/story/enhance/2.jpg', caption: 'Upscale and sharpen with AI' },
        { kind: 'text', quote: 'The strength slider is great — natural for portraits, punchy for products. Total control.', name: 'Emma L', role: 'Creator', social: 'facebook', starTone: 'yellow', avatar: AV[0] },
      ],
    },
    banner: {
      eyebrow: 'Ready to enhance?',
      lead: 'Upscale & sharpen photos —',
      highlight: 'with AI',
      tail: '.',
      subtitle: 'AI super-resolution runs locally: 2× or 4× more pixels, sharper detail and cleaner edges. Images are never uploaded.',
      ctaLabel: 'Enhance a photo',
      ctaTo: '/image-enhancer',
      image: '/story/enhance/3.jpg',
    },
    pricing: { eyebrow: 'Pricing', title: 'Sharper photos, free to start.', subtitle: 'Enhance images free in your browser. Upgrade for batch upscaling and larger images.', service: 'convert' },
  },

  /* â”€â”€ AI PDF Studio â”€â”€ */
  pdf: {
    bento: {
      eyebrow: 'Why',
      title: 'PDF Studio',
      intro: 'Edit, create and talk to your documents — with AI that actually understands them.',
      featureA: { title: 'AI document chat', desc: 'Ask questions and get answers with page citations.', Icon: Sparkles },
      showcase: { title: 'Edit anything, by hand', desc: 'Text, images, signatures, pages — a full editor in your browser.', image: '/hero/hero-2.jpg', ctaTo: '/pdf-editor' },
      highlight: { eyebrow: 'AI Included', title: 'Fix your writing, keep the layout', desc: 'AI proofreads and rewrites text while fonts, spacing and alignment stay intact.', image: '/product/product-01.avif' },
      featureB: { title: 'Create from a prompt', desc: 'Describe it — AI picks a premium template and writes the content.', Icon: Type },
      featureC: { title: 'Sees scans & tables', desc: 'Vision AI reads scans, tables and graphs — even photos of documents.', Icon: Scan },
    },
    testimonials: {
      eyebrow: 'Testimonial',
      title: 'For document people',
      items: [
        { kind: 'text', quote: 'It proofread my 40-page proposal overnight quality — layout untouched. Adobe charges triple for less.', name: 'Sophia M', role: 'Consultant', social: 'instagram', starTone: 'yellow', avatar: AV[2] },
        { kind: 'visual', variant: 'overlay', image: '/hero/hero-2.jpg', caption: 'Describe it — get a finished document in seconds.', overlay: 'From prompt to polished PDF.' },
        { kind: 'text', quote: 'The vision mode read my scanned invoices and pulled every total. Nothing else came close.', name: 'Mike R', role: 'Accountant', social: 'twitter', starTone: 'blue', avatar: AV[1] },
        { kind: 'visual', variant: 'play', image: '/product/product-01.avif', caption: 'Chat with any PDF — with page citations' },
        { kind: 'text', quote: 'Merging, signing and watermarking contracts used to be three tools. Now it is one tab.', name: 'Emma L', role: 'Founder', social: 'facebook', starTone: 'yellow', avatar: AV[0] },
      ],
    },
    banner: {
      eyebrow: 'Ready to work smarter?',
      lead: 'Your documents,',
      highlight: 'supercharged',
      tail: 'with AI.',
      subtitle: 'Edit text without breaking layout, generate documents from a prompt, and ask any PDF questions — all with AI included at one flat price.',
      ctaLabel: 'Open PDF Studio',
      ctaTo: '/pdf-editor',
      image: '/hero/hero-3.jpg',
    },
    pricing: { eyebrow: 'Pricing', title: 'The AI document studio.', subtitle: 'Edit and organize PDFs free. Go Pro for unlimited AI — chat, vision, repair and document creation.', service: 'pdf' },
  },
}

export function getToolStory(key: ToolKey): ToolStory {
  return TOOL_STORY[key] ?? DEFAULT_STORY
}
