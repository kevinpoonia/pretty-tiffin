'use client';
import { CheckCircle2, Clock, Package, Truck, XCircle, RotateCcw } from 'lucide-react';

const STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

const META: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  PENDING:    { label: 'Order Placed',    icon: Clock,       color: 'text-yellow-600', bg: 'bg-yellow-100' },
  CONFIRMED:  { label: 'Confirmed',       icon: CheckCircle2,color: 'text-blue-600',   bg: 'bg-blue-100'   },
  PROCESSING: { label: 'Being Packed',    icon: Package,     color: 'text-purple-600', bg: 'bg-purple-100' },
  SHIPPED:    { label: 'Shipped',         icon: Truck,       color: 'text-indigo-600', bg: 'bg-indigo-100' },
  DELIVERED:  { label: 'Delivered',       icon: CheckCircle2,color: 'text-green-600',  bg: 'bg-green-100'  },
  CANCELLED:  { label: 'Cancelled',       icon: XCircle,     color: 'text-red-600',    bg: 'bg-red-100'    },
};

interface HistoryEntry {
  id: string;
  status: string;
  trackingId?: string | null;
  note?: string | null;
  createdAt: string;
}

interface Props {
  currentStatus: string;
  history: HistoryEntry[];
}

export default function OrderTimeline({ currentStatus, history }: Props) {
  if (currentStatus === 'CANCELLED') {
    return (
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
        <XCircle size={18} className="text-red-500 shrink-0" />
        <div>
          <p className="text-sm font-bold text-red-700">Order Cancelled</p>
          {history.find(h => h.status === 'CANCELLED')?.note && (
            <p className="text-xs text-red-500 mt-0.5">{history.find(h => h.status === 'CANCELLED')!.note}</p>
          )}
        </div>
      </div>
    );
  }

  const currentIdx = STEPS.indexOf(currentStatus);

  return (
    <div className="space-y-1">
      {/* Progress bar */}
      <div className="flex items-center gap-1 mb-4">
        {STEPS.map((step, i) => (
          <div key={step} className="flex-1 flex items-center gap-1">
            <div className={`h-2 flex-1 rounded-full transition-all ${
              i <= currentIdx ? 'bg-brand-500' : 'bg-brand-100'
            }`} />
          </div>
        ))}
      </div>

      {/* Step labels */}
      <div className="flex justify-between mb-6">
        {STEPS.map((step, i) => {
          const m = META[step];
          const Icon = m.icon;
          const done = i < currentIdx;
          const active = i === currentIdx;
          return (
            <div key={step} className="flex flex-col items-center gap-1 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                active ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' :
                done ? 'bg-brand-100 text-brand-500' : 'bg-gray-100 text-gray-400'
              }`}>
                <Icon size={14} />
              </div>
              <p className={`text-[9px] font-black uppercase tracking-widest text-center ${
                active ? 'text-brand-700' : done ? 'text-brand-400' : 'text-gray-400'
              }`}>{m.label}</p>
            </div>
          );
        })}
      </div>

      {/* History log */}
      {history.length > 0 && (
        <div className="border border-brand-100 rounded-2xl overflow-hidden">
          <div className="bg-brand-50 px-4 py-2 border-b border-brand-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-400">Status History</p>
          </div>
          <div className="divide-y divide-brand-50">
            {[...history].reverse().map((entry) => {
              const m = META[entry.status] || META['PENDING'];
              const Icon = m.icon;
              return (
                <div key={entry.id} className="flex items-start gap-3 px-4 py-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${m.bg}`}>
                    <Icon size={12} className={m.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-brand-900">{m.label}</p>
                      <p className="text-[10px] text-brand-400 shrink-0">
                        {new Date(entry.createdAt).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {entry.trackingId && (
                      <p className="text-[10px] text-indigo-600 font-mono font-bold mt-0.5">Tracking: {entry.trackingId}</p>
                    )}
                    {entry.note && <p className="text-[10px] text-brand-500 mt-0.5">{entry.note}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
