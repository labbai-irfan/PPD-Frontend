import { Card } from '@/components/ui/Card'

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>

      <Card className="p-4 md:p-6 prose dark:prose-invert max-w-none">
        <h2 className="text-lg font-semibold mt-0">1. Information We Collect</h2>
        <p className="text-sm text-muted-foreground">
          We collect information you provide directly, such as name, email, phone, and address.
          We also collect information automatically, including IP address, browser type, and browsing behavior.
        </p>

        <h2 className="text-lg font-semibold">2. How We Use Information</h2>
        <p className="text-sm text-muted-foreground">
          Your information is used to:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
          <li>• Process orders and payments</li>
          <li>• Provide customer support</li>
          <li>• Send promotional emails and notifications</li>
          <li>• Improve our services</li>
          <li>• Comply with legal obligations</li>
        </ul>

        <h2 className="text-lg font-semibold">3. Data Security</h2>
        <p className="text-sm text-muted-foreground">
          We implement industry-standard security measures to protect your personal information.
          However, no method of transmission over the internet is 100% secure.
        </p>

        <h2 className="text-lg font-semibold">4. Third-Party Sharing</h2>
        <p className="text-sm text-muted-foreground">
          We do not sell your personal information. We may share data with service providers who assist
          in our operations, including payment processors and delivery partners.
        </p>

        <h2 className="text-lg font-semibold">5. Cookies</h2>
        <p className="text-sm text-muted-foreground">
          We use cookies to enhance your browsing experience. You can control cookie settings in your browser.
        </p>

        <h2 className="text-lg font-semibold">6. Your Rights</h2>
        <p className="text-sm text-muted-foreground">
          You have the right to access, correct, or delete your personal information.
          Contact us at popularbookworld71@gmail.com to exercise these rights.
        </p>

        <h2 className="text-lg font-semibold">7. Contact Us</h2>
        <p className="text-sm text-muted-foreground">
          For privacy-related inquiries, contact: privacy@ppdstore.com
        </p>

        <p className="text-xs text-muted-foreground mt-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </Card>
    </div>
  )
}
