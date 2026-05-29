import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, isAdmin } from '../lib/firebase';
import { syncService } from '../lib/firebaseService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isUserAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, isUserAdmin: false });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const auditExpiry = localStorage.getItem('kiddyapps_audit_expiry');
    const isAuditActive = localStorage.getItem('kiddyapps_audit_mode') === 'true' && auditExpiry && parseInt(auditExpiry) > Date.now();
    return isAuditActive ? { uid: 'audit_mock_uid', displayName: 'Audit Agent', email: 'audit@kiddyapps.local' } as User : null;
  });
  const [loading, setLoading] = useState<boolean>(() => {
    const auditExpiry = localStorage.getItem('kiddyapps_audit_expiry');
    const isAuditActive = localStorage.getItem('kiddyapps_audit_mode') === 'true' && auditExpiry && parseInt(auditExpiry) > Date.now();
    return !isAuditActive;
  });
  const [isUserAdmin, setIsUserAdmin] = useState<boolean>(() => {
    const auditExpiry = localStorage.getItem('kiddyapps_audit_expiry');
    return localStorage.getItem('kiddyapps_audit_mode') === 'true' && auditExpiry && parseInt(auditExpiry) > Date.now();
  });

  useEffect(() => {
    // Audit Mode Check on load
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('audit_mode') === 'true') {
        localStorage.setItem('kiddyapps_audit_mode', 'true');
        localStorage.setItem('kiddyapps_audit_expiry', (Date.now() + 24 * 60 * 60 * 1000).toString());
        window.location.href = window.location.origin;
        return;
    }

    const auditExpiry = localStorage.getItem('kiddyapps_audit_expiry');
    const isAuditActive = localStorage.getItem('kiddyapps_audit_mode') === 'true' && auditExpiry && parseInt(auditExpiry) > Date.now();

    if (isAuditActive) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        if (u.email) {
          syncService.recordUserLogin(u.email, u.displayName);
        }
        const adminStatus = await isAdmin(u.uid, u.email);
        setIsUserAdmin(adminStatus);
      } else {
        setIsUserAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isUserAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
