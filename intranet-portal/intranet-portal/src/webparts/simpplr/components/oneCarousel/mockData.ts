import { ICarouselItem } from './IOneCarouselProps';
import { ROOT_SITE_URL } from '../../../../shared/Constant';

export const mockCarouselItems: ICarouselItem[] = [
  {
    id: 1,
    title: 'Announcing an Acquisition',
    category: 'Corporate Communication',
    imageUrl: ROOT_SITE_URL + '/SiteAssets/carousel/Announcing an Acquisition.png',
    url: '#',
    publishedDate: 'Oct 1, 2026'
  },
  {
    id: 2,
    title: 'What Makes a Good Manager?',
    category: 'Leadership',
    imageUrl: ROOT_SITE_URL + '/SiteAssets/carousel/What Makes a Good Manager.png',
    url: '#',
    publishedDate: 'Sep 25, 2026'
  },
  {
    id: 3,
    title: 'Improving Our Employee Experience',
    category: 'Employee Experience',
    imageUrl: ROOT_SITE_URL + '/SiteAssets/carousel/Improving Our Employee Experience.png',
    url: '#',
    publishedDate: 'Sep 18, 2026'
  },
  {
    id: 4,
    title: 'New Rollout Initiative',
    category: 'Corporate Communication',
    imageUrl: ROOT_SITE_URL + '/SiteAssets/carousel/New Rollout Initiative.png',
    url: '#',
    publishedDate: 'Sep 10, 2026'
  },
  {
    id: 5,
    title: 'AI Policies',
    category: 'Technology',
    imageUrl: ROOT_SITE_URL + '/SiteAssets/carousel/AI Policies.png',
    url: '#',
    publishedDate: 'Sep 3, 2026'
  },
  {
    id: 6,
    title: 'Company Benefits Program',
    category: 'Human Resources',
    imageUrl: ROOT_SITE_URL + '/SiteAssets/carousel/Company Benefits Program.png',
    url: '#',
    publishedDate: 'Aug 28, 2026'
  }
];