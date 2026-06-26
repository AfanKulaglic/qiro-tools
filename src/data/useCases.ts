import type { LucideIcon } from 'lucide-react'
import {
  UtensilsCrossed,
  Briefcase,
  Megaphone,
  CalendarDays,
  ShoppingBag,
  Printer,
} from 'lucide-react'

export interface UseCase {
  icon: LucideIcon
  title: string
  tagline: string
  description: string
  points: string[]
}

export const USE_CASES: UseCase[] = [
  {
    icon: UtensilsCrossed,
    title: 'Restaurants & Cafes',
    tagline: 'QR menus, location links, daily offers.',
    description:
      'Replace printed menus with a single QR code, share your Google Maps location, and push daily specials without reprinting anything.',
    points: ['QR menus', 'Google Maps links', 'Instagram links', 'Daily offers'],
  },
  {
    icon: Briefcase,
    title: 'Small Businesses',
    tagline: 'Flyers, cards, booking links, promos.',
    description:
      'Add scannable links to flyers and business cards, shorten booking pages, and run clean promo campaigns that look professional.',
    points: ['Flyers', 'Business cards', 'Booking links', 'Promo campaigns'],
  },
  {
    icon: Megaphone,
    title: 'Agencies',
    tagline: 'Campaign links, branded QR codes, reporting.',
    description:
      'Create branded short links per campaign, generate matching QR codes for client assets, and track basic engagement.',
    points: ['Campaign links', 'Client QR codes', 'Reporting', 'Branded links'],
  },
  {
    icon: CalendarDays,
    title: 'Events',
    tagline: 'Tickets, schedules, check-in, locations.',
    description:
      'Shorten ticket links, share schedules, route attendees to check-in pages, and drop location QR codes on signage.',
    points: ['Ticket links', 'Schedules', 'Check-in pages', 'Location QR codes'],
  },
  {
    icon: ShoppingBag,
    title: 'E-commerce',
    tagline: 'Product links, discounts, packaging QR.',
    description:
      'Share clean product links, run discount campaigns, and print packaging QR codes that lead to reviews or how-to guides.',
    points: ['Product links', 'Discounts', 'Packaging QR', 'Influencer campaigns'],
  },
  {
    icon: Printer,
    title: 'Print Shops',
    tagline: 'QR-ready flyers, cards, brochures, posters.',
    description:
      'Deliver print-ready designs with crisp SVG QR codes for flyers, business cards, brochures, and large-format posters.',
    points: ['QR-ready flyers', 'Business cards', 'Brochures', 'Posters'],
  },
]
