import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface ICarouselItem {
  id: string | number;
  title: string;
  category: string;
  imageUrl: string;
  url?: string;
}

export interface IOneCarouselProps {
  title?: string;
  context?: WebPartContext;
  autoPlay?: boolean;
  interval?: number; // Timeframe in seconds (default: 5)
}

