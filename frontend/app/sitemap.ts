import { MetadataRoute } from 'next';

const BASE = 'https://prettyluxeatelier.com';

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: BASE,                         lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
  { url: `${BASE}/shop`,               lastModified: new Date(), changeFrequency: 'daily',   priority: 0.95 },
  { url: `${BASE}/about`,              lastModified: new Date(), changeFrequency: 'monthly',  priority: 0.7 },
  { url: `${BASE}/contact`,            lastModified: new Date(), changeFrequency: 'monthly',  priority: 0.6 },
  { url: `${BASE}/faq`,                lastModified: new Date(), changeFrequency: 'monthly',  priority: 0.7 },
  { url: `${BASE}/blog`,               lastModified: new Date(), changeFrequency: 'weekly',   priority: 0.8 },
  { url: `${BASE}/gift`,               lastModified: new Date(), changeFrequency: 'weekly',   priority: 0.8 },
  { url: `${BASE}/gift/for-him`,       lastModified: new Date(), changeFrequency: 'weekly',   priority: 0.75 },
  { url: `${BASE}/gift-for-husband`,   lastModified: new Date(), changeFrequency: 'weekly',   priority: 0.75 },
  { url: `${BASE}/gift-cards`,         lastModified: new Date(), changeFrequency: 'monthly',  priority: 0.6 },
  { url: `${BASE}/bulk`,               lastModified: new Date(), changeFrequency: 'monthly',  priority: 0.7 },
  { url: `${BASE}/custom`,             lastModified: new Date(), changeFrequency: 'monthly',  priority: 0.7 },
  { url: `${BASE}/track`,              lastModified: new Date(), changeFrequency: 'monthly',  priority: 0.4 },
  { url: `${BASE}/shipping`,           lastModified: new Date(), changeFrequency: 'monthly',  priority: 0.5 },
  { url: `${BASE}/terms`,              lastModified: new Date(), changeFrequency: 'yearly',   priority: 0.3 },
  { url: `${BASE}/privacy`,            lastModified: new Date(), changeFrequency: 'yearly',   priority: 0.3 },
  // Category collection pages
  { url: `${BASE}/shop?category=personalized`,  lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
  { url: `${BASE}/shop?category=best-sellers`,  lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
  { url: `${BASE}/shop?category=birthday`,      lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  { url: `${BASE}/shop?category=anniversary`,   lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  { url: `${BASE}/shop?category=corporate`,     lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  { url: `${BASE}/shop?category=new-arrivals`,  lastModified: new Date(), changeFrequency: 'daily',  priority: 0.8 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let products: any[] = [];
  let blogPosts: any[] = [];

  try {
    const [prodRes, blogRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/products`).then(r => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/blog`).then(r => r.json()),
    ]);
    products = Array.isArray(prodRes) ? prodRes : [];
    blogPosts = Array.isArray(blogRes) ? blogRes : [];
  } catch (e) {
    console.error('Sitemap fetch failed', e);
  }

  const productUrls: MetadataRoute.Sitemap = products.map((p: any) => ({
    url: `${BASE}/shop/${p.slug}`,
    lastModified: new Date(p.updatedAt || Date.now()),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  const blogUrls: MetadataRoute.Sitemap = blogPosts.map((post: any) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt || Date.now()),
    changeFrequency: 'monthly',
    priority: 0.65,
  }));

  return [...STATIC_PAGES, ...productUrls, ...blogUrls];
}
