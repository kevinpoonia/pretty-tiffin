'use client';

import Script from 'next/script';

interface BreadcrumbSchemaProps {
  items: { name: string; item: string }[];
}

export default function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://prettyluxeatelier.com${item.item}`
    }))
  };

  return (
    <Script
      id={`breadcrumb-schema`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
