import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gifting Guide – Find the Perfect Gift',
  description: 'Not sure what to gift? Browse our curated gifting guide for birthdays, anniversaries, corporate events, and more. Personalized tiffin boxes for every occasion.',
  keywords: ['gift guide', 'personalized gift ideas', 'gifting tiffin box', 'birthday gift ideas', 'anniversary gifts', 'unique gifts'],
  alternates: { canonical: '/gift' },
  openGraph: {
    title: 'Gifting Guide | Pretty Luxe Atelier',
    description: 'Find the perfect personalized tiffin gift for any occasion — birthdays, anniversaries, corporate events, and more.',
    url: 'https://prettyluxeatelier.com/gift',
  },
};

export default function GiftLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
