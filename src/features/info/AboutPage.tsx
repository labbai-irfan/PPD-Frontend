import { Card } from '@/components/ui/Card'
import { CheckCircle } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">About PPD Store</h1>
        <p className="mt-3 text-base md:text-lg text-muted-foreground">
          India's trusted destination for educational and stationery products since 1926
        </p>
      </div>

      <Card className="p-4 md:p-6">
        <h2 className="text-2xl font-bold text-foreground">Our Story</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          PPD (Popular Publications & Distributors) has been a household name in educational publishing for over 95 years.
          What started as a small publishing house has grown into one of India's most trusted brands for educational
          materials, stationery, and learning aids.
        </p>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Today, we're committed to making quality educational products accessible to students across India through our
          modern online store and extensive distribution network.
        </p>
      </Card>

      <Card className="p-4 md:p-6">
        <h2 className="text-2xl font-bold text-foreground">Why Choose Us?</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            'Trusted brand with 95+ years of history',
            'Authentic and quality-assured products',
            'Wide selection of educational and stationery items',
            'Fast and reliable delivery',
            'Excellent customer support',
            'Competitive pricing and regular offers',
            'Secure payment options',
            'Easy returns and refunds',
          ].map((reason, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle className="size-5 text-success shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{reason}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 md:p-6">
        <h2 className="text-2xl font-bold text-foreground">Our Mission</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          To democratize access to quality educational and stationery products, making learning more affordable,
          accessible, and enjoyable for every student in India.
        </p>
      </Card>

      <Card className="p-4 md:p-6">
        <h2 className="text-2xl font-bold text-foreground">Our Vision</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          To be India's most loved and trusted online platform for educational products, serving millions of students
          and educators with innovative solutions and exceptional service.
        </p>
      </Card>

      <Card className="p-4 md:p-6 bg-primary/5">
        <h2 className="text-2xl font-bold text-foreground">Contact Us</h2>
        <div className="mt-4 space-y-2 text-muted-foreground break-words">
          <p>Email: <a href="mailto:support@ppdstore.com" className="text-primary hover:underline">support@ppdstore.com</a></p>
          <p>Phone: <a href="tel:1800555000" className="text-primary hover:underline">1800-555-000</a></p>
          <p>Address: PPD House, 123 Publishing Lane, Delhi - 110001</p>
        </div>
      </Card>
    </div>
  )
}
