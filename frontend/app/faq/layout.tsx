import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'FAQ – Frequently Asked Questions',
  description: 'Got questions about our personalized tiffin boxes? Find answers on materials, laser engraving, worldwide shipping, delivery times, and corporate bulk orders.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'FAQ | Pretty Luxe Atelier',
    description: 'Everything you need to know about our personalized tiffin boxes, engraving, shipping, and corporate gifting.',
    url: 'https://prettyluxeatelier.com/faq',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What grade of stainless steel do you use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We use premium food-grade stainless steel (304 series) for all our tiffin boxes. It is rust-proof, BPA-free, and designed to last a lifetime."
      }
    },
    {
      "@type": "Question",
      "name": "Are the tiffins leak-proof?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most of our multi-tier tiffins are designed for semi-solid foods. For liquids, we recommend our specialized Deep series which features silicone gaskets for a leak-proof seal."
      }
    },
    {
      "@type": "Question",
      "name": "How long does engraving take?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Custom engraving typically adds 1-2 business days to our processing time. We use precision laser technology to ensure high-quality, permanent results."
      }
    },
    {
      "@type": "Question",
      "name": "Will the engraving fade over time?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Our laser engraving process physically alters the surface of the steel, making it permanent and resistant to washing or wear."
      }
    },
    {
      "@type": "Question",
      "name": "How long does delivery take?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Standard delivery takes 7-14 business days internationally. Express shipping is available at checkout for 3-7 business days."
      }
    },
    {
      "@type": "Question",
      "name": "Do you ship worldwide?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! We ship to most countries worldwide. Free shipping is included on all orders."
      }
    },
    {
      "@type": "Question",
      "name": "Do you offer discounts for bulk orders?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, we have specialized pricing for corporate gifting and bulk orders (20+ units). Reach out to us at sales@prettyluxeatelier.com."
      }
    },
    {
      "@type": "Question",
      "name": "Can I use these tiffins in a microwave?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No, stainless steel is not microwave-safe. However, you can safely heat them in a conventional oven or by placing the containers in boiling water."
      }
    },
    {
      "@type": "Question",
      "name": "Can I engrave emojis or custom logos?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We currently support standard alphanumeric characters and a selection of premium symbols. For custom logos or bulk orders, please contact our support team."
      }
    },
    {
      "@type": "Question",
      "name": "Can you provide custom packaging for events?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely. We offer premium gift-wrapping and can include personalized thank-you notes for large-scale events."
      }
    }
  ]
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </>
  );
}
