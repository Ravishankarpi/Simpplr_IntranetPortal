export interface INavItem {
  title: string;
  url?: string;
  openInNewTab?: boolean;
  subNav?: INavItem[];
}
