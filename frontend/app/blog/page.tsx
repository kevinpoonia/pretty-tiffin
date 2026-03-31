'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import api from '@/lib/api';
import { Calendar, Clock, ChevronRight, Loader2 } from 'lucide-react';

export default function BlogListingPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/blog').then(res => {
      setPosts(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="bg-white min-h-screen font-sans">
      <Navbar />
      
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="max-w-3xl mb-20">
             <motion.h1 
               {...fadeIn}
               className="text-4xl md:text-7xl font-heading font-black text-brand-900 tracking-tighter mb-8 leading-none"
             >
               The Pretty <br />
               <span className="text-brand-500 italic font-serif">Journal.</span>
             </motion.h1>
             <motion.p 
               {...fadeIn}
               transition={{ delay: 0.1 }}
               className="text-brand-500 text-lg leading-relaxed opacity-90"
             >
               Explore stories about Indian heritage, sustainable living, and the art of mindful gifting.
             </motion.p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40">
               <Loader2 className="animate-spin text-brand-500 mb-4" size={40} />
               <p className="text-[10px] font-black uppercase tracking-widest text-brand-400">Loading Journal...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
               {posts.map((post, i) => (
                 <motion.article 
                   key={post.id}
                   initial={{ opacity: 0, y: 30 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.1 }}
                   className="group cursor-pointer"
                 >
                    <Link href={`/blog/${post.slug}`}>
                       <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden mb-8 shadow-2xl shadow-brand-900/5 group-hover:shadow-brand-900/10 transition-all duration-500">
                          <Image 
                            src={post.coverImage || 'https://images.unsplash.com/photo-1544237562-ad116ca58a7d?q=80&w=2070&auto=format&fit=crop'} 
                            alt={post.title} 
                            fill 
                            className="object-cover group-hover:scale-110 transition-transform duration-700" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-brand-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                       </div>
                       <div className="space-y-4 px-2">
                          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-brand-400">
                             <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(post.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                             <span className="flex items-center gap-1.5"><Clock size={12} /> 5 min read</span>
                          </div>
                          <h2 className="text-2xl font-heading font-black text-brand-900 tracking-tight group-hover:text-brand-500 transition-colors line-clamp-2 leading-tight">
                            {post.title}
                          </h2>
                          <p className="text-brand-500 text-sm leading-relaxed line-clamp-3 opacity-80">
                             {post.summary}
                          </p>
                          <div className="pt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-900 group-hover:gap-4 transition-all">
                             Read Article <ChevronRight size={14} className="text-brand-500" />
                          </div>
                       </div>
                    </Link>
                 </motion.article>
               ))}
               
               {posts.length === 0 && !loading && (
                 <div className="col-span-full py-20 text-center bg-brand-50 rounded-[4rem] border border-dashed border-brand-200">
                    <p className="text-brand-400 font-bold uppercase tracking-widest text-xs">More stories coming soon...</p>
                 </div>
               )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
