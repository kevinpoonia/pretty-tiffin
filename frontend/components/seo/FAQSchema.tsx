'use client';

import Script from 'next/script';

interface FAQSchemaProps {
  mainEntity: {
    question: string;
    answer: string;
  }[];
}

export default function FAQSchema({ mainEntity }: FAQSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": mainEntity.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  return (
    <Script
      id={`faq-schema`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
