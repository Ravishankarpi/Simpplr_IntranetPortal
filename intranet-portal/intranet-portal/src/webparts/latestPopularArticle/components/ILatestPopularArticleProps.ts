export interface ILatestPopularArticleProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  maxSitePageCount: number;
  siteSelection: string;
  layoutView: string; // List, Row
  showBanner: boolean;
  showSiteName: boolean;
  showTitle: boolean;
  showPublishedAt: boolean;
  showPostedBy: boolean;
  showSites: string[];
  context: any;
}
