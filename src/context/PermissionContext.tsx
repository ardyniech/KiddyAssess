import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';
import { useAuth } from './AuthContext';
import { syncService } from '../lib/firebaseService';

interface PermissionContextType {
    userRole: UserRole;
    setUserRole: (role: UserRole) => void;
    canAccessModule: (moduleId: string, requiredRoles?: UserRole[]) => boolean;
    moduleOverrides: Record<string, UserRole[]>;
    updateModuleOverride: (moduleId: string, allowedRoles: UserRole[]) => void;
    accountRoles: Record<string, UserRole>;
    updateAccountRole: (email: string, role: UserRole) => Promise<void>;
    removeAccountRole: (email: string) => Promise<void>;
    discoveredUsers: any[];
    refreshDiscovery: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    
    // Default to TEACHER for safety, load from localStorage if present
    const [userRole, setUserRoleState] = useState<UserRole>(() => {
        const saved = localStorage.getItem('user_role_context');
        return (saved as UserRole) || 'TEACHER';
    });

    const [accountRoles, setAccountRoles] = useState<Record<string, UserRole>>({});
    const [discoveredUsers, setDiscoveredUsers] = useState<any[]>([]);
    const [moduleOverrides, setModuleOverrides] = useState<Record<string, UserRole[]>>(() => {
        const saved = localStorage.getItem('module_access_overrides');
        return saved ? JSON.parse(saved) : {};
    });

    const setUserRole = (role: UserRole) => {
        setUserRoleState(role);
        localStorage.setItem('user_role_context', role);
    };

    const refreshDiscovery = async () => {
        if (user?.email === 'ardy.syafii@gmail.com' || userRole === 'SUPER_USER') {
            const users = await syncService.getAllUsers();
            setDiscoveredUsers(users);
        }
    };

    useEffect(() => {
        const loadRoles = async () => {
            try {
                const roles = await syncService.getAccountRoles();
                setAccountRoles(roles);

                // Priority 1: Master hardcoded for ardy
                if (user?.email === 'ardy.syafii@gmail.com') {
                    setUserRole('MASTER');
                    // Master can see discovery list
                    const users = await syncService.getAllUsers();
                    setDiscoveredUsers(users);
                } 
                // Priority 2: Account-specific role from cloud
                else if (user?.email) {
                    const key = user.email.replace(/\./g, '_');
                    if (roles[key]) {
                        setUserRole(roles[key]);
                    } else {
                        // Priority 3: Default for ANY new user
                        setUserRole('TEACHER');
                    }

                    // Superuser can also see discovery list
                    if (roles[key] === 'SUPER_USER') {
                        const users = await syncService.getAllUsers();
                        setDiscoveredUsers(users);
                    }
                }
            } catch (err) {
                console.error("Failed to load account roles:", err);
            }
        };

        if (user) {
            loadRoles();
        }
    }, [user?.email]);

    const updateModuleOverride = (moduleId: string, allowedRoles: UserRole[]) => {
        const next = { ...moduleOverrides, [moduleId]: allowedRoles };
        setModuleOverrides(next);
        localStorage.setItem('module_access_overrides', JSON.stringify(next));
    };

    const updateAccountRole = async (email: string, role: UserRole) => {
        const key = email.replace(/\./g, '_');
        await syncService.saveAccountRole(email, role);
        setAccountRoles(prev => ({ ...prev, [key]: role }));
    };

    const removeAccountRole = async (email: string) => {
        const key = email.replace(/\./g, '_');
        await syncService.deleteAccountRole(email);
        setAccountRoles(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    const canAccessModule = (moduleId: string, defaultRoles?: UserRole[]) => {
        if (userRole === 'MASTER' || userRole === 'SUPER_USER') return true;
        
        const effectiveRoles = moduleOverrides[moduleId] || defaultRoles;
        if (!effectiveRoles || effectiveRoles.length === 0) return true;
        
        return effectiveRoles.includes(userRole);
    };

    return (
        <PermissionContext.Provider value={{ 
            userRole, 
            setUserRole, 
            canAccessModule, 
            moduleOverrides, 
            updateModuleOverride,
            accountRoles,
            updateAccountRole,
            removeAccountRole,
            discoveredUsers,
            refreshDiscovery
        }}>
            {children}
        </PermissionContext.Provider>
    );
};

export const usePermissions = () => {
    const context = useContext(PermissionContext);
    if (!context) throw new Error('usePermissions must be used within PermissionProvider');
    return context;
};
