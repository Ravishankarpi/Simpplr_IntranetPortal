import { ApplicationCustomizerContext } from '@microsoft/sp-application-base';

export interface INavItem {
  id: string;
  title: string;
  url: string;
  iconName?: string;
  avatarUrl?: string;
  hasChildren?: boolean;
  isActive?: boolean;
  category?: 'primary' | 'explore' | 'recent' | 'rail';
  orderNumber?: number;
}

export interface INavSection {
  id: string;
  title: string;
  collapsible?: boolean;
  isExpanded?: boolean;
  items: INavItem[];
}

export interface IGlobalNavProps {
  context: ApplicationCustomizerContext;
  railItems?: INavItem[];
  sections?: INavSection[];
  rootSiteUrl?: string;
}
