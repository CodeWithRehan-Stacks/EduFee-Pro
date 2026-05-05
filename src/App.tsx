/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { auth, db, loginWithGoogle, logout, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { UserProfile, School } from './types';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Students } from './components/Students';
import { Invoices } from './components/Invoices';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { Landing } from './components/Landing';
import { SetupSchool } from './components/SetupSchool';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const profileDoc = await getDoc(doc(db, 'users', u.uid));
          if (profileDoc.exists()) {
            const pData = profileDoc.data() as UserProfile;
            setProfile({ ...pData, id: profileDoc.id });
            
            const schoolDoc = await getDoc(doc(db, 'schools', pData.schoolId));
            if (schoolDoc.exists()) {
              setSchool({ id: schoolDoc.id, ...schoolDoc.data() } as School);
            }
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${u.uid}`);
        }
      } else {
        setProfile(null);
        setSchool(null);
      }
      setLoading(false);
    });
  }, []);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        // Silent fail for user-initiated closure
        return;
      }
      console.error('Login Error:', error);
      alert('Authentication failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-stone-50">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  if (!user) {
    return <Landing onLogin={handleLogin} />;
  }

  if (!profile || !school) {
    return <SetupSchool user={user} onComplete={(p, s) => { setProfile(p); setSchool(s); }} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard school={school} />;
      case 'students': return <Students school={school} />;
      case 'invoices': return <Invoices school={school} />;
      case 'reports': return <Reports school={school} />;
      case 'settings': return <Settings school={school} />;
      default: return <Dashboard school={school} />;
    }
  };

  return (
    <Layout 
      user={profile} 
      school={school} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      onLogout={logout}
    >
      {renderContent()}
    </Layout>
  );
}

