import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { School, UserProfile } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { GraduationCap, ArrowRight, Loader2 } from 'lucide-react';

interface SetupSchoolProps {
  user: User;
  onComplete: (profile: UserProfile, school: School) => void;
}

export function SetupSchool({ user, onComplete }: SetupSchoolProps) {
  const [loading, setLoading] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [currency, setCurrency] = useState('PKR');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName) return;
    
    setLoading(true);
    try {
      const schoolId = 'school_' + Date.now();
      const schoolData: any = {
        name: schoolName,
        currency,
        createdAt: serverTimestamp(),
        lateFeeRules: {
          tier1Days: 5,
          tier1Percent: 5,
          tier2Days: 10,
          tier2Percent: 10,
          fixedPenalty: 1000
        }
      };

      try {
        await setDoc(doc(db, 'schools', schoolId), schoolData);
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `schools/${schoolId}`);
      }

      const profileData: any = {
        schoolId,
        role: 'admin',
        email: user.email || '',
        name: user.displayName || 'Admin'
      };

      try {
        await setDoc(doc(db, 'users', user.uid), profileData);
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}`);
      }
      
      onComplete({ id: user.uid, ...profileData } as UserProfile, { id: schoolId, ...schoolData } as School);
    } catch (error) {
      console.error(error);
      alert('Setup failed. Please check console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-stone-200 border border-stone-100 p-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-stone-900 rounded-2xl flex items-center justify-center text-white mb-4">
            <GraduationCap className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Setup your school</h2>
          <p className="text-stone-400 text-sm">Welcome to EduFee Pro. Let's initialize your portal.</p>
        </div>

        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-stone-500">School Name</label>
            <input
              autoFocus
              type="text"
              required
              value={schoolName}
              onChange={e => setSchoolName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all font-medium"
              placeholder="e.g. Oxford International"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Base Currency</label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all font-medium appearance-none bg-stone-50"
            >
              <option value="PKR">Pakistani Rupee (PKR)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="INR">Indian Rupee (INR)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Complete Setup <ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
