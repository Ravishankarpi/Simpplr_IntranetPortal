import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  type IPropertyPaneGroup,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as strings from 'SimpplrWebPartStrings';
import OneCarousel from './components/oneCarousel/OneCarousel';
import { IOneCarouselProps } from './components/oneCarousel/IOneCarouselProps';
import PersonalizedCompanyNews, { IPersonalizedCompanyNewsProps } from './components/personalizedCompanyNews/PersonalizedCompanyNews';
import PersonalizedCompanyCalendar, { IPersonalizedCompanyCalendarProps } from './components/personalizedCompanyCalendar/PersonalizedCompanyCalendar';
import Celebrations from './components/Celebrations/Celebrations';
import { ICelebrationsProps } from './components/Celebrations/ICelebrationsProps';
import SocialCampaigns from './components/SocialCampaigns/SocialCampaigns';
import { ISocialCampaignsProps } from './components/SocialCampaigns/ISocialCampaignsProps';
import { getSP } from '../../shared/pnpjsConfig';
import './SimpplrWebPart.module.scss';

export interface ISimpplrWebPartProps {
  title: string;
  carouselTitle?: string;
  newsTitle?: string;
  calendarTitle?: string;
  celebrationsTitle?: string;
  socialCampaignsTitle?: string;
}

export default class SimpplrWebPart extends BaseClientSideWebPart<ISimpplrWebPartProps> {

  public render(): void {
    this._applyCanvasPadding();

    const normalizedTitle: string = (this.properties.title || '').trim().toLowerCase();

    let element: React.ReactElement;

    if (normalizedTitle === 'onecarousel') {
      const carouselProps: IOneCarouselProps = {
        title: this.properties.carouselTitle,
        context: this.context
      };
      element = React.createElement(OneCarousel, carouselProps);
    } else if (normalizedTitle === 'personalizedcompanynews') {
      const newsProps: IPersonalizedCompanyNewsProps = {
        context: this.context,
        newsTitle: this.properties.newsTitle || 'Personalized Company News'
      };
      element = React.createElement(PersonalizedCompanyNews, newsProps);
    } else if (normalizedTitle === 'personalizedcompanycalendar') {
      const calendarProps: IPersonalizedCompanyCalendarProps = {
        context: this.context,
        calendarTitle: this.properties.calendarTitle || 'Personalized Company Calendar'
      };
      element = React.createElement(PersonalizedCompanyCalendar, calendarProps);
    } else if (normalizedTitle === 'celebrations') {
      const celebrationsProps: ICelebrationsProps = {
        context: this.context,
        title: this.properties.celebrationsTitle || 'Celebrations'
      };
      element = React.createElement(Celebrations, celebrationsProps);
    } else if (normalizedTitle === 'socialcampaigns') {
      const socialProps: ISocialCampaignsProps = {
        context: this.context,
        title: this.properties.socialCampaignsTitle || 'Social campaigns'
      };
      element = React.createElement(SocialCampaigns, socialProps);
    } else {
      // Fallback display when title does not match an existing component
      element = React.createElement(
        'div',
        {
          style: {
            padding: '24px',
            border: '2px dashed #0078d4',
            borderRadius: '6px',
            backgroundColor: '#f8f9fa',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: '#333333'
          }
        },
        React.createElement('h3', { style: { margin: '0 0 8px 0', color: '#0078d4' } }, 'Simpplr Web Part'),
        // React.createElement(
        //   'p',
        //   { style: { margin: 0 } },
        //   this.properties.title
        //     ? `No component matching "${this.properties.title}". Please set Title to "oneCarousel", "celebrations", "socialCampaigns", "personalizedCompanyNews", or "personalizedCompanyCalendar" in the property pane.`
        //     : 'Please configure the web part by entering "oneCarousel", "celebrations", "socialCampaigns", "personalizedCompanyNews", or "personalizedCompanyCalendar" as the Title in the property pane.'
        // )
      );
    }

    ReactDom.render(element, this.domElement);
  }

  protected async onInit(): Promise<void> {
    getSP(this.context);
    this._applyCanvasPadding();
    return super.onInit();
  }

  private _applyCanvasPadding(): void {
    const styleId: string = 'simpplr-canvas-control-style';
    if (!document.getElementById(styleId)) {
      const styleEl: HTMLStyleElement = document.createElement('style');
      styleEl.id = styleId;
      styleEl.type = 'text/css';
      styleEl.innerHTML = `
        [data-type="CanvasControlEdit"] {
          padding: 5px !important;
        }
      `;
      document.head.appendChild(styleEl);
    }

    if (this.domElement) {
      const canvasControl: HTMLElement | null = this.domElement.closest('[data-type="CanvasControlEdit"]') as HTMLElement;
      if (canvasControl) {
        canvasControl.style.setProperty('padding', '5px', 'important');
      }
    }
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get disableReactivePropertyChanges(): boolean {
    return false;
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    const normalizedTitle: string = (this.properties.title || '').trim().toLowerCase();

    // Default group: Component selector by Title
    const groups: IPropertyPaneGroup[] = [
      {
        groupName: strings.BasicGroupName,
        groupFields: [
          PropertyPaneTextField('title', {
            label: strings.TitleFieldLabel,
            description: 'Enter component name to load (e.g. "oneCarousel", "celebrations", "socialCampaigns", "personalizedCompanyNews", or "personalizedCompanyCalendar")'
          })
        ]
      }
    ];

    // Conditionally add oneCarousel properties when Title matches "oneCarousel"
    if (normalizedTitle === 'onecarousel') {
      groups.push({
        groupName: 'oneCarousel Settings',
        groupFields: [
          PropertyPaneTextField('carouselTitle', {
            label: 'Display Title',
            description: 'Optional heading displayed above the carousel'
          })
        ]
      });
    } else if (normalizedTitle === 'personalizedcompanynews') {
      groups.push({
        groupName: 'Personalized Company News Settings',
        groupFields: [
          PropertyPaneTextField('newsTitle', {
            label: 'News Title',
            description: 'Heading displayed above the news feed'
          })
        ]
      });
    } else if (normalizedTitle === 'personalizedcompanycalendar') {
      groups.push({
        groupName: 'Personalized Company Calendar Settings',
        groupFields: [
          PropertyPaneTextField('calendarTitle', {
            label: 'Calendar Title',
            description: 'Heading displayed above the calendar widget'
          })
        ]
      });
    } else if (normalizedTitle === 'celebrations') {
      groups.push({
        groupName: 'Celebrations Settings',
        groupFields: [
          PropertyPaneTextField('celebrationsTitle', {
            label: 'Celebrations Title',
            description: 'Heading displayed above the Celebrations section'
          })
        ]
      });
    } else if (normalizedTitle === 'socialcampaigns') {
      groups.push({
        groupName: 'Social Campaigns Settings',
        groupFields: [
          PropertyPaneTextField('socialCampaignsTitle', {
            label: 'Social Campaigns Title',
            description: 'Heading displayed above the Social Campaigns section'
          })
        ]
      });
    }

    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: groups
        }
      ]
    };
  }
}
