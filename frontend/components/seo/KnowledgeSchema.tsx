'use client';

import Script from 'next/script';

interface KnowledgeSchemaProps {
  type: 'Article' | 'HowTo';
  data: any;
}

export default function KnowledgeSchema({ type, data }: KnowledgeSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": type,
    ...data,
    "publisher": { "@id": "https://prettyluxeatelier.com/#organization" }
  };

  return (
    <Script
      id={`knowledge-schema-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
