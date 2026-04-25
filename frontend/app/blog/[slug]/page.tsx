import type { Metadata, ResolvingMetadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BlogDetailClient from './BlogDetailClient';

export const revalidate = 3600;

async function getBlogPost(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/blog/${slug}`,
      { next: { revalidate: 3600 } }
    );
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
  const post = await getBlogPost(slug);
  if (!post) return { title: 'Article Not Found' };

  const previousImages = (await parent).openGraph?.images || [];
  const description = (post.summary || post.title || '').substring(0, 160);

  return {
    title: post.title,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: `${post.title} | Pretty Luxe Atelier Journal`,
      description,
      url: `https://prettyluxeatelier.com/blog/${slug}`,
      type: 'article',
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt || post.createdAt,
      authors: ['Pretty Luxe Atelier'],
      images: post.coverImage ? [{ url: post.coverImage, alt: post.title }, ...previousImages] : previousImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return (
      <div className="bg-white min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[70vh] text-center px-6">
          <h1 className="text-3xl font-heading font-black text-brand-900 mb-4">Post not found.</h1>
          <p className="text-brand-500 mb-8">This article might have been moved or deleted.</p>
          <Link href="/blog" className="px-8 py-4 bg-brand-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">
            Back to Journal
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `https://prettyluxeatelier.com/blog/${slug}`,
    "headline": post.title,
    "description": post.summary || post.title,
    "image": post.coverImage || 'https://prettyluxeatelier.com/og-image.jpg',
    "datePublished": post.createdAt,
    "dateModified": post.updatedAt || post.createdAt,
    "author": {
      "@type": "Organization",
      "@id": "https://prettyluxeatelier.com/#organization",
      "name": "Pretty Luxe Atelier"
    },
    "publisher": {
      "@type": "Organization",
      "@id": "https://prettyluxeatelier.com/#organization",
      "name": "Pretty Luxe Atelier",
      "logo": { "@type": "ImageObject", "url": "https://prettyluxeatelier.com/logo.png" }
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": `https://prettyluxeatelier.com/blog/${slug}` },
    "isPartOf": { "@id": "https://prettyluxeatelier.com/#website" },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://prettyluxeatelier.com" },
        { "@type": "ListItem", "position": 2, "name": "Journal", "item": "https://prettyluxeatelier.com/blog" },
        { "@type": "ListItem", "position": 3, "name": post.title, "item": `https://prettyluxeatelier.com/blog/${slug}` }
      ]
    }
  };

  return (
    <>
      <BlogDetailClient post={post} />
      <Script id="article-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
    </>
  );
}
