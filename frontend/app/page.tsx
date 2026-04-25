import { Metadata } from 'next';
import HomeClient from './HomeClient';
import Script from 'next/script';

async function getHomeData() {
  try {
    const [prodRes, bannerRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/products`, { next: { revalidate: 60 } }).then(res => res.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/banners`, { next: { revalidate: 300 } }).then(res => res.json())
    ]);
    return { products: prodRes || [], banners: bannerRes || [] };
  } catch (e) {
    return { products: [], banners: [] };
  }
}

export const metadata: Metadata = {
  title: 'Pretty Luxe Atelier | Personalized Tiffin Boxes & Engraved Gifts',
  description: 'Premium personalized stainless steel tiffin boxes with precision laser engraving. Perfect for birthdays, anniversaries, corporate gifting, and everyday use. Worldwide shipping.',
  alternates: { canonical: 'https://prettyluxeatelier.com' },
  keywords: [
    'personalized tiffin box', 'engraved tiffin gift', 'custom tiffin box',
    'laser engraved gift', 'personalized gift for husband', 'anniversary gift tiffin',
    'birthday gift tiffin', 'corporate gift tiffin', 'stainless steel tiffin',
    'pretty luxe atelier', 'worldwide tiffin gift'
  ],
};

export default async function Home() {
  const { products, banners } = await getHomeData();

  const homeFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best personalized gift for any occasion?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A high-quality, laser-engraved stainless steel tiffin box is a timeless and practical gift. Personalized with a name, date, or message, it combines sentiment with everyday utility and lasts a lifetime."
        }
      },
      {
        "@type": "Question",
        "name": "How long does worldwide shipping take for customized tiffins?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Standard international delivery takes 7–14 business days. Express shipping is available for 3–7 business days. Free shipping is included on all orders."
        }
      },
      {
        "@type": "Question",
        "name": "Can I engrave a company logo for corporate gifting?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! We specialize in corporate gifting. Engrave individual names, company logos, or custom messages for a premium branded experience. Bulk pricing available for 20+ units."
        }
      },
      {
        "@type": "Question",
        "name": "What materials are used in Pretty Luxe Atelier tiffin boxes?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We use food-grade stainless steel (304 series) — rust-proof, BPA-free, and built to last a lifetime. All engravings are done with precision laser technology for permanent, fade-resistant results."
        }
      }
    ]
  };

  return (
    <>
      <HomeClient initialProducts={products} initialBanners={banners} />
      <Script id="home-faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqSchema) }} />
    </>
  );
}
