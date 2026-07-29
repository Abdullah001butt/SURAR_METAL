import { useEffect } from 'react'

const SITE_NAME = 'Al Surur General Store Equipment Trading LLC'
const SITE_URL = 'https://www.alsururmetal.com'
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`

interface SeoProps {
  title: string
  description: string
  path?: string
  image?: string
  noIndex?: boolean
  type?: 'website' | 'article'
  jsonLd?: Record<string, unknown>
  keywords?: string
}

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function removeMetaTag(attr: 'name' | 'property', key: string) {
  document.querySelector(`meta[${attr}="${key}"]`)?.remove()
}

function setCanonical(href: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function setJsonLd(id: string, data: Record<string, unknown> | undefined) {
  const existing = document.getElementById(id)
  if (existing) existing.remove()
  if (!data) return
  const script = document.createElement('script')
  script.id = id
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(data)
  document.head.appendChild(script)
}

export function Seo({ title, description, path = '/', image = DEFAULT_IMAGE, noIndex = false, type = 'website', jsonLd, keywords }: SeoProps) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`
    const url = `${SITE_URL}${path}`
    const absoluteImage = image.startsWith('http') ? image : `${SITE_URL}${image}`

    document.title = fullTitle
    setMetaTag('name', 'description', description)
    setMetaTag('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow')
    setCanonical(url)

    if (keywords) setMetaTag('name', 'keywords', keywords)
    else removeMetaTag('name', 'keywords')

    setMetaTag('property', 'og:type', type)
    setMetaTag('property', 'og:site_name', SITE_NAME)
    setMetaTag('property', 'og:title', fullTitle)
    setMetaTag('property', 'og:description', description)
    setMetaTag('property', 'og:url', url)
    setMetaTag('property', 'og:image', absoluteImage)

    setMetaTag('name', 'twitter:card', 'summary_large_image')
    setMetaTag('name', 'twitter:title', fullTitle)
    setMetaTag('name', 'twitter:description', description)
    setMetaTag('name', 'twitter:image', absoluteImage)

    setJsonLd('page-jsonld', jsonLd)

    return () => setJsonLd('page-jsonld', undefined)
  }, [title, description, path, image, noIndex, type, jsonLd, keywords])

  return null
}
