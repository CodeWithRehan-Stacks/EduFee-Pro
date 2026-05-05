import React from 'react';
import { School } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Download, FileText, TrendingUp, DollarSign } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

interface ReportsProps {
  school: School;
}

export function Reports({ school }: ReportsProps) {
  const collectionData = [
    { name: 'Jan', collected: 45000, expected: 50000 },
    { name: 'Feb', collected: 48000, expected: 50000 },
    { name: 'Mar', collected: 52000, expected: 55000 },
    { name: 'Apr', collected: 40000, expected: 55000 },
  ];

  const statusData = [
    { name: 'Paid', value: 75, color: '#10b981' },
    { name: 'Unpaid', value: 15, color: '#f59e0b' },
    { name: 'Overdue', value: 10, color: '#ef4444' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black">Financial Analytics</h2>
          <p className="text-stone-400 text-sm">Overview of revenue collection and billing health.</p>
        </div>
        <button className="px-6 py-3 bg-stone-900 text-white rounded-2xl flex items-center gap-2 font-bold text-sm hover:scale-105 transition-all shadow-lg active:scale-95">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-stone-400" /> Revenue Collection Efficiency
            </h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={collectionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#78716c' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#78716c' }} />
                <Tooltip cursor={{ fill: '#f5f5f4' }} />
                <Bar dataKey="expected" fill="#e7e5e4" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="collected" fill="#1c1917" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-stone-400" /> Invoice Status Breakdown
            </h3>
          </div>
          <div className="h-[300px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-4 pr-12">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <div>
                    <p className="text-xs font-bold uppercase text-stone-400">{item.name}</p>
                    <p className="font-black">{item.value}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-stone-900 text-white p-8 rounded-3xl flex flex-col justify-between h-48 relative overflow-hidden">
          <DollarSign className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
          <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400">Projected Income</h4>
          <p className="text-4xl font-black">{formatCurrency(1250000, school.currency)}</p>
          <p className="text-xs text-stone-400 font-mono">ANNUAL_FORECAST_2026</p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm flex flex-col justify-between h-48">
          <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400">Late Fees Collected</h4>
          <p className="text-4xl font-black text-red-600">{formatCurrency(12400, school.currency)}</p>
          <div className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase">
            <TrendingUp className="w-4 h-4" /> +2.4% vs last month
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm flex flex-col justify-between h-48">
          <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400">Total Outstanding</h4>
          <p className="text-4xl font-black text-orange-600">{formatCurrency(85000, school.currency)}</p>
          <p className="text-xs text-stone-400 font-mono">FROM_12_INVOICES</p>
        </div>
      </div>
    </div>
  );
}
