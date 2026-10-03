import { INavItem, INavSection } from './IGlobalNavProps';

export const mockRailTopItems: INavItem[] = [
  { id: 'rail-home', title: 'Home', url: '/', iconName: 'Home', isActive: true },
  { id: 'rail-people', title: 'People', url: '#/people', iconName: 'People' },
  { id: 'rail-wave', title: 'Recognition', url: '#/recognition', iconName: 'Wave' },
  { id: 'rail-bookmark', title: 'Bookmarks', url: '#/bookmarks', iconName: 'Bookmark' },
  { id: 'rail-compass', title: 'Explore', url: '#/explore', iconName: 'Compass' }
];

export const mockRailBottomItems: INavItem[] = [
  { id: 'rail-analytics', title: 'Analytics', url: '#/analytics', iconName: 'Analytics' },
  { id: 'rail-trending', title: 'Trending', url: '#/trending', iconName: 'Trending' },
  { id: 'rail-settings', title: 'Settings', url: '#/settings', iconName: 'Settings' }
];

export const mockNavSections: INavSection[] = [
  {
    id: 'primary',
    title: '',
    collapsible: false,
    items: [
      { id: 'p-home', title: 'Home', url: '/', iconName: 'Home', isActive: true },
      { id: 'p-feed', title: 'Feed', url: '#/feed', iconName: 'Feed' },
      { id: 'p-hub', title: 'My Hub', url: '#/hub', iconName: 'Hub' },
      { id: 'p-onboarding', title: 'Onboarding', url: '#/onboarding', iconName: 'Onboarding' },
      { id: 'p-mustreads', title: 'Must reads', url: '#/must-reads', iconName: 'MustReads' },
      { id: 'p-reward', title: 'Reward store', url: '#/reward-store', iconName: 'RewardStore', hasChildren: true },
      { id: 'p-events', title: 'Events', url: '#/events', iconName: 'Events' }
    ]
  },
  {
    id: 'explore',
    title: 'Explore',
    collapsible: true,
    isExpanded: true,
    items: [
      { id: 'e-benefits', title: 'Benefits', url: '#/benefits', iconName: 'Circle', hasChildren: true },
      { id: 'e-culture', title: 'Culture & Recogni...', url: '#/culture', iconName: 'Culture', hasChildren: true },
      { id: 'e-career', title: 'Career & Learning', url: '#/career', iconName: 'Career', hasChildren: true }
    ]
  },
  {
    id: 'recent',
    title: 'Recently visited',
    collapsible: true,
    isExpanded: true,
    items: [
      {
        id: 'r-hr',
        title: 'Human Resources',
        url: '#/hr',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80',
        iconName: 'Site'
      },
      {
        id: 'r-growth',
        title: 'How We Grow Aga...',
        url: '#/growth',
        avatarUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=100&q=80',
        iconName: 'Site'
      },
      {
        id: 'r-allemp',
        title: 'All Employees',
        url: '#/all-employees',
        avatarUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=100&q=80',
        iconName: 'Site'
      },
      {
        id: 'r-improve',
        title: 'Improving Our Empl...',
        url: '#/experience',
        avatarUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=100&q=80',
        iconName: 'Site'
      }
    ]
  }
];
