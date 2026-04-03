import { permanentRedirect } from 'next/navigation';

export default function LegacyCustomPage() {
  permanentRedirect('/shop?category=personalized');
}
