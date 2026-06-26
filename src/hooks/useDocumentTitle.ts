import { useEffect } from 'react'

const BASE = 'LinkQR Tools'

/**
 * Sets document.title and the meta description for the current page (lightweight
 * client-side SEO for an SPA).
 */
export function useDocumentTitle(title?: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title}` : BASE

    if (description) {
      let tag = document.querySelector('meta[name="description"]')
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('name', 'description')
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', description)
    }
  }, [title, description])
}
