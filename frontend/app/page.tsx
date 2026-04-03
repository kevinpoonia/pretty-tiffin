import { Metadata } from 'next';
import HomeClient from './HomeClient';
import Script from 'next/script';

async function getHomeData() {
  try {
    const [prodRes, bannerRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/products`, { next: { revalidate: 3600 } }).then(res => res.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/banners`, { next: { revalidate: 300 } }).then(res => res.json())
    ]);
    return { products: prodRes || [], banners: bannerRes || [] };
  } catch (e) {
    return { products: [], banners: [] };
  }
}

export const metadata: Metadata = {
  title: 'Personalized Gifts India | Customized Tiffin Boxes & More',
  description: 'Shop the best personalized gifts in India. Discover unique, engraved stainless steel tiffins for husband, wife, and kids. Express delivery across all major cities.',
};

export default async function Home() {
  const { products, banners } = await getHomeData();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best personalized gift for a husband in India?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The best personalized gift is a high-quality, engraved stainless steel tiffin box. It combines practicality for work lunches with a sentimental touch that lasts a lifetime."
        }
      },
      {
        "@type": "Question",
        "name": "How long does shipping take for customized tiffins?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We offer express shipping across India. Standard delivery takes 3-5 business days, while metro cities often receive orders within 48-72 hours."
        }
      },
      {
        "@type": "Question",
        "name": "Can I engrave a logo for corporate gifting?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we specialize in corporate gifting. You can engrave individual names or company logos for a premium, sustainable branding experience."
        }
      }
    ]
  };

  return (
    <>
      <HomeClient initialProducts={products} initialBanners={banners} />
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}
