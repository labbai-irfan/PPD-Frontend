import { useEffect } from 'react'
import { create } from 'zustand'
import { useSettingsStore } from '@/store/settings.store'
import { SITE_URL } from '@/lib/constants'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  canonicalUrl?: string
  ogImage?: string
  ogType?: 'website' | 'book' | 'profile' | 'product'
  noIndex?: boolean
  ogLocale?: string
  ogImageAlt?: string
  twitterSite?: string
  twitterCreator?: string
  author?: string
}

/*
 * React 19 hoists <title>/<meta>/<link> to <head> but does NOT dedupe them, so
 * exactly one <SEOTags> (in AppProviders) renders the real tags. Page-level
 * <SEO> calls just publish their props here and render nothing — pages without
 * one fall back to the admin SEO settings.
 */
const usePageSeo = create<{ page: SEOProps | null }>(() => ({ page: null }))

export function SEO(props: SEOProps) {
  useEffect(() => {
    usePageSeo.setState({ page: props })
    return () => usePageSeo.setState({ page: null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(props)])
  return null
}

/** The single source of head tags — mount exactly once, above the router. */
export function SEOTags() {
  const page = usePageSeo((s) => s.page)
  const settings = useSettingsStore((s) => s.settings)

  const defaultTitle = settings?.seoTitle || 'PPD — Everything for School'
  const defaultDesc =
    settings?.seoDescription ||
    "PPD — Everything for School. India's trusted educational publisher since 1926."
  const defaultKeywords = settings?.seoKeywords || 'school books, educational books, school supplies'

  const finalTitle = page?.title ? `${page.title} | ${settings?.siteName || 'PPD'}` : defaultTitle
  const finalDesc = page?.description || defaultDesc
  const finalKeywords = page?.keywords || defaultKeywords
  /* /ppd.png ships in public/; the old banner URL pointed at a file (and domain) that doesn't exist */
  const ogImage = page?.ogImage || `${SITE_URL}/ppd.png`
  /* Pinned origin (www and apex both serve the site) and no query strings —
     every host/filter variant must declare the same canonical page. */
  const currentUrl = page?.canonicalUrl || `${SITE_URL}${window.location.pathname}`

  return (
    <>
      {/* Primary Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDesc} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="author" content={page?.author || settings?.siteName || 'PPD'} />
      {page?.noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:site_name" content={settings?.siteName || 'PPD'} />
      <meta property="og:type" content={page?.ogType ?? 'website'} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDesc} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:locale" content={page?.ogLocale || 'en_IN'} />
      {page?.ogImageAlt && <meta property="og:image:alt" content={page.ogImageAlt} />}

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDesc} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:url" content={currentUrl} />
      {(page?.twitterSite || '@popularbookworld') && (
        <meta name="twitter:site" content={page?.twitterSite || '@popularbookworld'} />
      )}
      {page?.twitterCreator && <meta name="twitter:creator" content={page.twitterCreator} />}
      {page?.ogImageAlt && <meta name="twitter:image:alt" content={page.ogImageAlt} />}
    </>
  )
}

export default SEO
