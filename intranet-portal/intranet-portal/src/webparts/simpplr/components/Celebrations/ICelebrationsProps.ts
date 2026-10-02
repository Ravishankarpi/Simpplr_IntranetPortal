import { WebPartContext } from '@microsoft/sp-webpart-base';

/**
 * Celebration item interface representing an individual employee celebration.
 */
export interface ICelebration {
  id: string;
  employeeName: string;
  celebrationType: string;
  years?: number;
  daysUntil: number;
  profileImage: string;
}

/**
 * Celebrations aggregate data model containing total upcoming count
 * and the list of celebration records.
 */
export interface ICelebrationsData {
  upcomingCount: number;
  celebrations: ICelebration[];
}

/**
 * Props for the Celebrations React component.
 */
export interface ICelebrationsProps {
  context?: WebPartContext;
  title?: string;
  data?: ICelebrationsData;
}
