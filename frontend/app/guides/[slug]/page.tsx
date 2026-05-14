import { Metadata } from 'next';
import GuideClient from './GuideClient';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const title = slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  return {
    title: `${title} | Knowledge Base | Pretty Luxe Atelier`,
    description: `Expert advice on ${title.toLowerCase()}. Learn how to choose, care for, and gift premium artisanal products from Pretty Luxe Atelier.`,
    alternates: { canonical: `/guides/${slug}` },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <GuideClient slug={slug} />;
}
