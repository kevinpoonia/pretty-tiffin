'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

interface CustomizationOption {
  id: string;
  type: string;
  label: string;
  values: string[];
  priceOffset: number;
}

interface ProductCustomizerProps {
  options: CustomizationOption[];
  selectedOptions: Record<string, string>;
  onChange: (label: string, value: string) => void;
}

const ProductCustomizer: React.FC<ProductCustomizerProps> = ({ options, selectedOptions, onChange }) => {
  if (!options || options.length === 0) return null;

  return (
    <div className="space-y-8">
      {options.map((opt) => (
        <div key={opt.id} className="border-t border-brand-100 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-heading font-semibold text-brand-900">{opt.label}</h3>
            {opt.priceOffset > 0 && (
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                + ₹{opt.priceOffset}
              </span>
            )}
          </div>

          {opt.type === 'COLOR' ? (
            <div className="flex flex-wrap gap-4">
              {opt.values.map((val) => (
                <button
                  key={val}
                  onClick={() => onChange(opt.label, val)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    selectedOptions[opt.label] === val 
                      ? 'ring-2 ring-offset-4 ring-brand-500' 
                      : 'ring-1 ring-brand-200 hover:ring-brand-300'
                  }`}
                  title={val}
                >
                  <span 
                    className="w-10 h-10 rounded-full shadow-inner" 
                    style={{ backgroundColor: getColorCode(val) }}
                  />
                </button>
              ))}
            </div>
          ) : opt.type === 'ENGRAVING' ? (
            <div className="relative">
              <input
                type="text"
                maxLength={20}
                value={selectedOptions[opt.label] || ''}
                onChange={(e) => onChange(opt.label, e.target.value)}
                placeholder={`Enter ${opt.label.toLowerCase()}...`}
                className="w-full border border-brand-200 rounded-xl px-4 py-3 bg-brand-50 text-brand-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-medium"
              />
              <span className="absolute right-4 top-3.5 text-xs text-brand-400 font-medium">
                {(selectedOptions[opt.label] || '').length}/20
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {opt.values.map((val) => (
                <button
                  key={val}
                  onClick={() => onChange(opt.label, val)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                    selectedOptions[opt.label] === val
                      ? 'bg-brand-900 text-white border-brand-900 shadow-lg'
                      : 'bg-white text-brand-700 border-brand-200 hover:border-brand-500'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Helper to map color names to hex codes for the UI
const getColorCode = (color: string) => {
  const colors: Record<string, string> = {
    'Classic Steel': '#d1d5db',
    'Premium Gold': '#d4af37',
    'Rose Gold': '#b76e79',
    'Midnight Black': '#1a1a1b',
    'Royal Blue': '#002366',
    'Emerald Green': '#50c878',
    'Ruby Red': '#9b111e',
    'Steel': '#d1d5db',
    'Gold': '#d4af37',
    'Rose': '#b76e79',
    'Black': '#1a1a1b'
  };
  return colors[color] || '#e5e7eb';
};

export default ProductCustomizer;
