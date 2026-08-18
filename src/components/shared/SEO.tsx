import { useEffect } from 'react'
import { create } from 'zustand'
import { useSettingsStore } from '@/store/settings.store'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  canonicalUrl?: string
  ogImage?: string
  ogType?: 'website' | 'book' | 'profile' | 'product'
  noIndex?: boolean
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
  const ogImage = page?.ogImage || `${window.location.origin}/ppd.png`
  /* Canonical never carries query strings — ?page=2&sort=… must not fragment ranking */
  const currentUrl = page?.canonicalUrl || `${window.location.origin}${window.location.pathname}`

  return (
    <>
      {/* Primary Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDesc} />
      <meta name="keywords" content={finalKeywords} />
      {page?.noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:site_name" content={settings?.siteName || 'PPD'} />
      <meta property="og:type" content={page?.ogType ?? 'website'} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDesc} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={currentUrl} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDesc} />
      <meta name="twitter:image" content={ogImage} />
    </>
  )
}

export default SEO
