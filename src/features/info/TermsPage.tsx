import { Card } from '@/components/ui/Card'

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Terms & Conditions</h1>

      <Card className="p-4 md:p-6 prose dark:prose-invert max-w-none">
        <h2 className="text-lg font-semibold mt-0">1. Introduction</h2>
        <p className="text-sm text-muted-foreground">
          Welcome to PPD Store. These Terms & Conditions govern your use of our website and services.
          By accessing our site, you agree to comply with these terms.
        </p>

        <h2 className="text-lg font-semibold">2. User Responsibilities</h2>
        <p className="text-sm text-muted-foreground">
          Users agree to:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
          <li>• Use the platform lawfully and responsibly</li>
          <li>• Not engage in any fraudulent or harmful activities</li>
          <li>• Maintain the confidentiality of account credentials</li>
          <li>• Provide accurate information during registration</li>
        </ul>

        <h2 className="text-lg font-semibold">3. Product Information</h2>
        <p className="text-sm text-muted-foreground">
          We strive to provide accurate product descriptions and pricing. However, PPD Store does not warrant
          the accuracy, completeness, or quality of any product information displayed on our site.
        </p>

        <h2 className="text-lg font-semibold">4. Orders and Payment</h2>
        <p className="text-sm text-muted-foreground">
          All orders are subject to acceptance and availability. We reserve the right to refuse or cancel
          any order. Payment must be received before order fulfillment.
        </p>

        <h2 className="text-lg font-semibold">5. Return Policy</h2>
        <p className="text-sm text-muted-foreground">
          Products may be returned within 7 days of delivery if they are unused and in original packaging.
          Refunds will be processed within 5-7 business days after inspection.
        </p>

        <h2 className="text-lg font-semibold">6. Limitation of Liability</h2>
        <p className="text-sm text-muted-foreground">
          PPD Store shall not be liable for any indirect, incidental, special, or consequential damages
          arising from your use of our services.
        </p>

        <h2 className="text-lg font-semibold">7. Modifications</h2>
        <p className="text-sm text-muted-foreground">
          We reserve the right to modify these terms at any time. Changes will be effective immediately
          upon posting to the website.
        </p>

        <p className="text-xs text-muted-foreground mt-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </Card>
    </div>
  )
}
