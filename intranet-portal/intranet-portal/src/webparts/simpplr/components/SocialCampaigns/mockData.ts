import { ISocialCampaignItem } from './ISocialCampaignsProps';

/**
 * Future SharePoint Integration Architecture:
 * ==============================================================
 * When connecting to SharePoint in a future phase:
 *
 * 1. Authoritative Root Site & Configuration:
 *    - Reuses `ROOT_SITE_URL` from `src/shared/Constant.ts`
 *    - Reuses `getSP(context)` from `src/shared/pnpjsConfig.ts`
 *    - No duplicate configuration or hard-coded SharePoint URLs.
 *
 * 2. Data Flow:
 *    SharePoint Site Pages / Social Campaigns List
 *          ↓
 *    PnPjs query (e.g. `sp.web.lists.getByTitle('SocialCampaigns').items.select(...)...`)
 *          ↓
 *    Data mapping layer converting SP items into `ISocialCampaignItem[]`
 *          ↓
 *    Passed via props to `SocialCampaigns.tsx`
 *          ↓
 *    UI renders dynamically without any layout modification needed.
 * ==============================================================
 */

export const mockSocialCampaigns: ISocialCampaignItem[] = [
  {
    id: '1',
    excerpt: "Empathy is understanding workers' feelings, a willin...",
    title: 'Employees Require Empathy: Here are Four Ways to Give It...',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=300&q=80',
    url: '#',
    shares: {
      facebook: 0,
      twitter: 0,
      linkedin: 0
    },
    category: 'latest'
  },
  {
    id: '2',
    excerpt: 'Explore the Employee Experience Report 2022. Acc...',
    title: 'State of employee experience 2022',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=300&q=80',
    url: '#',
    shares: {
      facebook: 0,
      twitter: 0,
      linkedin: 0
    },
    category: 'latest'
  },
  {
    id: '3',
    excerpt: "Discover insights from Simpplr's research on why intran...",
    title: "Simpplr Research: Empirical Data on Why Intranets Fail...",
    thumbnailUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=300&q=80',
    url: '#',
    shares: {
      facebook: 0,
      twitter: 0,
      linkedin: 0
    },
    category: 'latest'
  },
  {
    id: '4',
    excerpt: 'Forrester recently released The Forrester Wave™: Int...',
    title: 'Forrester Wave™ Names Simpplr a Leader in Intranet...',
    thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80',
    url: '#',
    shares: {
      facebook: 0,
      twitter: 0,
      linkedin: 0
    },
    category: 'latest'
  },
  {
    id: '4b',
    excerpt: 'Key strategies for fostering collaboration in remote teams...',
    title: 'Top 5 Hybrid Workplace Collaboration Strategies',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=300&q=80',
    url: '#',
    shares: {
      facebook: 3,
      twitter: 1,
      linkedin: 8
    },
    category: 'latest'
  },
  {
    id: '4c',
    excerpt: 'Insights into modern employee wellness and engagement initiatives...',
    title: 'Building a Culture of Recognition and Well-Being',
    thumbnailUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    url: '#',
    shares: {
      facebook: 5,
      twitter: 2,
      linkedin: 12
    },
    category: 'latest'
  },
  // Items for "popular" tab
  {
    id: '5',
    excerpt: 'Forrester recently released The Forrester Wave™: Int...',
    title: 'Forrester Wave™ Names Simpplr a Leader in Intranet...',
    thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80',
    url: '#',
    shares: {
      facebook: 12,
      twitter: 8,
      linkedin: 24
    },
    category: 'popular'
  },
  {
    id: '6',
    excerpt: "Empathy is understanding workers' feelings, a willin...",
    title: 'Employees Require Empathy: Here are Four Ways to Give It...',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=300&q=80',
    url: '#',
    shares: {
      facebook: 15,
      twitter: 6,
      linkedin: 19
    },
    category: 'popular'
  },
  {
    id: '7',
    excerpt: 'Explore the Employee Experience Report 2022. Acc...',
    title: 'State of employee experience 2022',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=300&q=80',
    url: '#',
    shares: {
      facebook: 9,
      twitter: 5,
      linkedin: 14
    },
    category: 'popular'
  },
  {
    id: '8',
    excerpt: "Discover insights from Simpplr's research on why intran...",
    title: "Simpplr Research: Empirical Data on Why Intranets Fail...",
    thumbnailUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=300&q=80',
    url: '#',
    shares: {
      facebook: 7,
      twitter: 4,
      linkedin: 11
    },
    category: 'popular'
  },
  {
    id: '9',
    excerpt: 'How leading enterprises align digital workplace culture with business growth...',
    title: 'The Modern Digital Workplace Blueprint',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=300&q=80',
    url: '#',
    shares: {
      facebook: 18,
      twitter: 11,
      linkedin: 32
    },
    category: 'popular'
  },
  {
    id: '10',
    excerpt: 'Practical steps for driving technology adoption and staff excitement...',
    title: 'Transforming Employee Engagement with Purpose',
    thumbnailUrl: 'https://images.unsplash.com/photo-1508873696983-2df5703bc20d?auto=format&fit=crop&w=300&q=80',
    url: '#',
    shares: {
      facebook: 21,
      twitter: 9,
      linkedin: 28
    },
    category: 'popular'
  }
];

