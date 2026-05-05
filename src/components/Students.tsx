import React, { useState, useEffect } from 'react';
import { School, Student } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, query, onSnapshot, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { Search, Plus, UserPlus, Filter, MoreVertical, MessageSquare, Mail, Phone, Edit2, Trash2, Users } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface StudentsProps {
  school: School;
}

export function Students({ school }: StudentsProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    grade: '',
    fatherName: '',
    motherName: '',
    whatsappFather: '',
    feePlan: 0,
    status: 'active' as const
  });

  useEffect(() => {
    const path = `schools/${school.id}/students`;
    const q = query(collection(db, path));
    const unsubscribe = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Student));
      setStudents(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return unsubscribe;
  }, [school.id]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const path = `schools/${school.id}/students`;
    try {
      await addDoc(collection(db, path), {
        ...formData,
        schoolId: school.id,
        createdAt: serverTimestamp(),
        admissionDate: new Date().toISOString()
      });
      setShowAddModal(false);
      setFormData({ fullName: '', grade: '', fatherName: '', motherName: '', whatsappFather: '', feePlan: 0, status: 'active' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const filteredStudents = students.filter(s => 
    s.fullName.toLowerCase().includes(search.toLowerCase()) || 
    s.grade.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input 
            type="text" 
            placeholder="Search students by name or grade..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all font-medium shadow-sm"
          />
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-3 bg-white border border-stone-200 rounded-2xl flex items-center gap-2 font-bold text-sm text-stone-600 hover:bg-stone-50 transition-all shadow-sm">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-stone-900 text-white rounded-2xl flex items-center gap-2 font-bold text-sm hover:scale-105 transition-all shadow-lg active:scale-95"
          >
            <UserPlus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="px-6 py-4 text-[10px] uppercase font-black text-stone-400 tracking-widest">Student</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black text-stone-400 tracking-widest">Class</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black text-stone-400 tracking-widest">Parent Details</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black text-stone-400 tracking-widest">Fee Plan</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black text-stone-400 tracking-widest">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-stone-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-400">
                        {s.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">{s.fullName}</p>
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">ID: {s.id.slice(-6)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-stone-100 rounded-lg text-xs font-bold text-stone-600">{s.grade}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold">{s.fatherName}</p>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-xs text-stone-400 font-mono">{s.whatsappFather || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-black text-stone-900">{new Intl.NumberFormat('en-PK', { style: 'currency', currency: school.currency }).format(s.feePlan)}</p>
                    <p className="text-[10px] text-stone-400 font-bold uppercase">Monthly</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      s.status === 'active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-stone-300 hover:text-stone-900 transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-stone-400">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-bold uppercase tracking-widest text-xs">No students found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Backdrop */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-stone-950/20 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-8 border border-stone-100 animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-black mb-6">Register Student</h3>
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest">Full Name</label>
                <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest">Grade / Class</label>
                <input required type="text" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest">Father Name</label>
                <input required type="text" value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest">Parent WhatsApp</label>
                <input required type="text" placeholder="+92 ..." value={formData.whatsappFather} onChange={e => setFormData({...formData, whatsappFather: e.target.value})} className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest">Fee Amount ({school.currency})</label>
                <input required type="number" value={formData.feePlan} onChange={e => setFormData({...formData, feePlan: Number(e.target.value)})} className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none font-bold" />
              </div>
              <div className="flex items-end gap-3 pt-6 md:col-span-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-stone-50 rounded-2xl font-bold hover:bg-stone-100 transition-all">Cancel</button>
                <button type="submit" className="flex-[2] py-3 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-lg active:scale-95">Enroll Student</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
