'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function ContactPage() {
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSent(true);
    setFormState({ name: '', email: '', subject: '', message: '' });
  };


  return (
    <div className="bg-white min-h-screen font-sans">
      <Navbar />
      
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-20">
            
            {/* Left: Contact Info */}
            <div className="lg:w-2/5 space-y-12">
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.6 }}
               >
                  <h1 className="text-4xl md:text-6xl font-heading font-black text-brand-900 tracking-tighter mb-6 leading-none">
                    Let&apos;s Start a <br />
                    <span className="text-brand-500 italic font-serif">Conversation.</span>
                  </h1>
                  <p className="text-brand-500 text-lg leading-relaxed max-w-md">
                    Have a question about our tiffins or want to discuss a bulk gifting order? We&apos;re here to help you create something special.
                  </p>
               </motion.div>

               <div className="space-y-8">
                  {[
                    { icon: Mail, label: 'Email Us', value: 'hello@prettyluxeatelier.com', detail: 'We reply within 24 hours' },
                    { icon: Phone, label: 'Call Us', value: '+91 99999 88888', detail: 'Mon-Sat, 9am - 7pm IST' },
                    { icon: MessageCircle, label: 'WhatsApp', value: '+91 99999 88888', detail: 'Instant support available' },
                    { icon: MapPin, label: 'Studio', value: 'Udaipur, India', detail: 'Crafting excellence worldwide' },
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-6 group"
                    >
                       <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-brand-900 group-hover:text-white transition-all duration-300">
                          <item.icon size={20} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-brand-400 mb-1">{item.label}</p>
                          <p className="text-lg font-black text-brand-900 tracking-tight">{item.value}</p>
                          <p className="text-xs text-brand-500 mt-1">{item.detail}</p>
                       </div>
                    </motion.div>
                  ))}
               </div>

               <motion.div 
                 initial={{ opacity: 0 }}
                 whileInView={{ opacity: 1 }}
                 className="p-8 bg-brand-50 rounded-[2.5rem] border border-brand-100 flex items-center gap-6"
               >
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                     <Clock className="text-brand-400" size={20} />
                  </div>
                  <div>
                     <p className="text-xs font-bold text-brand-900">Average Response Time</p>
                     <p className="text-[10px] font-black uppercase text-brand-500 tracking-widest">under 2 hours during business hours</p>
                  </div>
               </motion.div>
            </div>

            {/* Right: Contact Form */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="lg:w-3/5"
            >
               <div className="bg-white p-10 md:p-16 rounded-[4rem] border border-brand-100 shadow-2xl shadow-brand-900/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full blur-3xl opacity-50 -mr-32 -mt-32" />
                  
                  <h3 className="text-2xl font-heading font-black text-brand-900 tracking-tight mb-10">Send us a Message</h3>
                  
                  {isSent ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-20"
                    >
                       <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                          <Send size={32} />
                       </div>
                       <h4 className="text-2xl font-black text-brand-900 mb-2">Message Sent!</h4>
                       <p className="text-brand-500">Thank you for reaching out. We&apos;ll get back to you shortly.</p>
                       <button 
                         onClick={() => setIsSent(false)}
                         className="mt-8 text-xs font-black uppercase tracking-widest text-brand-900 underline underline-offset-4"
                       >
                         Send another message
                       </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-brand-400 ml-1">Your Full Name</label>
                             <input 
                               type="text" 
                               required
                               placeholder="John Doe"
                               value={formState.name}
                               onChange={e => setFormState({...formState, name: e.target.value})}
                               className="w-full bg-brand-50 border-none rounded-2xl p-5 text-sm font-bold text-brand-900 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none" 
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-brand-400 ml-1">Email Address</label>
                             <input 
                               type="email" 
                               required
                               placeholder="john@example.com"
                               value={formState.email}
                               onChange={e => setFormState({...formState, email: e.target.value})}
                               className="w-full bg-brand-50 border-none rounded-2xl p-5 text-sm font-bold text-brand-900 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none" 
                             />
                          </div>
                       </div>
                       
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-brand-400 ml-1">Subject</label>
                          <input 
                            type="text" 
                            required
                            placeholder="How can we help?"
                            value={formState.subject}
                            onChange={e => setFormState({...formState, subject: e.target.value})}
                            className="w-full bg-brand-50 border-none rounded-2xl p-5 text-sm font-bold text-brand-900 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none" 
                          />
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-brand-400 ml-1">Message</label>
                          <textarea 
                            required
                            placeholder="Tell us what's on your mind..."
                            rows={5}
                            value={formState.message}
                            onChange={e => setFormState({...formState, message: e.target.value})}
                            className="w-full bg-brand-50 border-none rounded-2xl p-5 text-sm font-medium text-brand-900 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none resize-none" 
                          />
                       </div>

                       <button 
                         type="submit" 
                         disabled={isSubmitting}
                         className="w-full py-5 bg-brand-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-800 transition-all shadow-2xl shadow-brand-900/20 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                       >
                          {isSubmitting ? (
                            <>Sending...</>
                          ) : (
                            <>
                              Send Message <Send size={16} />
                            </>
                          )}
                       </button>
                    </form>
                  )}
               </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
