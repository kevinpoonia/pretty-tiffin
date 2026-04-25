import { Metadata, ResolvingMetadata } from 'next';
import ProductDetailClient from './ProductDetailView';
import Script from 'next/script';

export const revalidate = 3600; // ISR: rebuild pages at most once per hour

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/products/${slug}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: 'Product Not Found' };
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: product.name,
    description: product.description.substring(0, 160),
    openGraph: {
      title: `${product.name} | Pretty Luxe Atelier`,
      description: product.description.substring(0, 160),
      images: [product.images?.[0], ...previousImages],
    },
    keywords: [product.name, 'customized tiffin', 'personalized gift', product.category, 'pretty luxe atelier', 'worldwide shipping'],
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images || [],
    "description": product.description,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": "Pretty Luxe Atelier"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://prettyluxeatelier.com/shop/${product.slug}`,
      "priceCurrency": "INR",
      "price": product.price,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Pretty Luxe Atelier"
      }
    }
  };

  return (
    <>
      <ProductDetailClient product={product} />
      <Script
        id="product-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
