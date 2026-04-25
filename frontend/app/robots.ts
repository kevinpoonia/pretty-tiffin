import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/account/', '/checkout/', '/order-confirmation/', '/api/'],
      },
      // Allow major AI crawlers for GEO (Generative Engine Optimization)
      { userAgent: 'GPTBot',       allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'Claude-Web',   allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
      { userAgent: 'PerplexityBot',allow: '/' },
      { userAgent: 'cohere-ai',    allow: '/' },
      { userAgent: 'Googlebot',    allow: '/' },
      { userAgent: 'Bingbot',      allow: '/' },
    ],
    sitemap: 'https://prettyluxeatelier.com/sitemap.xml',
    host: 'https://prettyluxeatelier.com',
  };
}
