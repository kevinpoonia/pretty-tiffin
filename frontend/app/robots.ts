import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/admin/*',
        '/account',
        '/account/*',
        '/checkout',
        '/order-confirmation',
      ],
    },
    sitemap: 'https://prettyluxeatelier.com/sitemap.xml',
  };
}
