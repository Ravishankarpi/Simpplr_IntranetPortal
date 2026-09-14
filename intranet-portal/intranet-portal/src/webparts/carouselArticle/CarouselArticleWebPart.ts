import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  PropertyPaneSlider,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'CarouselArticleWebPartStrings';
import CarouselArticle from './components/CarouselArticle';
import { ICarouselArticleProps } from './components/ICarouselArticleProps';
import { getSP } from '../../shared/pnpjsConfig';
import { SPService } from '../../shared/SPService';
import { IPropertyPaneDropdownOption } from '@microsoft/sp-property-pane';
import { PropertyFieldMultiSelect } from '@pnp/spfx-property-controls/lib/PropertyFieldMultiSelect';

export interface ICarouselArticleWebPartProps {
  description: string;
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
}

export default class CarouselArticleWebPart extends BaseClientSideWebPart<ICarouselArticleWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';
  private _siteOptions: IPropertyPaneDropdownOption[] = [];

  public render(): void {

    const element: React.ReactElement<ICarouselArticleProps> = React.createElement(
      CarouselArticle,
      {
        description: this.properties.description,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName,

        slideShowCount: this.properties.slideShowCount,
        maxSitePageCount: this.properties.maxSitePageCount,
        siteSelection: this.properties.siteSelection,
        sortingOption: this.properties.sortingOption,
        autoScrollTime: this.properties.autoScrollTime,
        showBanner: this.properties.showBanner !== undefined ? this.properties.showBanner : true,
        showSiteName: this.properties.showSiteName !== undefined ? this.properties.showSiteName : true,
        showTitle: this.properties.showTitle !== undefined ? this.properties.showTitle : true,
        showPublishedAt: this.properties.showPublishedAt !== undefined ? this.properties.showPublishedAt : true,
        showPostedBy: this.properties.showPostedBy !== undefined ? this.properties.showPostedBy : true,
        showSites: Array.isArray(this.properties.showSites) ? this.properties.showSites : (this.properties.showSites ? [this.properties.showSites as any] : []),
        carouselItemHeight: this.properties.carouselItemHeight || 150,
        context: this.context
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected async onInit(): Promise<void> {
    getSP(this.context);

    await this._fetchSitesForPropertyPane();

    return this._getEnvironmentMessage().then(message => {
      this._environmentMessage = message;
    });
  }

  private async _fetchSitesForPropertyPane(): Promise<void> {
    try {
      const sites = await SPService.getAllSubSites();
      this._siteOptions = sites.map(site => {
        return { key: site.Url, text: site.Title };
      });
    } catch (e) {
      console.error("Error fetching sites", e);
    }
  }

  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) {
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then(context => {
          let environmentMessage: string = '';
          switch (context.app.host.name) {
            case 'Office': environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment; break;
            case 'Outlook': environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment; break;
            case 'Teams':
            case 'TeamsModern': environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment; break;
            default: environmentMessage = strings.UnknownEnvironment;
          }
          return environmentMessage;
        });
    }
    return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) { return; }
    this._isDarkTheme = !!currentTheme.isInverted;
    const { semanticColors } = currentTheme;
    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: "Configure Carousel Article Settings" },
          groups: [
            {
              groupName: "Carousel Settings",
              groupFields: [
                PropertyPaneDropdown('slideShowCount', {
                  label: "Current Slide Show Count",
                  options: [
                    { key: 1, text: '1 Item' },
                    { key: 2, text: '2 Items' },
                    { key: 3, text: '3 Items' }
                  ],
                  selectedKey: 3
                }),
                PropertyPaneSlider('maxSitePageCount', {
                  label: "Max SitePage Count",
                  min: 3, max: 20, step: 1, value: 5
                }),
                PropertyPaneSlider('autoScrollTime', {
                  label: "Carousel Auto-scroll Time (seconds)",
                  min: 1, max: 10, step: 1, value: 3
                }),
                PropertyPaneSlider('carouselItemHeight', {
                  label: "Carousel Banner Height (px)",
                  min: 100, max: 500, step: 10, value: 150
                })
              ]
            },
            {
              groupName: "Data Fetching",
              groupFields: [
                PropertyPaneDropdown('siteSelection', {
                  label: "Site Selection",
                  options: [
                    { key: 'All', text: 'All sites' },
                    { key: 'Selected', text: 'Selected sites' }
                  ],
                  selectedKey: 'All'
                }),
                PropertyFieldMultiSelect('showSites', {
                  key: 'showSites',
                  label: "Show Sites",
                  options: this._siteOptions,
                  selectedKeys: Array.isArray(this.properties.showSites) ? this.properties.showSites : (this.properties.showSites ? [this.properties.showSites as any] : []),
                  disabled: this.properties.siteSelection !== 'Selected'
                }),
                PropertyPaneDropdown('sortingOption', {
                  label: "Sorting Option",
                  options: [
                    { key: 'Latest', text: 'Recent/Latest' },
                    { key: 'Popular', text: 'Popular' }
                  ],
                  selectedKey: 'Latest'
                })
              ]
            },
            {
              groupName: "UI Display Toggles",
              groupFields: [
                PropertyPaneToggle('showBanner', { label: "Show Banner/First Image", checked: true }),
                PropertyPaneToggle('showSiteName', { label: "Show Site Name", checked: true }),
                PropertyPaneToggle('showTitle', { label: "Show Title", checked: true }),
                PropertyPaneToggle('showPublishedAt', { label: "Show Published At", checked: true }),
                PropertyPaneToggle('showPostedBy', { label: "Show Posted By", checked: true })
              ]
            }
          ]
        }
      ]
    };
  }
}
