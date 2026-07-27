import { Helmet } from 'react-helmet-async'
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

export function SEO({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage = "https://popularpublishinghouse.com/ppd-share-banner.png",
  ogType = "website",
  noIndex = false,
}: SEOProps) {
  const settings = useSettingsStore((s) => s.settings)

  const defaultTitle = settings?.seoTitle || "PPD — Everything for School"
  const defaultDesc = settings?.seoDescription || "PPD — Everything for School. India's trusted educational publisher since 1926."
  const defaultKeywords = settings?.seoKeywords || "school books, educational books, school supplies"

  const finalTitle = title ? `${title} | ${settings?.siteName || 'PPD'}` : defaultTitle
  const finalDesc = description || defaultDesc
  const finalKeywords = keywords || defaultKeywords
  const currentUrl = canonicalUrl || window.location.href

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDesc} />
      <meta name="keywords" content={finalKeywords} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDesc} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={currentUrl} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDesc} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  )
}
export default SEO
