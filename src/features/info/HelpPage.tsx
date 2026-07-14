import { useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

interface FaqItem {
  id: string
  question: string
  answer: string
  category: string
}

const faqs: FaqItem[] = [
  {
    id: '1',
    category: 'Orders',
    question: 'How do I track my order?',
    answer: 'You can track your order in the "My Orders" section of your profile. Click on any order to view its current status and estimated delivery date.',
  },
  {
    id: '2',
    category: 'Orders',
    question: 'Can I modify my order after placing it?',
    answer: 'Orders can be modified within 1 hour of placement. Contact our support team immediately if you need to make changes.',
  },
  {
    id: '3',
    category: 'Returns',
    question: 'What is your return policy?',
    answer: 'We offer 7-day returns on unused products in original packaging. Initiate a return from the order details page.',
  },
  {
    id: '4',
    category: 'Returns',
    question: 'How long does refund processing take?',
    answer: 'Refunds are processed within 5-7 business days after we receive and inspect the returned item.',
  },
  {
    id: '5',
    category: 'Payments',
    question: 'What payment methods do you accept?',
    answer: 'We accept credit cards, debit cards, UPI, and digital wallets like Google Pay and Apple Pay.',
  },
  {
    id: '6',
    category: 'Payments',
    question: 'Is my payment information secure?',
    answer: 'Yes, we use industry-standard SSL encryption to protect all payment transactions.',
  },
  {
    id: '7',
    category: 'Shipping',
    question: 'What are your shipping charges?',
    answer: 'Shipping is free for orders above ₹500. Orders below that have a flat shipping charge of ₹50.',
  },
  {
    id: '8',
    category: 'Shipping',
    question: 'Do you ship internationally?',
    answer: 'Currently, we ship only within India. We plan to expand internationally soon.',
  },
]

export default function HelpPage() {
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(search.toLowerCase()) ||
    faq.answer.toLowerCase().includes(search.toLowerCase()) ||
    faq.category.toLowerCase().includes(search.toLowerCase())
  )

  const categories = Array.from(new Set(faqs.map((f) => f.category)))

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Help & FAQ</h1>
        <p className="mt-2 text-sm text-muted-foreground">Find answers to common questions</p>
      </div>

      <Input
        type="search"
        placeholder="Search FAQs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftIcon={<Search className="size-4" />}
      />

      {search ? (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <Card className="p-4 md:p-6 text-center">
              <p className="text-muted-foreground">No results found</p>
            </Card>
          ) : (
            filtered.map((faq) => (
              <Card key={faq.id} className="p-4">
                <button
                  onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                  className="flex w-full min-h-11 items-center justify-between gap-3 text-left"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-primary">{faq.category}</span>
                    <p className="font-semibold text-foreground break-words">{faq.question}</p>
                  </div>
                  <ChevronDown
                    className={`size-5 shrink-0 text-muted-foreground transition-transform ${
                      expandedId === faq.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedId === faq.id && (
                  <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>
                )}
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="mb-3 font-semibold text-foreground">{category}</h3>
              <div className="space-y-2">
                {faqs
                  .filter((f) => f.category === category)
                  .map((faq) => (
                    <Card key={faq.id} className="p-4">
                      <button
                        onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                        className="flex w-full min-h-11 items-center justify-between gap-3 text-left"
                      >
                        <p className="font-semibold text-foreground break-words">{faq.question}</p>
                        <ChevronDown
                          className={`size-5 shrink-0 text-muted-foreground transition-transform ${
                            expandedId === faq.id ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {expandedId === faq.id && (
                        <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>
                      )}
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Card className="p-4 md:p-6 bg-primary/5">
        <h3 className="font-semibold text-foreground">Didn't find what you're looking for?</h3>
        <p className="mt-2 text-sm text-muted-foreground">Contact our support team</p>
        <a href="mailto:support@ppdstore.com" className="mt-1 inline-block py-2 text-primary font-semibold hover:underline break-words">
          support@ppdstore.com
        </a>
      </Card>
    </div>
  )
}
