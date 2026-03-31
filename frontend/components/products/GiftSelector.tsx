'use client';

import React from 'react';
import { Calendar, Gift, MessageSquare, Check } from 'lucide-react';

interface GiftDetails {
  occasion: string;
  message: string;
  scheduledFor: string;
  packaging: string;
}

interface GiftSelectorProps {
  giftDetails: GiftDetails;
  onChange: (details: Partial<GiftDetails>) => void;
}

const occasions = ['Birthday', 'Anniversary', 'Wedding', 'Corporate', 'Just Because', 'Congratulation'];
const packagingOptions = [
  { id: 'STANDARD', name: 'Standard Box', price: 0, img: '/images/package-std.png' },
  { id: 'PREMIUM', name: 'Premium Wrap', price: 99, img: '/images/package-premium.png' },
  { id: 'LUXURY', name: 'Luxury Hamper', price: 299, img: '/images/package-luxury.png' },
];

const GiftSelector: React.FC<GiftSelectorProps> = ({ giftDetails, onChange }) => {
  return (
    <div className="bg-white rounded-3xl border border-brand-100 p-8 shadow-sm space-y-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-brand-900 text-white flex items-center justify-center shadow-lg">
          <Gift size={20} />
        </div>
        <div>
          <h3 className="font-heading font-black text-xl text-brand-900 tracking-tighter">Gifting Experience</h3>
          <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Make it special for your loved ones</p>
        </div>
      </div>

      {/* Occasion */}
      <div>
        <label className="text-[11px] font-black uppercase tracking-widest text-brand-400 mb-3 block ml-1">Select Occasion</label>
        <div className="flex flex-wrap gap-2">
          {occasions.map((occ) => (
            <button
              key={occ}
              onClick={() => onChange({ occasion: occ })}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                giftDetails.occasion === occ
                  ? 'bg-brand-900 text-white border-brand-900 shadow-md'
                  : 'bg-brand-50 text-brand-600 border-transparent hover:border-brand-200'
              }`}
            >
              {occ}
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="text-[11px] font-black uppercase tracking-widest text-brand-400 mb-3 block ml-1 flex items-center gap-2">
          <MessageSquare size={14} /> Personal Message
        </label>
        <textarea
          value={giftDetails.message}
          onChange={(e) => onChange({ message: e.target.value })}
          placeholder="Write a heartwarming note (max 200 chars)..."
          maxLength={200}
          rows={3}
          className="w-full bg-brand-50 border-none rounded-2xl p-5 text-sm font-medium text-brand-700 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none resize-none"
        />
        <p className="text-[10px] text-right text-brand-400 font-bold mt-1 uppercase tracking-widest">{giftDetails.message.length}/200</p>
      </div>

      {/* Date Picker (Simplified) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-[11px] font-black uppercase tracking-widest text-brand-400 mb-3 block ml-1 flex items-center gap-2">
            <Calendar size={14} /> Delivery Date
          </label>
          <input
            type="date"
            value={giftDetails.scheduledFor}
            onChange={(e) => onChange({ scheduledFor: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className="w-full bg-brand-50 border-none rounded-2xl p-4 text-xs font-bold text-brand-900 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
          />
        </div>
        
        {/* Packaging (Simplified) */}
        <div>
          <label className="text-[11px] font-black uppercase tracking-widest text-brand-400 mb-3 block ml-1">Packaging Option</label>
          <select 
            value={giftDetails.packaging}
            onChange={(e) => onChange({ packaging: e.target.value })}
            className="w-full bg-brand-50 border-none rounded-2xl p-4 text-xs font-bold text-brand-900 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none cursor-pointer"
          >
            {packagingOptions.map(opt => (
              <option key={opt.id} value={opt.id}>
                {opt.name} {opt.price > 0 ? `(+₹${opt.price})` : '(Free)'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="pt-4 border-t border-brand-50 flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center p-1">
          <Check size={12} strokeWidth={4} />
        </div>
        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Handmade with love in India</p>
      </div>
    </div>
  );
};

export default GiftSelector;
