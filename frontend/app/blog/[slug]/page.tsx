'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import api from '@/lib/api';
import { Calendar, Clock, ArrowLeft, Loader2, Share2, Bookmark } from 'lucide-react';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      api.get(`/blog/${slug}`).then(res => {
        setPost(res.data);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[70vh]">
           <Loader2 className="animate-spin text-brand-500 mb-4" size={40} />
           <p className="text-[10px] font-black uppercase tracking-widest text-brand-400">Opening Journal...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="bg-white min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[70vh] text-center px-6">
           <h1 className="text-3xl font-heading font-black text-brand-900 mb-4">Post not found.</h1>
           <p className="text-brand-500 mb-8">This article might have been moved or deleted.</p>
           <Link href="/blog" className="px-8 py-4 bg-brand-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Back to Journal</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-brand-500 selection:text-white">
      <Navbar />
      
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-4xl">
           {/* Header */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="mb-12"
           >
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-400 hover:text-brand-900 transition-colors mb-10"
              >
                <ArrowLeft size={14} /> Back to Journal
              </button>
              
              <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-brand-500 mb-6 font-bold">
                 <span className="flex items-center gap-1.5 px-3 py-1 bg-brand-50 rounded-full"><Calendar size={12} /> {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                 <span className="flex items-center gap-1.5 px-3 py-1 bg-brand-50 rounded-full"><Clock size={12} /> 5 min read</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-heading font-black text-brand-900 tracking-tighter mb-8 leading-tight">
                {post.title}
              </h1>
              
              <p className="text-xl text-brand-500 italic font-serif leading-relaxed opacity-90 border-l-4 border-brand-500 pl-6 my-10 bg-brand-50/30 py-6 rounded-r-2xl">
                {post.summary}
              </p>
           </motion.div>

           {/* Featured Image */}
           <motion.div 
             initial={{ opacity: 0, scale: 1.05 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 1 }}
             className="relative aspect-[21/10] rounded-[3rem] overflow-hidden mb-16 shadow-2xl shadow-brand-900/10"
           >
              <Image 
                src={post.coverImage || 'https://images.unsplash.com/photo-1544237562-ad116ca58a7d?q=80&w=2070&auto=format&fit=crop'} 
                alt={post.title} 
                fill 
                className="object-cover" 
              />
           </motion.div>

           {/* Content */}
           <article className="prose prose-brand prose-lg max-w-none prose-headings:font-heading prose-headings:font-black prose-headings:tracking-tighter prose-p:text-brand-700 prose-p:leading-relaxed prose-li:text-brand-700">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
           </article>

           {/* Actions */}
           <div className="mt-20 pt-10 border-t border-brand-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <button className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-900 flex items-center justify-center hover:bg-brand-900 hover:text-white transition-all shadow-sm">
                    <Share2 size={20} />
                 </button>
                 <button className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-900 flex items-center justify-center hover:bg-brand-900 hover:text-white transition-all shadow-sm">
                    <Bookmark size={20} />
                 </button>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-400">
                Topic: Heritage & Gifting
              </p>
           </div>
           
           {/* Related / Newsletter */}
           <div className="mt-24 p-12 bg-brand-900 rounded-[4rem] text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-800 rounded-full blur-3xl opacity-50 -mr-32 -mt-32" />
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                 <div>
                    <h3 className="text-3xl font-heading font-black tracking-tighter mb-4 leading-none">Subscribe to Our <br />Monthly Journal.</h3>
                    <p className="text-brand-300 text-xs font-bold uppercase tracking-widest leading-loose">Get curated stories about slow living, heritage recipes, and mindful gifting directly in your inbox.</p>
                 </div>
                 <form className="flex gap-4">
                    <input type="email" placeholder="Email Address" className="flex-1 bg-brand-800 border-none rounded-2xl p-5 text-sm font-bold text-white placeholder-brand-400 focus:ring-4 focus:ring-brand-500/20 outline-none" />
                    <button className="px-8 py-5 bg-white text-brand-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-100 transition-all shadow-xl active:scale-95">Join</button>
                 </form>
              </div>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
