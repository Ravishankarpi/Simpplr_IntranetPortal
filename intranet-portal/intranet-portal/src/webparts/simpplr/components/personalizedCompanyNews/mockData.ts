export interface IPersonalizedCompanyNewsItem {
  id: string | number;
  title: string;
  category: string;
  contentType: 'MUST READ' | 'PAGE';
  imageUrl: string;
  url?: string;
  date: string;
  isFeatured?: boolean;
}

export const latestNewsData: IPersonalizedCompanyNewsItem[] = [
  {
    id: 'l1',
    title: 'Employee Incentive Program',
    category: 'Human Resources',
    contentType: 'MUST READ',
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80',
    url: '#',
    date: 'Oct 16, 2022',
    isFeatured: true
  },
  {
    id: 'l2',
    title: 'Where are we? Progress check-in',
    category: 'CEO Corner',
    contentType: 'PAGE',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    url: '#',
    date: 'Oct 6, 2022',
    isFeatured: false
  },
  {
    id: 'l3',
    title: 'Global Town Hall',
    category: 'All Employees',
    contentType: 'PAGE',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
    url: '#',
    date: 'Oct 6, 2022',
    isFeatured: false
  },
  {
    id: 'l4',
    title: 'New Workplace Flexibility Guidelines',
    category: 'People Team',
    contentType: 'PAGE',
    imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80',
    url: '#',
    date: 'Sep 29, 2022',
    isFeatured: false
  },
  {
    id: 'l5',
    title: 'Q3 Innovation & Technology Showcase',
    category: 'Engineering',
    contentType: 'PAGE',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80',
    url: '#',
    date: 'Sep 22, 2022',
    isFeatured: false
  },
  {
    id: 'l6',
    title: 'Diversity in Leadership: Our Commitment',
    category: 'DE&I',
    contentType: 'PAGE',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    url: '#',
    date: 'Sep 15, 2022',
    isFeatured: false
  },
  {
    id: 'l7',
    title: 'Sustainability Milestones: Solar Energy Transition',
    category: 'Operations',
    contentType: 'PAGE',
    imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5703bc20d?auto=format&fit=crop&w=600&q=80',
    url: '#',
    date: 'Sep 8, 2022',
    isFeatured: false
  }
];

export const popularNewsData: IPersonalizedCompanyNewsItem[] = [
  {
    id: 'p1',
    title: 'Annual Benefits Enrollment & Health Perks',
    category: 'Human Resources',
    contentType: 'MUST READ',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    url: '#',
    date: 'Oct 14, 2022',
    isFeatured: true
  },
  {
    id: 'p2',
    title: 'Global Town Hall Highlights & Q&A',
    category: 'All Employees',
    contentType: 'PAGE',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
    url: '#',
    date: 'Oct 8, 2022',
    isFeatured: false
  },
  {
    id: 'p3',
    title: 'Leadership Strategy Roadmap 2023',
    category: 'CEO Corner',
    contentType: 'PAGE',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
    url: '#',
    date: 'Oct 5, 2022',
    isFeatured: false
  },
  {
    id: 'p4',
    title: 'Security Awareness: Multi-Factor Authentication',
    category: 'Information Security',
    contentType: 'PAGE',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
    url: '#',
    date: 'Oct 1, 2022',
    isFeatured: false
  },
  {
    id: 'p5',
    title: 'Remote Collaboration Best Practices & Toolkits',
    category: 'Productivity',
    contentType: 'PAGE',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
    url: '#',
    date: 'Sep 25, 2022',
    isFeatured: false
  },
  {
    id: 'p6',
    title: 'New Health and Wellbeing Subsidy Program',
    category: 'People Team',
    contentType: 'PAGE',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
    url: '#',
    date: 'Sep 18, 2022',
    isFeatured: false
  }
];

