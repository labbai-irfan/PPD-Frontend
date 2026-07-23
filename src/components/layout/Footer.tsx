import { Link } from 'react-router-dom'
import { Mail, Phone } from 'lucide-react'
import { APP_NAME, ROUTES, CONTACT_INFO } from '@/lib/constants'
import { Logo } from '@/components/shared/Logo'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="hidden md:block bg-card border-t border-border mt-12 md:mt-16">
      <div className="mx-auto max-w-6xl px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Logo size={32} />
              <span className="font-bold text-foreground">{APP_NAME}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              India's trusted educational publisher since 1926
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-sm">Quick Links</h3>
            <ul className="space-y-0.5">
              <li>
                <Link to={ROUTES.home} className="inline-block py-1.5 text-sm text-muted-foreground hover:text-foreground">
                  Home
                </Link>
              </li>
              <li>
                <Link to={ROUTES.products} className="inline-block py-1.5 text-sm text-muted-foreground hover:text-foreground">
                  Products
                </Link>
              </li>
                <li>
                  <Link to={ROUTES.categories} className="inline-block py-1.5 text-sm text-muted-foreground hover:text-foreground">Categories</Link>
                </li>
              <li>
                <Link to={ROUTES.support} className="inline-block py-1.5 text-sm text-muted-foreground hover:text-foreground">
                  Support
                </Link>
              </li>
              <li>
                <Link to={ROUTES.contactUs} className="inline-block py-1.5 text-sm text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-sm">Information</h3>
            <ul className="space-y-0.5">
              <li>
                <Link to={ROUTES.about} className="inline-block py-1.5 text-sm text-muted-foreground hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link to={ROUTES.privacy} className="inline-block py-1.5 text-sm text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to={ROUTES.terms} className="inline-block py-1.5 text-sm text-muted-foreground hover:text-foreground">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to={ROUTES.help} className="inline-block py-1.5 text-sm text-muted-foreground hover:text-foreground">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-sm">Contact Us</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-foreground mb-1">{CONTACT_INFO.orders.title}</p>
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="size-3.5 text-muted-foreground flex-shrink-0" />
                  <a href={`mailto:${CONTACT_INFO.orders.email}`} className="text-xs text-muted-foreground hover:text-foreground break-all">
                    {CONTACT_INFO.orders.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-3.5 text-muted-foreground flex-shrink-0" />
                  <a href={`tel:${CONTACT_INFO.orders.phone.replace(/\s/g, '')}`} className="text-xs text-muted-foreground hover:text-foreground">
                    {CONTACT_INFO.orders.phone}
                  </a>
                </div>
              </div>

              <hr className="border-border" />

              <div>
                <p className="text-xs font-semibold text-foreground mb-1">{CONTACT_INFO.corporate.title}</p>
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="size-3.5 text-muted-foreground flex-shrink-0" />
                  <a href={`mailto:${CONTACT_INFO.corporate.email}`} className="text-xs text-muted-foreground hover:text-foreground break-all">
                    {CONTACT_INFO.corporate.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-3.5 text-muted-foreground flex-shrink-0" />
                  <a href={`tel:${CONTACT_INFO.corporate.phone.replace(/\s/g, '')}`} className="text-xs text-muted-foreground hover:text-foreground">
                    {CONTACT_INFO.corporate.phone}
                  </a>
                </div>
              </div>

              <hr className="border-border" />

              <div>
                <p className="text-xs font-semibold text-foreground mb-1">{CONTACT_INFO.general.title}</p>
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="size-3.5 text-muted-foreground flex-shrink-0" />
                  <a href={`mailto:${CONTACT_INFO.general.email}`} className="text-xs text-muted-foreground hover:text-foreground break-all">
                    {CONTACT_INFO.general.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-3.5 text-muted-foreground flex-shrink-0" />
                  <a href={`tel:${CONTACT_INFO.general.phone.replace(/\s/g, '')}`} className="text-xs text-muted-foreground hover:text-foreground">
                    {CONTACT_INFO.general.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground text-center md:text-left">
              © {currentYear} {APP_NAME} Store. All rights reserved.
            </p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <a href="https://facebook.com" className="inline-block py-2 hover:text-foreground">Facebook</a>
              <a href="https://twitter.com" className="inline-block py-2 hover:text-foreground">Twitter</a>
              <a href="https://instagram.com" className="inline-block py-2 hover:text-foreground">Instagram</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
