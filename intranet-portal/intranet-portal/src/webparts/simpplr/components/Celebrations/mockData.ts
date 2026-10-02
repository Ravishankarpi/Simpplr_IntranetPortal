import { ICelebration, ICelebrationsData } from './ICelebrationsProps';

/**
 * Future SharePoint Integration Architecture:
 * ==============================================================
 * When connecting to SharePoint in a future release:
 *
 * 1. Authoritative Root Site & Configuration:
 *    - Reuse existing `ROOT_SITE_URL` from `src/shared/Constant.ts`
 *    - Reuse existing `getSP(context)` from `src/shared/pnpjsConfig.ts`
 *    - DO NOT instantiate new PnPjs clients or hard-code SharePoint URLs.
 *
 * 2. Data Flow:
 *    SharePoint List / Site Pages (Celebrations List or User Profiles)
 *          ↓
 *    PnPjs query (e.g. `sp.web.lists.getByTitle('Celebrations').items...`)
 *          ↓
 *    Mapping layer converting SP items into `ICelebration[]` & `upcomingCount`
 *          ↓
 *    `ICelebrationsData` passed via props to `Celebrations.tsx`
 *          ↓
 *    Celebrations UI renders dynamically with zero UI changes required.
 * ==============================================================
 */

export const defaultCelebrationsData: ICelebrationsData = {
  upcomingCount: 20,
  celebrations: [
    {
      id: '1',
      employeeName: 'Tom Keller',
      celebrationType: 'Work Anniversary',
      years: 4,
      daysUntil: 4,
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: '2',
      employeeName: 'Sarah Wilson',
      celebrationType: 'Birthday',
      daysUntil: 6,
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: '3',
      employeeName: 'David Miller',
      celebrationType: 'Work Anniversary',
      years: 8,
      daysUntil: 9,
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: '4',
      employeeName: 'Emily Chen',
      celebrationType: 'Work Anniversary',
      years: 2,
      daysUntil: 12,
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: '5',
      employeeName: 'Michael Brown',
      celebrationType: 'Birthday',
      daysUntil: 15,
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80'
    }
  ]
};
