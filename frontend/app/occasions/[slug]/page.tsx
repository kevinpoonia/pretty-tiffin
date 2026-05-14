import { Metadata } from 'next';
import OccasionClient from './OccasionClient';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const title = slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  return {
    title: `${title} | Pretty Luxe Atelier`,
    description: `Exquisite ${title.toLowerCase()} from Pretty Luxe Atelier. Personalized, artisanal gifts crafted for luxury and durability. Worldwide shipping.`,
    alternates: { canonical: `/occasions/${slug}` },
  };
}

export default async function OccasionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <OccasionClient slug={slug} />;
}
