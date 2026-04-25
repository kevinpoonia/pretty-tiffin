import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Journal – Stories on Gifting & Craftsmanship',
  description: 'Read the Pretty Luxe Atelier journal. Stories on artisanal craftsmanship, thoughtful gifting ideas, heritage recipes, and the art of personalization.',
  keywords: ['gifting blog', 'personalized gift ideas blog', 'tiffin gift ideas', 'artisanal craftsmanship stories'],
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Journal | Pretty Luxe Atelier',
    description: 'Stories on artisanal craftsmanship, thoughtful gifting, and heritage traditions.',
    url: 'https://prettyluxeatelier.com/blog',
    type: 'website',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
