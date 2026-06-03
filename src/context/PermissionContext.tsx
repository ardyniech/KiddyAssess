import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';
import { useAuth } from './AuthContext';
import { syncService } from '../lib/firebaseService';

export type PermissionAction =
    | 'add_student'             // Add a new student
    | 'edit_student'            // Edit existing student details
    | 'delete_student'          // Delete a student
    | 'fill_assessment'         // Input/edit grades & assessment scores
    | 'generate_report_narrative' // Generate AI narrative report text
    | 'edit_staff'              // Add/update teachers or school faculty
    | 'edit_finance'            // Manage budgets, track school billings
    | 'edit_inventory'          // Manage school resources/assets
    | 'edit_access_controls'    // Modify modular access configurations or user roles whitelisting
    | 'edit_school_settings'    // Edit school profiles, principal's name, digital signatures/stamps
    | 'manage_kanban'           // Manage kanban tasks
    | 'manage_attendance';      // Fill/edit attendance sheets

export const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
    MASTER: [
        'add_student',
        'edit_student',
        'delete_student',
        'fill_assessment',
        'generate_report_narrative',
        'edit_staff',
        'edit_finance',
        'edit_inventory',
        'edit_access_controls',
        'edit_school_settings',
        'manage_kanban',
        'manage_attendance'
    ],
    SUPER_USER: [
        'edit_access_controls',
        'edit_school_settings',
        'manage_kanban'
    ],
    ADMIN: [
        'add_student',
        'edit_student',
        'delete_student',
        'edit_staff',
        'edit_finance',
        'edit_inventory',
        'edit_school_settings',
        'manage_kanban',
        'manage_attendance'
    ],
    TEACHER: [
        'add_student',
        'edit_student',
        'delete_student',
        'fill_assessment',
        'generate_report_narrative',
        'edit_inventory',
        'manage_kanban',
        'manage_attendance'
    ],
    OPERATOR: [
        'add_student',
        'edit_student',
        'edit_inventory',
        'manage_kanban',
        'manage_attendance'
    ]
};

export interface PermissionContextType {
    userRole: UserRole;
    setUserRole: (role: UserRole) => void;
    canAccessModule: (moduleId: string, requiredRoles?: UserRole[]) => boolean;
    canPerformAction: (action: PermissionAction) => boolean;
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
        if (user) {
            const cleanEmail = user.email ? user.email.toLowerCase().trim() : '';
            const isArdy = cleanEmail === 'ardy.syafii@gmail.com';
            const key = cleanEmail ? cleanEmail.replace(/\./g, '_') : '';
            const actualDbRole = isArdy ? 'MASTER' : (accountRoles[key] || 'TEACHER');
            
            const rolePrecedence = ['MASTER', 'SUPER_USER', 'ADMIN', 'TEACHER', 'OPERATOR'];
            const actualIndex = rolePrecedence.indexOf(actualDbRole);
            const targetIndex = rolePrecedence.indexOf(role);
            
            // If trying to select a role higher than actual DB role, and not ardy
            if (targetIndex < actualIndex && !isArdy) {
                console.warn(`Action restricted: User cannot elevate role to ${role}`);
                return;
            }
        } else {
            // Unauthenticated state: prevent setting MASTER or SUPER_USER to avoid session leaks or unintended access
            if (role === 'MASTER' || role === 'SUPER_USER') {
                console.warn(`Action restricted: Cannot set ${role} role when unauthenticated.`);
                return;
            }
        }
        setUserRoleState(role);
        localStorage.setItem('user_role_context', role);
    };

    const getEffectiveRole = (): UserRole => {
        if (!user) return 'TEACHER';
        const cleanEmail = user.email ? user.email.toLowerCase().trim() : '';
        const isArdy = cleanEmail === 'ardy.syafii@gmail.com';
        const key = cleanEmail ? cleanEmail.replace(/\./g, '_') : '';
        const actualDbRole = isArdy ? 'MASTER' : (accountRoles[key] || 'TEACHER');
        
        const rolePrecedence = ['MASTER', 'SUPER_USER', 'ADMIN', 'TEACHER', 'OPERATOR'];
        const actualIndex = rolePrecedence.indexOf(actualDbRole);
        const activeIndex = rolePrecedence.indexOf(userRole);
        
        // Prevent bypassing role limitations via local storage
        if (activeIndex < actualIndex) {
            return actualDbRole;
        }
        return userRole;
    };

    const refreshDiscovery = async () => {
        const activeRole = getEffectiveRole();
        const cleanEmail = user?.email ? user.email.toLowerCase().trim() : '';
        if (cleanEmail === 'ardy.syafii@gmail.com' || activeRole === 'SUPER_USER') {
            try {
                const users = await syncService.getAllUsers();
                setDiscoveredUsers(users);
            } catch (e) {
                console.error("Failed to refresh user discovery list:", e);
            }
        }
    };

    useEffect(() => {
        const loadRoles = async () => {
            let targetRole: UserRole = 'TEACHER';
            try {
                const roles = await syncService.getAccountRoles();
                
                // Lowercase role keys to prevent double-role/case mismatch leaks
                const normalizedRoles: Record<string, UserRole> = {};
                Object.entries(roles).forEach(([k, val]) => {
                    normalizedRoles[k.toLowerCase()] = val;
                });
                setAccountRoles(normalizedRoles);

                const cleanEmail = user?.email ? user.email.toLowerCase().trim() : '';
                if (cleanEmail === 'ardy.syafii@gmail.com') {
                    targetRole = 'MASTER';
                    try {
                        const users = await syncService.getAllUsers();
                        setDiscoveredUsers(users);
                    } catch (e) {
                        console.error("Failed to load users for master admin:", e);
                    }
                } else if (cleanEmail) {
                    const key = cleanEmail.replace(/\./g, '_');
                    if (normalizedRoles[key]) {
                        targetRole = normalizedRoles[key];
                    } else {
                        targetRole = 'TEACHER';
                    }

                    if (targetRole === 'SUPER_USER') {
                        try {
                            const users = await syncService.getAllUsers();
                            setDiscoveredUsers(users);
                        } catch (e) {
                            console.error("Failed to load users for super user:", e);
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to load account roles, fallback to safest TEACHER role:", err);
                targetRole = 'TEACHER';
            } finally {
                const saved = localStorage.getItem('user_role_context') as UserRole | null;
                const rolePrecedence = ['MASTER', 'SUPER_USER', 'ADMIN', 'TEACHER', 'OPERATOR'];
                const allowedIndex = rolePrecedence.indexOf(targetRole);
                
                let finalRole = targetRole;
                if (saved) {
                    const savedIndex = rolePrecedence.indexOf(saved);
                    // Retain simulation only if it's within authorized bounds (role index is equal to or higher than allowed)
                    if (savedIndex >= allowedIndex) {
                        finalRole = saved;
                    }
                }
                
                setUserRoleState(finalRole);
                localStorage.setItem('user_role_context', finalRole);
            }
        };

        if (user) {
            loadRoles();
        } else {
            // When user is null (logged out or unauthenticated), enforce reset of special values
            const saved = localStorage.getItem('user_role_context');
            if (saved === 'MASTER' || saved === 'SUPER_USER') {
                setUserRoleState('TEACHER');
                localStorage.setItem('user_role_context', 'TEACHER');
            }
        }
    }, [user?.email]);

    const updateModuleOverride = (moduleId: string, allowedRoles: UserRole[]) => {
        const next = { ...moduleOverrides, [moduleId]: allowedRoles };
        setModuleOverrides(next);
        localStorage.setItem('module_access_overrides', JSON.stringify(next));
    };

    const updateAccountRole = async (email: string, role: UserRole) => {
        const cleanEmail = email.trim().toLowerCase();
        const key = cleanEmail.replace(/\./g, '_');
        await syncService.saveAccountRole(cleanEmail, role);
        setAccountRoles(prev => ({ ...prev, [key]: role }));
    };

    const removeAccountRole = async (email: string) => {
        const cleanEmail = email.trim().toLowerCase();
        const key = cleanEmail.replace(/\./g, '_');
        await syncService.deleteAccountRole(cleanEmail);
        setAccountRoles(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    const canAccessModule = (moduleId: string, defaultRoles?: UserRole[]) => {
        const effectiveRole = getEffectiveRole();
        if (effectiveRole === 'MASTER' || effectiveRole === 'SUPER_USER') return true;
        
        // Use explicitly overrode list if it exists, otherwise fall back to App default definition
        const effectiveRoles = moduleOverrides[moduleId] !== undefined 
            ? moduleOverrides[moduleId] 
            : defaultRoles;
            
        // Critical Leak Preventer: If access controls have explicitly toggled OFF all permitted roles,
        // it must mean restricted and closed down (return false instead of leaking to everyone).
        if (effectiveRoles && effectiveRoles.length === 0) return false;
        if (!effectiveRoles) return true; // Modul aslinya terbuka (seperti Dashboard)
        
        return effectiveRoles.includes(effectiveRole);
    };

    const canPerformAction = (action: PermissionAction): boolean => {
        const effectiveRole = getEffectiveRole();
        const allowedActions = ROLE_PERMISSIONS[effectiveRole] || [];
        return allowedActions.includes(action);
    };

    return (
        <PermissionContext.Provider value={{ 
            userRole: getEffectiveRole(), 
            setUserRole, 
            canAccessModule, 
            canPerformAction,
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

export interface ProtectProps {
    action?: PermissionAction;
    moduleId?: string;
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

export const Protect: React.FC<ProtectProps> = ({ action, moduleId, fallback = null, children }) => {
    const { canPerformAction, canAccessModule } = usePermissions();

    if (moduleId && !canAccessModule(moduleId)) {
        return <>{fallback}</>;
    }

    if (action && !canPerformAction(action)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
