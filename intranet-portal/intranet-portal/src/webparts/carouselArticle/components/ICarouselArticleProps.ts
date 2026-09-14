export interface ICarouselArticleProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  slideShowCount: number;
  maxSitePageCount: number;
  siteSelection: string;
  sortingOption: string;
  autoScrollTime: number;
  showBanner: boolean;
  showSiteName: boolean;
  showTitle: boolean;
  showPublishedAt: boolean;
  showPostedBy: boolean;
  showSites: string[];
  carouselItemHeight: number;
  context: any;
}

