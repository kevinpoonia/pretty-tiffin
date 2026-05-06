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
];

// Fallback rates (1 INR = X units of currency). Updated periodically.
const FALLBACK_RATES: Record<string, number> = {
  INR: 1, USD: 0.012
};

// Timezone → currency mapping for auto-detection
const TZ_CURRENCY: Record<string, string> = {
  'Asia/Kolkata': 'INR', 'Asia/Calcutta': 'INR',
};

function detectCurrency(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (TZ_CURRENCY[tz]) return TZ_CURRENCY[tz];
    
    // Fallback: use language/country hints
    const lang = navigator.language;
    if (lang.includes('-IN')) return 'INR';
    
    // Default to USD for everyone outside India
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
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);

  useEffect(() => {
    // Restore saved currency or auto-detect
    const saved = localStorage.getItem('pla_currency');
    setCurrencyState(saved || detectCurrency());

    // Load cached rates or fetch fresh
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { ts, data } = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL) {
          setRates(data);
          return;
        }
      }
    } catch {}

    fetch('https://open.er-api.com/v6/latest/INR')
      .then(r => r.json())
      .then(data => {
        if (data?.rates) {
          setRates(data.rates);
          localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: data.rates }));
        }
      })
      .catch(() => {}); // silently use fallback rates
  }, []);

  const setCurrency = useCallback((code: string) => {
    setCurrencyState(code);
    localStorage.setItem('pla_currency', code);
  }, []);

  const currencyInfo = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  const formatPrice = useCallback((inrAmount: number | string, productPrices?: any[]): string => {
    const info = CURRENCIES.find(c => c.code === currency)!;
    
    // Check for manual admin-set price for the current currency
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

    // Fallback to conversion
    const amountInr = Number(inrAmount) || 0;
    const rate = rates[currency] ?? FALLBACK_RATES[currency] ?? 1;
    const converted = amountInr * rate;
    
    try {
      return new Intl.NumberFormat(info.locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(converted);
    } catch {
      return `${info.symbol}${converted.toFixed(2)}`;
    }
  }, [currency, rates]);

  return (
    <CurrencyContext.Provider value={{ currency, currencyInfo, setCurrency, formatPrice, rates }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
