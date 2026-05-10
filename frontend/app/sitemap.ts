import { MetadataRoute } from 'next';

const BASE_URL = 'https://prettyluxeatelier.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const routes = [
    '',
    '/shop',
    '/about',
    '/contact',
    '/cart',
    '/wishlist',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic routes (Products)
  try {
    const res = await fetch(`${API_URL}/products`);
    const data = await res.json();
    const products = Array.isArray(data) ? data : (data.products || []);

    const productRoutes = products.map((product: any) => ({
      url: `${BASE_URL}/shop/${product.slug}`,
      lastModified: new Date(product.updatedAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Occasion routes
    const occasionRoutes = [
      'corporate-gifts', 'wedding-favors', 'anniversary-specials', 'luxury-essentials'
    ].map(slug => ({
      url: `${BASE_URL}/occasions/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }));

    // Guide routes
    const guideRoutes = [
      'personalized-gifting-guide', 'stainless-steel-care'
    ].map(slug => ({
      url: `${BASE_URL}/guides/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    }));

    return [...routes, ...productRoutes, ...occasionRoutes, ...guideRoutes];
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return routes;
  }
}
