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
  { code: 'EUR', symbol: '€',   name: 'Euro',                locale: 'de-DE' },
  { code: 'GBP', symbol: '£',   name: 'British Pound',       locale: 'en-GB' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham',          locale: 'ar-AE' },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal',         locale: 'ar-SA' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar',     locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$',  name: 'Australian Dollar',   locale: 'en-AU' },
  { code: 'SGD', symbol: 'S$',  name: 'Singapore Dollar',    locale: 'en-SG' },
  { code: 'MYR', symbol: 'RM',  name: 'Malaysian Ringgit',   locale: 'ms-MY' },
  { code: 'JPY', symbol: '¥',   name: 'Japanese Yen',        locale: 'ja-JP' },
  { code: 'CNY', symbol: '¥',   name: 'Chinese Yuan',        locale: 'zh-CN' },
  { code: 'KWD', symbol: 'KD',  name: 'Kuwaiti Dinar',       locale: 'ar-KW' },
  { code: 'QAR', symbol: 'QR',  name: 'Qatari Riyal',        locale: 'ar-QA' },
  { code: 'BHD', symbol: 'BD',  name: 'Bahraini Dinar',      locale: 'ar-BH' },
  { code: 'THB', symbol: '฿',   name: 'Thai Baht',           locale: 'th-TH' },
  { code: 'IDR', symbol: 'Rp',  name: 'Indonesian Rupiah',   locale: 'id-ID' },
  { code: 'PHP', symbol: '₱',   name: 'Philippine Peso',     locale: 'fil-PH' },
  { code: 'ZAR', symbol: 'R',   name: 'South African Rand',  locale: 'en-ZA' },
  { code: 'NGN', symbol: '₦',   name: 'Nigerian Naira',      locale: 'en-NG' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling',     locale: 'en-KE' },
  { code: 'BRL', symbol: 'R$',  name: 'Brazilian Real',      locale: 'pt-BR' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso',        locale: 'es-MX' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar',  locale: 'en-NZ' },
  { code: 'CHF', symbol: 'Fr',  name: 'Swiss Franc',         locale: 'de-CH' },
  { code: 'SEK', symbol: 'kr',  name: 'Swedish Krona',       locale: 'sv-SE' },
  { code: 'NOK', symbol: 'kr',  name: 'Norwegian Krone',     locale: 'nb-NO' },
  { code: 'DKK', symbol: 'kr',  name: 'Danish Krone',        locale: 'da-DK' },
];

// Fallback rates (1 INR = X units of currency). Updated periodically.
const FALLBACK_RATES: Record<string, number> = {
  INR: 1, USD: 0.012, EUR: 0.011, GBP: 0.0094, AED: 0.044, SAR: 0.045,
  CAD: 0.016, AUD: 0.018, SGD: 0.016, MYR: 0.056, JPY: 1.82, CNY: 0.087,
  KWD: 0.0037, QAR: 0.044, BHD: 0.0045, THB: 0.43, IDR: 197, PHP: 0.69,
  ZAR: 0.22, NGN: 19.8, KES: 1.61, BRL: 0.063, MXN: 0.24, NZD: 0.020,
  CHF: 0.011, SEK: 0.13, NOK: 0.13, DKK: 0.083,
};

// Timezone → currency mapping for auto-detection
const TZ_CURRENCY: Record<string, string> = {
  'Asia/Kolkata': 'INR', 'Asia/Calcutta': 'INR',
  'America/New_York': 'USD', 'America/Chicago': 'USD', 'America/Los_Angeles': 'USD', 'America/Denver': 'USD',
  'America/Phoenix': 'USD', 'America/Anchorage': 'USD', 'Pacific/Honolulu': 'USD',
  'Europe/London': 'GBP',
  'Europe/Paris': 'EUR', 'Europe/Berlin': 'EUR', 'Europe/Madrid': 'EUR', 'Europe/Rome': 'EUR',
  'Europe/Amsterdam': 'EUR', 'Europe/Brussels': 'EUR', 'Europe/Vienna': 'EUR', 'Europe/Lisbon': 'EUR',
  'Asia/Dubai': 'AED', 'Asia/Muscat': 'AED',
  'Asia/Riyadh': 'SAR',
  'America/Toronto': 'CAD', 'America/Vancouver': 'CAD',
  'Australia/Sydney': 'AUD', 'Australia/Melbourne': 'AUD', 'Australia/Brisbane': 'AUD',
  'Asia/Singapore': 'SGD',
  'Asia/Kuala_Lumpur': 'MYR',
  'Asia/Tokyo': 'JPY',
  'Asia/Shanghai': 'CNY', 'Asia/Hong_Kong': 'CNY',
  'Asia/Kuwait': 'KWD',
  'Asia/Qatar': 'QAR',
  'Asia/Bahrain': 'BHD',
  'Asia/Bangkok': 'THB',
  'Asia/Jakarta': 'IDR',
  'Asia/Manila': 'PHP',
  'Africa/Johannesburg': 'ZAR',
  'Africa/Lagos': 'NGN',
  'Africa/Nairobi': 'KES',
  'America/Sao_Paulo': 'BRL',
  'America/Mexico_City': 'MXN',
  'Pacific/Auckland': 'NZD',
  'Europe/Zurich': 'CHF',
  'Europe/Stockholm': 'SEK',
  'Europe/Oslo': 'NOK',
  'Europe/Copenhagen': 'DKK',
};

function detectCurrency(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (TZ_CURRENCY[tz]) return TZ_CURRENCY[tz];
    // Fallback: use language
    const lang = navigator.language;
    if (lang.includes('-IN')) return 'INR';
    if (lang.includes('-GB')) return 'GBP';
    if (lang.includes('-AU')) return 'AUD';
    if (lang.includes('-CA')) return 'CAD';
    if (lang.startsWith('ja')) return 'JPY';
    if (lang.startsWith('zh')) return 'CNY';
    if (lang.startsWith('ar')) return 'AED';
    if (lang.startsWith('pt-BR')) return 'BRL';
  } catch {}
  return 'USD';
}

const CACHE_KEY = 'pla_rates';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CurrencyContextType {
  currency: string;
  currencyInfo: CurrencyInfo;
  setCurrency: (code: string) => void;
  formatPrice: (inrAmount: number | string) => string;
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

  const formatPrice = useCallback((inrAmount: number | string): string => {
    const amountInr = Number(inrAmount) || 0;
    const rate = rates[currency] ?? FALLBACK_RATES[currency] ?? 1;
    const converted = amountInr * rate;
    const info = CURRENCIES.find(c => c.code === currency)!;
    try {
      return new Intl.NumberFormat(info.locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: currency === 'JPY' || currency === 'IDR' ? 0 : 2,
        maximumFractionDigits: currency === 'JPY' || currency === 'IDR' ? 0 : 2,
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
