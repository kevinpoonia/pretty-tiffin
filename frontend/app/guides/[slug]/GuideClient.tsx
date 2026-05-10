'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import KnowledgeSchema from '@/components/seo/KnowledgeSchema';
import { BookOpen, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const GUIDES: Record<string, any> = {
  'personalized-gifting-guide': {
    title: 'The Ultimate Guide to Personalized Gifting',
    content: `
      Choosing a gift is an art. Personalization adds a layer of thoughtfulness that transforms a standard item into a cherished memory.
      At Pretty Luxe Atelier, we believe that every name engraved on our stainless steel tiffins tells a story.
    `,
    steps: [
      { name: 'Understand the Occasion', text: 'Is it a wedding, an anniversary, or a corporate milestone?' },
      { name: 'Select the Material', text: 'Opt for food-grade 304 stainless steel for longevity and health.' },
      { name: 'Craft the Message', text: 'Choose a name, date, or a short meaningful quote for laser engraving.' },
      { name: 'Packaging Matters', text: 'Ensure the gift arrives in boutique-quality packaging for the best first impression.' }
    ],
    schemaType: 'HowTo'
  },
  'stainless-steel-care': {
    title: 'How to Care for Your Artisanal Stainless Steel',
    content: `
      Your Pretty Luxe Atelier tiffin is designed to last a lifetime. Proper care ensures it retains its mirror-like finish and structural integrity.
    `,
    steps: [
      { name: 'Hand Wash Recommended', text: 'Use mild soap and a soft sponge to avoid scratching the engraving.' },
      { name: 'Dry Immediately', text: 'Wipe with a soft cloth to prevent water spots and mineral buildup.' },
      { name: 'Avoid Abrasives', text: 'Never use steel wool or harsh chemicals on the surface.' }
    ],
    schemaType: 'HowTo'
  }
};

export default function GuideClient({ slug }: { slug: string }) {
  const guide = GUIDES[slug] || GUIDES['personalized-gifting-guide'];

  const schemaData = guide.schemaType === 'HowTo' ? {
    "name": guide.title,
    "description": guide.content,
    "step": guide.steps.map((s: any, i: number) => ({
      "@type": "HowToStep",
      "position": i + 1,
      "name": s.name,
      "itemListElement": [{ "@type": "HowToDirection", "text": s.text }]
    }))
  } : {};

  return (
    <>
      <KnowledgeSchema type={guide.schemaType} data={schemaData} />
      <Navbar alwaysSolid />
      <main className="min-h-screen bg-white pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link href="/shop" className="inline-flex items-center gap-2 text-brand-500 text-xs font-black uppercase tracking-widest mb-8 hover:gap-3 transition-all">
            <BookOpen size={14} /> Knowledge Base
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-heading text-stone-900 mb-8 leading-tight">{guide.title}</h1>
          
          <div className="prose prose-stone max-w-none">
            <p className="text-lg text-stone-600 leading-relaxed italic mb-12 border-l-4 border-brand-200 pl-6">
              {guide.content}
            </p>

            <div className="space-y-12">
              {guide.steps.map((step: any, i: number) => (
                <div key={i} className="relative pl-16">
                  <div className="absolute left-0 top-0 w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center font-heading text-xl text-brand-500 border border-brand-100">
                    {i + 1}
                  </div>
                  <h3 className="text-xl font-heading text-stone-800 mb-3">{step.name}</h3>
                  <p className="text-stone-600 leading-relaxed">{step.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-20 p-8 bg-brand-50 rounded-3xl border border-brand-100 text-center">
            <h3 className="text-2xl font-heading italic text-stone-800 mb-4">Ready to Create a Masterpiece?</h3>
            <p className="text-stone-600 mb-8">Apply these tips and browse our collection of customizable artisanal goods.</p>
            <Link href="/shop" className="bg-brand-500 text-white font-bold py-4 px-10 rounded-full inline-flex items-center gap-3 hover:bg-brand-600 transition-all shadow-xl shadow-brand-500/10 uppercase text-xs tracking-widest">
              Shop Collection <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
