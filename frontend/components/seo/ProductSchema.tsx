'use client';

import Script from 'next/script';
import { useCurrency } from '@/context/CurrencyContext';

interface ProductSchemaProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    compareAtPrice?: number;
    images: string[];
    slug: string;
    category: string;
    stock: number;
    manualAvgRating?: number;
    manualReviewCount?: number;
    currencyPrices?: { currency: string; price: number; symbol: string }[];
    reviews?: { rating: number; comment: string; createdAt: string; user?: { name: string } }[];
  };
}

export default function ProductSchema({ product }: ProductSchemaProps) {
  const { currency, currencyInfo } = useCurrency();

  // Find price for the current currency
  const manualPrice = product.currencyPrices?.find(p => p.currency === currency);
  const displayPrice = manualPrice ? manualPrice.price : product.price; 
  const displayCurrency = manualPrice ? manualPrice.currency : 'INR';

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `https://prettyluxeatelier.com/shop/${product.slug}#product`,
    "name": product.name,
    "image": product.images,
    "description": product.description,
    "sku": product.id,
    "mpn": product.id,
    "brand": { "@id": "https://prettyluxeatelier.com/#organization" },
    "material": "304 Food-Grade Stainless Steel",
    "offers": {
      "@type": "Offer",
      "url": `https://prettyluxeatelier.com/shop/${product.slug}`,
      "priceCurrency": displayCurrency,
      "price": displayPrice,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": { "@id": "https://prettyluxeatelier.com/#organization" },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingDestination": { "@type": "DefinedRegion", "addressCountry": ["IN", "US", "GB", "AU", "ZA", "MU", "EU"] },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 3, "unitCode": "DAY" },
          "transitTime": { "@type": "QuantitativeValue", "minValue": 3, "maxValue": 14, "unitCode": "DAY" }
        }
      }
    },
    "category": product.category,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.manualAvgRating || "4.8",
      "reviewCount": product.manualReviewCount || "120",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": product.reviews?.slice(0, 5).map(r => ({
      "@type": "Review",
      "author": { "@type": "Person", "name": r.user?.name || "Verified Buyer" },
      "datePublished": r.createdAt,
      "reviewBody": r.comment,
      "reviewRating": { "@type": "Rating", "ratingValue": r.rating, "bestRating": "5", "worstRating": "1" }
    })) || []
  };

  return (
    <Script
      id={`product-schema-${product.id}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
