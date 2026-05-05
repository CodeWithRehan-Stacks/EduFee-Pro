import React, { useState, useEffect } from 'react';
import { School, Invoice, Student } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, onSnapshot, updateDoc, doc, addDoc, getDocs, where, serverTimestamp } from 'firebase/firestore';
import { 
  Receipt, 
  Search, 
  Filter, 
  Download, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Zap,
  Loader2,
  FileText
} from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { cn, formatCurrency } from '../lib/utils';

interface InvoicesProps {
  school: School;
}

export function Invoices({ school }: InvoicesProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const invPath = `schools/${school.id}/invoices`;
    const qInvoices = query(collection(db, invPath));
    const unsubInvoices = onSnapshot(qInvoices, (snap) => {
      setInvoices(snap.docs.map(d => ({ id: d.id, ...d.data() } as Invoice)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, invPath);
    });

    const stuPath = `schools/${school.id}/students`;
    const qStudents = query(collection(db, stuPath), where('status', '==', 'active'));
    const unsubStudents = onSnapshot(qStudents, (snap) => {
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() } as Student)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, stuPath);
    });

    return () => {
      unsubInvoices();
      unsubStudents();
    };
  }, [school.id]);

  const generateMonthlyInvoices = async () => {
    if (!confirm(`Generate invoices for all ${students.length} active students?`)) return;
    setGenerating(true);
    const invPath = `schools/${school.id}/invoices`;
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      for (const student of students) {
        // Check if already exists for this student and month
        const existingQ = query(
          collection(db, invPath),
          where('studentId', '==', student.id),
          where('month', '==', month),
          where('year', '==', year)
        );
        const existingSnap = await getDocs(existingQ);
        if (!existingSnap.empty) continue;

        const dueDate = new Date(year, month - 1, 10); // 10th of the month

        const invoiceData: any = {
          schoolId: school.id,
          studentId: student.id,
          month,
          year,
          baseAmount: student.feePlan,
          lateFee: 0,
          totalAmount: student.feePlan,
          status: 'pending',
          dueDate: dueDate.toISOString(),
          createdAt: serverTimestamp()
        };

        try {
          await addDoc(collection(db, invPath), invoiceData);
        } catch (e) {
          handleFirestoreError(e, OperationType.CREATE, invPath);
        }
      }
      alert('Monthly invoices generated successfully');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, invPath);
    } finally {
      setGenerating(false);
    }
  };

  const markAsPaid = async (invoice: Invoice) => {
    const invRef = doc(db, 'schools', school.id, 'invoices', invoice.id);
    const recPath = `schools/${school.id}/receipts`;
    try {
      await updateDoc(invRef, {
        status: 'paid',
        paidAt: serverTimestamp()
      });
      
      // Auto generate receipt record
      try {
        await addDoc(collection(db, recPath), {
          invoiceId: invoice.id,
          schoolId: school.id,
          amountPaid: invoice.totalAmount,
          paymentDate: serverTimestamp(),
          paymentMethod: 'Cash',
          receiptNumber: `REC-${Date.now().toString().slice(-6)}`
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, recPath);
      }

      alert('Payment recorded and receipt generated');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, invRef.path);
    }
  };

  const sendWhatsApp = async (invoice: Invoice) => {
    const student = students.find(s => s.id === invoice.studentId);
    if (!student?.whatsappFather) return alert('No WhatsApp number for parent');
    
    // Simulate WhatsApp API call
    console.log(`Sending to ${student.whatsappFather}`);
    alert(`WhatsApp notification sent to ${student.fatherName}`);
    
    const invRef = doc(db, 'schools', school.id, 'invoices', invoice.id);
    try {
      await updateDoc(invRef, {
        status: invoice.status === 'pending' ? 'sent' : invoice.status
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, invRef.path);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const student = students.find(s => s.id === inv.studentId);
    return student?.fullName.toLowerCase().includes(search.toLowerCase());
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle2 className="w-3 h-3" />;
      case 'overdue': return <AlertTriangle className="w-3 h-3" />;
      case 'sent': return <Send className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input 
            type="text" 
            placeholder="Search by student name..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all font-medium shadow-sm"
          />
        </div>
        <div className="flex gap-3">
          <button 
            onClick={generateMonthlyInvoices}
            disabled={generating}
            className="px-6 py-3 bg-stone-900 text-white rounded-2xl flex items-center gap-2 font-bold text-sm hover:scale-105 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-400" />}
            Batch Generate Invoices
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="px-6 py-4 text-[10px] uppercase font-black text-stone-400 tracking-widest">Invoice</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black text-stone-400 tracking-widest">Student</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black text-stone-400 tracking-widest">Period</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black text-stone-400 tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black text-stone-400 tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black text-stone-400 tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filteredInvoices.map((inv) => {
                const student = students.find(s => s.id === inv.studentId);
                return (
                  <tr key={inv.id} className="hover:bg-stone-50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-mono text-xs font-bold text-stone-500 uppercase">#{inv.id.slice(-8)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-stone-900">{student?.fullName || 'Unknown Student'}</p>
                      <p className="text-[10px] text-stone-400 font-bold uppercase">{student?.grade}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{format(new Date(inv.year, inv.month - 1), 'MMMM yyyy')}</span>
                      </div>
                      <p className="text-[10px] text-stone-400 font-bold uppercase">Due: {inv.dueDate ? format(new Date(inv.dueDate), 'dd MMM') : 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-black text-stone-900">{formatCurrency(inv.totalAmount, school.currency)}</p>
                      {inv.lateFee > 0 && <p className="text-[10px] text-red-500 font-bold uppercase">Late Fee: +{formatCurrency(inv.lateFee, school.currency)}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        inv.status === 'paid' ? "bg-green-100 text-green-700" : 
                        inv.status === 'overdue' ? "bg-red-100 text-red-700" :
                        inv.status === 'sent' ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                      )}>
                        {getStatusIcon(inv.status)}
                        {inv.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {inv.status !== 'paid' && (
                          <button 
                            onClick={() => sendWhatsApp(inv)}
                            className="p-2 bg-stone-50 rounded-xl text-stone-600 hover:bg-stone-900 hover:text-white transition-all shadow-sm" title="Notify Parent">
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {inv.status !== 'paid' && (
                          <button 
                            onClick={() => markAsPaid(inv)}
                            className="p-2 bg-green-50 rounded-xl text-green-700 hover:bg-green-600 hover:text-white transition-all shadow-sm" title="Record Payment">
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {inv.status === 'paid' && (
                          <a 
                            href={`/api/receipts/${inv.id}`}
                            download
                            className="p-2 bg-stone-900 rounded-xl text-white hover:scale-110 transition-all shadow-sm" title="Download Receipt">
                            <FileText className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredInvoices.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-stone-400">
                    <Receipt className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-bold uppercase tracking-widest text-xs">No invoices generated for this period</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
