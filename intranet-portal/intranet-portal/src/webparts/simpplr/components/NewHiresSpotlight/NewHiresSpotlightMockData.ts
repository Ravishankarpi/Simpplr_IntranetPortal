import { INewHireItem } from './INewHiresSpotlightProps';

/**
 * 10 sample realistic new hire employees matching the Welcome New Hires! layout.
 * Each employee record supports:
 * - Employee ID (stable unique key)
 * - Employee name (used for alt text and hover title)
 * - Profile image URL (circular portrait)
 * - Optional designation
 * - Optional department
 */
export const defaultNewHiresMockData: INewHireItem[] = [
  {
    id: 'emp-101',
    name: 'Emily Davis',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    designation: 'Product Designer',
    department: 'Design'
  },
  {
    id: 'emp-102',
    name: 'Chloe Wilson',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    designation: 'Software Engineer',
    department: 'Engineering'
  },
  {
    id: 'emp-103',
    name: 'Rachel Adams',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    designation: 'Marketing Specialist',
    department: 'Marketing'
  },
  {
    id: 'emp-104',
    name: 'Marcus Vance',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    designation: 'Financial Analyst',
    department: 'Finance'
  },
  {
    id: 'emp-105',
    name: 'Tariq Mansour',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    designation: 'Cloud Architect',
    department: 'Information Technology'
  },
  {
    id: 'emp-106',
    name: 'Jessica Taylor',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    designation: 'Operations Coordinator',
    department: 'Operations'
  },
  {
    id: 'emp-107',
    name: 'Sophia Martinez',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    designation: 'HR Specialist',
    department: 'Human Resources'
  },
  {
    id: 'emp-108',
    name: 'Hannah Brooks',
    imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    designation: 'Data Scientist',
    department: 'Analytics'
  },
  {
    id: 'emp-109',
    name: 'Laura Campbell',
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    designation: 'Account Manager',
    department: 'Sales'
  },
  {
    id: 'emp-110',
    name: 'Patricia White',
    imageUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80',
    designation: 'Customer Success Lead',
    department: 'Support'
  }
];
