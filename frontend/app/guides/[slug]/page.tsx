import { Metadata } from 'next';
import GuideClient from './GuideClient';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const title = params.slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  return {
    title: `${title} | Knowledge Base | Pretty Luxe Atelier`,
    description: `Expert advice on ${title.toLowerCase()}. Learn how to choose, care for, and gift premium artisanal products from Pretty Luxe Atelier.`,
  };
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  return <GuideClient slug={params.slug} />;
}
