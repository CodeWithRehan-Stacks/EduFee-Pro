import React, { useState, useEffect } from 'react';
import { School, Invoice, Student } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { 
  TrendingUp, 
  Users, 
  AlertCircle, 
  CheckCircle2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface DashboardProps {
  school: School;
}

export function Dashboard({ school }: DashboardProps) {
  const [stats, setStats] = useState({
    totalStudents: 0,
    monthlyRevenue: 0,
    unpaidInvoices: 0,
    paidInvoices: 0
  });
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const studentPath = `schools/${school.id}/students`;
      const invoicePath = `schools/${school.id}/invoices`;
      try {
        const studentQuery = query(collection(db, studentPath), where('status', '==', 'active'));
        const studentSnap = await getDocs(studentQuery);
        
        const invoiceQuery = query(collection(db, invoicePath), orderBy('createdAt', 'desc'), limit(10));
        const invoiceSnap = await getDocs(invoiceQuery);
        
        const invoices = invoiceSnap.docs.map(d => ({ id: d.id, ...d.data() } as Invoice));
        setRecentInvoices(invoices);

        const paid = invoices.filter(i => i.status === 'paid').length;
        const pending = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').length;
        const revenue = invoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.totalAmount, 0);

        setStats({
          totalStudents: studentSnap.size,
          monthlyRevenue: revenue,
          unpaidInvoices: pending,
          paidInvoices: paid
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `dashboard_stats`);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [school.id]);

  const chartData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 2000 },
    { name: 'Apr', revenue: 2780 },
    { name: 'May', revenue: 1890 },
    { name: 'Jun', revenue: 2390 },
  ];

  const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-2xl", color)}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={cn("flex items-center text-xs font-bold", trend > 0 ? "text-green-600" : "text-red-600")}>
            {trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</h3>
        <p className="text-2xl font-black">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Students" 
          value={stats.totalStudents} 
          icon={Users} 
          trend={12} 
          color="bg-blue-50 text-blue-600" 
        />
        <StatCard 
          title="Monthly Revenue" 
          value={formatCurrency(stats.monthlyRevenue, school.currency)} 
          icon={TrendingUp} 
          trend={8} 
          color="bg-emerald-50 text-emerald-600" 
        />
        <StatCard 
          title="Pending Status" 
          value={stats.unpaidInvoices} 
          icon={AlertCircle} 
          trend={-5} 
          color="bg-orange-50 text-orange-600" 
        />
        <StatCard 
          title="Completed Payments" 
          value={stats.paidInvoices} 
          icon={CheckCircle2} 
          trend={15} 
          color="bg-stone-50 text-stone-900" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-stone-400" /> Revenue Stream
            </h3>
            <select className="bg-stone-50 border-none text-xs font-bold rounded-lg px-3 py-2 outline-none">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1c1917" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1c1917" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#78716c' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#78716c' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#000', strokeWidth: 1, strokeDasharray: '5 5' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#1c1917" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm overflow-hidden flex flex-col">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-stone-400" /> Recent Billing
          </h3>
          <div className="space-y-4 flex-1 overflow-auto">
            {recentInvoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-stone-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs",
                    inv.status === 'paid' ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"
                  )}>
                    {inv.month}/{inv.year.toString().slice(-2)}
                  </div>
                  <div>
                    <p className="text-sm font-bold truncate max-w-[120px]">Sample Student</p>
                    <p className="text-[10px] text-stone-400 uppercase font-black">{inv.status}</p>
                  </div>
                </div>
                <p className="text-sm font-black">{formatCurrency(inv.totalAmount, school.currency)}</p>
              </div>
            ))}
            {recentInvoices.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                <AlertCircle className="w-10 h-10 mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest">No data yet</p>
              </div>
            )}
          </div>
          <button className="w-full mt-6 py-3 border-2 border-stone-50 text-stone-900 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-stone-200 transition-all">
            View All Invoices
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper component import fix
import { cn } from '../lib/utils';
