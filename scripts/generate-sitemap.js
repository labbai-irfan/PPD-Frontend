import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DOMAIN = 'https://popularbookworld.com'

const staticRoutes = [
  '',
  '/products',
  '/products/all',
  '/categories',
  '/packages',
  '/search',
  '/support',
  '/compare',
  '/bulk-order',
  '/gift-cards',
  '/contact-us',
  '/help',
  '/terms',
  '/privacy',
  '/about'
]

function generateSitemap() {
  const currentDate = new Date().toISOString().split('T')[0]
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  
  staticRoutes.forEach(route => {
    xml += '  <url>\n'
    xml += `    <loc>${DOMAIN}${route}</loc>\n`
    xml += `    <lastmod>${currentDate}</lastmod>\n`
    xml += '    <changefreq>daily</changefreq>\n'
    xml += '    <priority>0.8</priority>\n'
    xml += '  </url>\n'
  })
  
  xml += '</urlset>\n'
  
  // Write to public folder
  const publicPath = path.resolve(__dirname, '../public/sitemap.xml')
  fs.writeFileSync(publicPath, xml)
  console.log(`Sitemap successfully generated at: ${publicPath}`)

  // Also write to dist folder if it exists
  const distPath = path.resolve(__dirname, '../dist/sitemap.xml')
  const distDir = path.resolve(__dirname, '../dist')
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(distPath, xml)
    console.log(`Sitemap successfully copied to: ${distPath}`)
  }
}

generateSitemap()
