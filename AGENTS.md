# Core Setup Memory
The project leverages a robust Authentication / Access control system. 

## Role Contexts:
- **MASTER**: Master account show all tree navigation and advanced configs. 
- **SUPER_USER**: Systems config, slightly limited. 
- **ADMIN**: Kepsek (Headmaster) Role. School administration level. 
- **TEACHER**: Guru. The core target user. Default layout targets this. 
- **OPERATOR**: TU (administration) data entry system. 

## UI / Layout:
- **Smart Header**: Features dynamic role badges, contextual action menus, and click-to-open smart sidebar module selections.
- **Smart Navigation Tree**: Sidebars only show the specific modules available to the active Role, grouped cleanly into application domains (Admin, Assess, Reports, etc).
- **Splash Screens**: Each role has a distinct Splash screen title, subtitle, and color variant.
- **Reports Dashboard**: Unified Hub for dispatching standard, Kartika5NK, and custom reports.
- **Accessibility & UX**: All text MUST maintain high contrast ratios (WCAG AAA). UI components must be touch-optimized (min 44px). No black-on-black or low-contrast elements allowed.
- **Role-Based UX**: The UI state MUST strictly map navigation options to roles.

## System Dependencies:
- **Firebase Auth** is configured to handle account creation & session. Role mapping handled in UI state temporarily for UX validation.
- **IndexedDB (Dexie)** is the primary offline datastore.
- **Tailwind V4** and **Motion** (Framer Motion) animate the UI transitions out of the box.

## Communication & Integrity Policy:
- **Absolute Honesty**: Always state explicitly if a feature is not implemented. Do not claim success or 'implemented' if requirements are still pending.
- **Verification Rule**: Only report a task as completed when it has been fully implemented, built, and verified to be 100% functional with no errors or bugs.

## Audit & Bug Fix Histori (Resolved):
1. **Dynamic Seeding Engine**: Automatic offline student mock dataset seeding on cold launch ensures no empty, broken, or unseeded screens.
2. **Infinite Pagination Cycle Elimination**: Split pagination resets into a synchronous reactive `useEffect` block, cleaning up render cycles.
3. **Flicker-Free Role Transition Splash Screens**: Configured AnimatePresence & refs to capture role transitions, showing high contrast role-based welcome panels instantly.
4. **Header Navigation Links Alignment**: Aligned settings & shortcut tabs onto the safe validation router (`navigateToModule`), clearing inactive/stale context locks.
5. **Standard Side Nav Redesign**: Replaced the fuzzy blue theme with soft high-contrast cards, sharp borders, and elevated touch targets (min 44px).
6. **Assessment Child-Label Contrast Upgrade**: Eliminated light `#8e8e93` grays on children name subline templates, bringing accessibility to high WCAG AAA compliance.

