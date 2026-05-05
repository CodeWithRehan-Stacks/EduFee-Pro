import React from 'react';
import { School } from '../types';
import { Save, AlertTriangle, Shield, Bell } from 'lucide-react';

interface SettingsProps {
  school: School;
}

export function Settings({ school }: SettingsProps) {
  return (
    <div className="max-w-4xl space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-stone-400" /> Late Fee Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-stone-400 tracking-widest block mb-2">Tier 1 Threshold (Days)</label>
              <input type="number" defaultValue={school.lateFeeRules?.tier1Days} className="w-full p-3 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-stone-400 tracking-widest block mb-2">Tier 1 Penalty (%)</label>
              <input type="number" defaultValue={school.lateFeeRules?.tier1Percent} className="w-full p-3 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-stone-400 tracking-widest block mb-2">Fixed Penalty Amount</label>
              <input type="number" defaultValue={school.lateFeeRules?.fixedPenalty} className="w-full p-3 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
          </div>
        </div>
        <div className="mt-8 flex items-center gap-4 p-4 bg-amber-50 rounded-2xl text-amber-800">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-xs font-medium">Changing these rules will only affect future invoices. Existing unpaid invoices will retain their original calculations.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5 text-stone-400" /> Notification Settings
        </h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold">WhatsApp Auto-Send</p>
              <p className="text-xs text-stone-400">Automatically send invoices to parents after generation.</p>
            </div>
            <div className="w-12 h-6 bg-stone-900 rounded-full relative">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold">Weekly Overdue Alerts</p>
              <p className="text-xs text-stone-400">System sends reminder to parents for unpaid invoices every Monday.</p>
            </div>
            <div className="w-12 h-6 bg-stone-200 rounded-full relative">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-8 py-4 bg-stone-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-xl active:scale-95">
          <Save className="w-5 h-5" /> Save Configuration
        </button>
      </div>
    </div>
  );
}
