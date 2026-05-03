import { Metadata, ResolvingMetadata } from 'next';
import ProductDetailClient from './ProductDetailView';
import Script from 'next/script';

export const revalidate = 3600;

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/products/${slug}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: 'Product Not Found' };

  const description = product.description.substring(0, 160);
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: product.name,
    description,
    alternates: { canonical: `/shop/${slug}` },
    keywords: [
      product.name, 'personalized tiffin', 'engraved gift',
      product.category, 'pretty luxe atelier', 'worldwide shipping',
      'custom tiffin box', 'laser engraved tiffin'
    ],
    openGraph: {
      title: `${product.name} | Pretty Luxe Atelier`,
      description,
      url: `https://prettyluxeatelier.com/shop/${slug}`,
      type: 'website',
      images: product.images?.[0]
        ? [{ url: product.images[0], alt: product.name }, ...previousImages]
        : previousImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: product.images?.[0] ? [product.images[0]] : [],
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <h1 className="text-2xl font-bold text-brand-900 mb-4">Product Not Found</h1>
      </div>
    );
  }

  const displayRating = Number(product.manualAvgRating || (product.reviews?.length
    ? product.reviews.reduce((s: number, r: any) => s + r.rating, 0) / product.reviews.length
    : 0));
  
  const displayReviewCount = Number(product.manualReviewCount || product.reviews?.length || 0);
  const cleanPrice = parseFloat(String(product.price).replace(/[^0-9.]/g, '')) || 0;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `https://prettyluxeatelier.com/shop/${product.slug}`,
    "name": product.name,
    "image": product.images || [],
    "description": product.description,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": "Pretty Luxe Atelier",
      "@id": "https://prettyluxeatelier.com/#organization"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://prettyluxeatelier.com/shop/${product.slug}`,
      "priceCurrency": "INR",
      "price": cleanPrice,
      "itemCondition": "https://schema.org/NewCondition",
      "priceValidUntil": new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "IN",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 7,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn"
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": { "@type": "MonetaryAmount", "value": "0", "currency": "USD" },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 2, "unitCode": "DAY" },
          "transitTime": { "@type": "QuantitativeValue", "minValue": 7, "maxValue": 14, "unitCode": "DAY" }
        },
        "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "US" }
      },
      "seller": {
        "@type": "Organization",
        "@id": "https://prettyluxeatelier.com/#organization",
        "name": "Pretty Luxe Atelier"
      }
    },
    ...(displayReviewCount > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": displayRating || 5.0,
        "reviewCount": displayReviewCount,
        "bestRating": 5,
        "worstRating": 1
      }
    } : {}),
    ...(product.reviews && product.reviews.length > 0 ? {
      "review": product.reviews.map((r: any) => ({
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": r.rating,
          "bestRating": 5,
          "worstRating": 1
        },
        "author": {
          "@type": "Person",
          "name": r.userName || "Verified Buyer"
        },
        "reviewBody": r.comment || "",
        "datePublished": r.createdAt || new Date().toISOString().split('T')[0]
      }))
    } : {})
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://prettyluxeatelier.com" },
      { "@type": "ListItem", "position": 2, "name": "Shop", "item": "https://prettyluxeatelier.com/shop" },
      { "@type": "ListItem", "position": 3, "name": product.name, "item": `https://prettyluxeatelier.com/shop/${slug}` }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `How long does shipping take for the ${product.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Worldwide shipping available. Standard delivery takes 7–14 business days globally. All items are securely packaged to ensure they arrive in pristine condition."
        }
      },
      {
        "@type": "Question",
        "name": `Can I personalize the ${product.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we offer precision laser engraving. You can add a custom name, message, or logo directly to the product."
        }
      },
      {
        "@type": "Question",
        "name": `What is the return policy for ${product.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We offer a 7-day return window. Customized or engraved items may have specific return conditions unless there is a manufacturing defect."
        }
      }
    ]
  };

  return (
    <>
      <ProductDetailClient product={product} />
      <Script id="product-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <Script id="breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </>
  );
}
