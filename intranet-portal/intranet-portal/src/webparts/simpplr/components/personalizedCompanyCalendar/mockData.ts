export interface IPersonalizedCompanyCalendarItem {
  id: string | number;
  title: string;
  month: string;         // e.g., 'NOV'
  day: string | number;  // e.g., '3'
  formattedDate: string; // e.g., 'Thu, Nov 3'
  url?: string;
  location?: string;
}

export const upcomingCalendarData: IPersonalizedCompanyCalendarItem[] = [
  {
    id: 'u1',
    title: 'New Employee Incentives Program',
    month: 'NOV',
    day: '3',
    formattedDate: 'Thu, Nov 3',
    url: '#'
  },
  {
    id: 'u2',
    title: 'Global Rollout: Our EX Initiative',
    month: 'NOV',
    day: '7',
    formattedDate: 'Mon, Nov 7',
    url: '#'
  },
  {
    id: 'u3',
    title: 'New Hire Orientation',
    month: 'NOV',
    day: '28',
    formattedDate: 'Mon, Nov 28, 2022 at 9:00am',
    url: '#'
  },
  {
    id: 'u4',
    title: 'All-Hands Product Vision 2023',
    month: 'DEC',
    day: '5',
    formattedDate: 'Mon, Dec 5, 2022 at 10:00am',
    url: '#'
  },
  {
    id: 'u5',
    title: 'Annual Holiday Celebration & Awards',
    month: 'DEC',
    day: '16',
    formattedDate: 'Fri, Dec 16, 2022 at 4:00pm',
    url: '#'
  },
  {
    id: 'u6',
    title: 'Leadership Strategy Summit 2023',
    month: 'JAN',
    day: '12',
    formattedDate: 'Thu, Jan 12, 2023 at 10:00am',
    url: '#'
  },
  {
    id: 'u7',
    title: 'Quarterly Diversity & Inclusion Panel',
    month: 'JAN',
    day: '25',
    formattedDate: 'Wed, Jan 25, 2023 at 2:00pm',
    url: '#'
  }
];

export const popularCalendarData: IPersonalizedCompanyCalendarItem[] = [
  {
    id: 'p1',
    title: 'Global Rollout: Our EX Initiative',
    month: 'NOV',
    day: '7',
    formattedDate: 'Mon, Nov 7',
    url: '#'
  },
  {
    id: 'p2',
    title: 'Annual Holiday Celebration & Awards',
    month: 'DEC',
    day: '16',
    formattedDate: 'Fri, Dec 16, 2022 at 4:00pm',
    url: '#'
  },
  {
    id: 'p3',
    title: 'New Employee Incentives Program',
    month: 'NOV',
    day: '3',
    formattedDate: 'Thu, Nov 3',
    url: '#'
  },
  {
    id: 'p4',
    title: 'Executive Q&A Live Session',
    month: 'DEC',
    day: '1',
    formattedDate: 'Thu, Dec 1, 2022 at 11:00am',
    url: '#'
  },
  {
    id: 'p5',
    title: 'Health & Wellness Benefits Workshop',
    month: 'JAN',
    day: '18',
    formattedDate: 'Wed, Jan 18, 2023 at 1:00pm',
    url: '#'
  },
  {
    id: 'p6',
    title: 'Product Innovation Demo Day',
    month: 'FEB',
    day: '3',
    formattedDate: 'Fri, Feb 3, 2023 at 3:00pm',
    url: '#'
  }
];

