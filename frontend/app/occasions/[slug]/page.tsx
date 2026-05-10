import { Metadata } from 'next';
import OccasionClient from './OccasionClient';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const title = params.slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  return {
    title: `${title} | Pretty Luxe Atelier`,
    description: `Exquisite ${title.toLowerCase()} from Pretty Luxe Atelier. Personalized, artisanal gifts crafted for luxury and durability. Worldwide shipping.`,
  };
}

export default function OccasionPage({ params }: { params: { slug: string } }) {
  return <OccasionClient slug={params.slug} />;
}
