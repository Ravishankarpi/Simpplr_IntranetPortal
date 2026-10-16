import { WebPartContext } from '@microsoft/sp-webpart-base';

/**
 * Individual employee item for the Welcome New Hires spotlight.
 */
export interface INewHireItem {
  id: string;
  name: string;
  imageUrl: string;
  designation?: string;
  department?: string;
}

/**
 * Props for the NewHiresSpotlight React component.
 */
export interface INewHiresSpotlightProps {
  context?: WebPartContext;
  title?: string;
  items?: INewHireItem[];
}
