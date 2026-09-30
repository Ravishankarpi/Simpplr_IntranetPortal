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
  }
];
