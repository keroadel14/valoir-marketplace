import { useI18n } from '@/i18n'

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  const { t } = useI18n()
  return (
    <div className="container-lux prose-invert max-w-3xl py-14">
      <p className="mb-2 text-xs uppercase tracking-wider text-champagne">{t.legal.draft}</p>
      <h1 className="section-title mb-8">{title}</h1>
      <div className="space-y-4 text-sm leading-relaxed text-[var(--muted)]">{children}</div>
    </div>
  )
}

export function PrivacyPage() {
  const { t } = useI18n()
  return (
    <Shell title={t.legal.privacy}>
      <p>VALOIR processes account, order, and technical data to operate the marketplace. Payments are processed by Stripe; card data is not stored by VALOIR.</p>
      <p>[PLACEHOLDER: legal entity name, jurisdiction, DPO contact]</p>
      <p>Users may request access or deletion subject to applicable law. This draft requires legal review before production use.</p>
    </Shell>
  )
}

export function TermsPage() {
  const { t } = useI18n()
  return (
    <Shell title={t.legal.terms}>
      <p>By using VALOIR you agree to marketplace rules for buyers and sellers, including accurate listings, lawful goods, and non-circumvention of platform payments.</p>
      <p>[PLACEHOLDER: governing law, dispute resolution]</p>
    </Shell>
  )
}

export function ShippingPage() {
  const { t } = useI18n()
  return (
    <Shell title={t.legal.shipping}>
      <p>Shipping is fulfilled by individual boutiques. Delivery times and carriers vary by seller and destination.</p>
    </Shell>
  )
}

export function ReturnsPage() {
  const { t } = useI18n()
  return (
    <Shell title={t.legal.returns}>
      <p>Return windows and conditions are set per boutique within platform policy. Refunds are processed through the original payment method when approved.</p>
    </Shell>
  )
}

export function AboutPage() {
  const { t } = useI18n()
  return (
    <Shell title={t.legal.about}>
      <p>VALOIR connects discerning buyers with independent luxury boutiques, designers, and jewelers worldwide.</p>
    </Shell>
  )
}

export function FaqPage() {
  const { t } = useI18n()
  return (
    <Shell title={t.legal.faq}>
      <p><strong>How do I become a seller?</strong> Register via Sell on VALOIR. Your boutique starts as Pending until verified.</p>
      <p><strong>Are reviews verified?</strong> Only eligible purchasers can submit product reviews when the review API is enabled.</p>
    </Shell>
  )
}

export function ContactPage() {
  const { t } = useI18n()
  return (
    <Shell title={t.legal.contact}>
      <p>[PLACEHOLDER: support email, response times]</p>
    </Shell>
  )
}
