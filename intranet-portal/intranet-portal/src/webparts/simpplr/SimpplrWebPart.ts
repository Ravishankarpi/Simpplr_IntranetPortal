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
import { getSP } from '../../shared/pnpjsConfig';

export interface ISimpplrWebPartProps {
  title: string;
  carouselTitle?: string;
}

export default class SimpplrWebPart extends BaseClientSideWebPart<ISimpplrWebPartProps> {

  public render(): void {
    const normalizedTitle: string = (this.properties.title || '').trim().toLowerCase();

    let element: React.ReactElement;

    if (normalizedTitle === 'onecarousel') {
      const carouselProps: IOneCarouselProps = {
        title: this.properties.carouselTitle,
        context: this.context
      };
      element = React.createElement(OneCarousel, carouselProps);
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
        React.createElement(
          'p',
          { style: { margin: 0 } },
          this.properties.title
            ? `No component matching "${this.properties.title}". Please set Title to "oneCarousel" in the property pane.`
            : 'Please configure the web part by entering "oneCarousel" as the Title in the property pane.'
        )
      );
    }

    ReactDom.render(element, this.domElement);
  }

  protected async onInit(): Promise<void> {
    getSP(this.context);
    return super.onInit();
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
            description: 'Enter component name to load (e.g. "oneCarousel")'
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
