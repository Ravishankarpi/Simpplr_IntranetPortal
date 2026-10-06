import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface ISocialShares {
  facebook: number;
  twitter: number;
  linkedin: number;
}

export interface ISocialCampaignItem {
  id: string;
  excerpt: string;
  title: string;
  thumbnailUrl: string;
  url: string;
  shares: ISocialShares;
  category: 'latest' | 'popular';
}

export interface ISocialCampaignsProps {
  context?: WebPartContext;
  title?: string;
  data?: ISocialCampaignItem[];
  itemCount?: number;
  showSeeMore?: boolean;
  seeMoreUrl?: string;
}

