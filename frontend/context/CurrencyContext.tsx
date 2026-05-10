'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'INR', symbol: '₹',   name: 'Indian Rupee',        locale: 'en-IN' },
  { code: 'USD', symbol: '$',   name: 'US Dollar',           locale: 'en-US' },
  { code: 'GBP', symbol: '£',   name: 'British Pound',       locale: 'en-GB' },
  { code: 'EUR', symbol: '€',   name: 'Euro',                locale: 'de-DE' },
  { code: 'AUD', symbol: 'A$',  name: 'Australian Dollar',   locale: 'en-AU' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar',  locale: 'en-NZ' },
  { code: 'ZAR', symbol: 'R',   name: 'South African Rand',  locale: 'en-ZA' },
  { code: 'MUR', symbol: '₨',   name: 'Mauritian Rupee',     locale: 'en-MU' },
];

// Fallback rates (1 INR = X units of currency). Updated periodically.
const FALLBACK_RATES: Record<string, number> = {
  INR: 1, 
  USD: 0.012, 
  GBP: 0.0095, 
  EUR: 0.011, 
  AUD: 0.018, 
  NZD: 0.020, 
  ZAR: 0.22,
  MUR: 0.55
};

// Timezone → currency mapping for auto-detection
const TZ_CURRENCY: Record<string, string> = {
  'Asia/Kolkata': 'INR', 'Asia/Calcutta': 'INR',
  'Europe/London': 'GBP', 'Europe/Jersey': 'GBP', 'Europe/Guernsey': 'GBP', 'Europe/Isle_of_Man': 'GBP',
  'Europe/Dublin': 'EUR', 'Europe/Paris': 'EUR', 'Europe/Berlin': 'EUR', 'Europe/Rome': 'EUR', 'Europe/Madrid': 'EUR', 'Europe/Amsterdam': 'EUR', 'Europe/Brussels': 'EUR', 'Europe/Vienna': 'EUR',
  'Australia/Sydney': 'AUD', 'Australia/Melbourne': 'AUD', 'Australia/Brisbane': 'AUD', 'Australia/Perth': 'AUD', 'Australia/Adelaide': 'AUD', 'Australia/Hobart': 'AUD', 'Australia/Darwin': 'AUD',
  'Pacific/Auckland': 'NZD', 'Pacific/Chatham': 'NZD',
  'Africa/Johannesburg': 'ZAR',
  'Indian/Mauritius': 'MUR',
  'America/New_York': 'USD', 'America/Chicago': 'USD', 'America/Denver': 'USD', 'America/Los_Angeles': 'USD', 'America/Phoenix': 'USD',
};

function detectCurrency(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (TZ_CURRENCY[tz]) return TZ_CURRENCY[tz];
    
    // Fallback: use language/country hints
    const lang = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
    if (lang.includes('-IN')) return 'INR';
    if (lang.includes('-GB')) return 'GBP';
    if (lang.includes('-AU')) return 'AUD';
    if (lang.includes('-NZ')) return 'NZD';
    if (lang.includes('-ZA')) return 'ZAR';
    if (lang.includes('-MU')) return 'MUR';
    if (['de', 'fr', 'es', 'it', 'nl'].some(l => lang.startsWith(l))) return 'EUR';
    
    // Default to USD for everyone outside detected regions
  } catch {}
  return 'USD';
}

const CACHE_KEY = 'pla_rates';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CurrencyContextType {
  currency: string;
  currencyInfo: CurrencyInfo;
  setCurrency: (code: string) => void;
  formatPrice: (inrAmount: number | string, productPrices?: any[]) => string;
  rates: Record<string, number>;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'USD',
  currencyInfo: CURRENCIES.find(c => c.code === 'USD')!,
  setCurrency: () => {},
  formatPrice: (n) => `$${Number(n).toFixed(2)}`,
  rates: FALLBACK_RATES,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState('USD');

  useEffect(() => {
    // Restore saved currency or auto-detect
    const saved = localStorage.getItem('pla_currency');
    setCurrencyState(saved || detectCurrency());
  }, []);

  const setCurrency = useCallback((code: string) => {
    setCurrencyState(code);
    localStorage.setItem('pla_currency', code);
  }, []);

  const currencyInfo = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  const formatPrice = useCallback((inrAmount: number | string, productPrices?: any[]): string => {
    const info = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
    const amountInINR = Number(inrAmount) || 0;
    
    // 1. Check for manual admin-set price for the current currency
    if (productPrices && Array.isArray(productPrices)) {
      const manualPrice = productPrices.find(p => p.currency === currency);
      if (manualPrice) {
        try {
          return new Intl.NumberFormat(info.locale, {
            style: 'currency',
            currency,
          }).format(Number(manualPrice.price));
        } catch {
          return `${manualPrice.symbol || info.symbol}${manualPrice.price}`;
        }
      }
    }

    // 2. Fallback to conversion rate if not INR
    if (currency !== 'INR') {
      const rate = FALLBACK_RATES[currency] || FALLBACK_RATES['USD'];
      const convertedAmount = amountInINR * rate;
      try {
        return new Intl.NumberFormat(info.locale, {
          style: 'currency',
          currency,
        }).format(convertedAmount);
      } catch {
        return `${info.symbol}${convertedAmount.toFixed(2)}`;
      }
    }

    // 3. If currency is INR, use the base price
    try {
      return new Intl.NumberFormat(info.locale, {
        style: 'currency',
        currency: 'INR',
      }).format(amountInINR);
    } catch {
      return `₹${amountInINR}`;
    }
  }, [currency]);


  return (
    <CurrencyContext.Provider value={{ currency, currencyInfo, setCurrency, formatPrice, rates: FALLBACK_RATES }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
