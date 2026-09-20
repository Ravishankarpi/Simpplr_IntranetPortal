import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle,
  PropertyPaneDropdown,
  PropertyPaneSlider,
  PropertyPaneLabel,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import {
  PropertyFieldFilePicker,
  IFilePickerResult
} from '@pnp/spfx-property-controls/lib/PropertyFieldFilePicker';

import SiteBanner from './components/SiteBanner';
import { ISiteBannerProps } from './components/ISiteBannerProps';

export interface ISiteBannerWebPartProps {
  // Background
  backgroundType: string;
  backgroundColor: string;
  backgroundImageUrl: string;
  backgroundImageFilePickerResult: IFilePickerResult;
  backgroundImageFit: string;
  overlayType: string;
  overlayOpacity: number;

  // Layout
  bannerHeight: number;
  borderRadius: number;
  contentPadding: number;
  contentAlignment: string;
  showBoxShadow: boolean;

  // Site image
  showSiteImage: boolean;
  siteImageUrl: string;
  siteImageFilePickerResult: IFilePickerResult;
  siteImageSize: number;
  siteImageShape: string;

  // Content
  showEyebrow: boolean;
  eyebrowText: string;
  showTitle: boolean;
  title: string;
  titleFontSize: number;
  showDescription: boolean;
  description: string;

  // CTA Button
  showButton: boolean;
  buttonText: string;
  buttonUrl: string;
  buttonOpenInNewTab: boolean;
  buttonStyle: string;
  buttonBgColor: string;
  buttonTextColor: string;
  buttonBorderRadius: string;

  // Style
  textColor: string;
}

export default class SiteBannerWebPart extends BaseClientSideWebPart<ISiteBannerWebPartProps> {

  private _isDarkTheme: boolean = false;

  public render(): void {
    const p = this.properties;
    const element: React.ReactElement<ISiteBannerProps> = React.createElement(
      SiteBanner,
      {
        isDarkTheme:    this._isDarkTheme,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        context: this.context,

        // Background
        backgroundType:                   p.backgroundType             || 'color',
        backgroundColor:                  p.backgroundColor            || '',
        backgroundImageUrl:               p.backgroundImageUrl         || '',
        backgroundImageFilePickerResult:  p.backgroundImageFilePickerResult,
        backgroundImageFit:               p.backgroundImageFit         || 'cover',
        overlayType:                      p.overlayType                || 'none',
        overlayOpacity:                   p.overlayOpacity             !== undefined ? p.overlayOpacity : 0.35,

        // Layout
        bannerHeight:       p.bannerHeight    !== undefined ? p.bannerHeight    : 180,
        borderRadius:       p.borderRadius    !== undefined ? p.borderRadius    : 10,
        contentPadding:     p.contentPadding  !== undefined ? p.contentPadding  : 28,
        contentAlignment:   p.contentAlignment                               || 'left',
        showBoxShadow:      p.showBoxShadow   !== undefined ? p.showBoxShadow   : true,

        // Site image
        showSiteImage:              p.showSiteImage !== undefined ? p.showSiteImage : true,
        siteImageUrl:               p.siteImageUrl  || '',
        siteImageFilePickerResult:  p.siteImageFilePickerResult,
        siteImageSize:              p.siteImageSize  !== undefined ? p.siteImageSize  : 100,
        siteImageShape:             p.siteImageShape || 'rounded',

        // Content
        showEyebrow:    p.showEyebrow    !== undefined ? p.showEyebrow    : true,
        eyebrowText:    p.eyebrowText    || '',
        showTitle:      p.showTitle      !== undefined ? p.showTitle      : true,
        title:          p.title          || '',
        titleFontSize:  p.titleFontSize  || 0,   // 0 = use clamp default
        showDescription: p.showDescription !== undefined ? p.showDescription : true,
        description:    p.description    || '',

        // CTA Button
        showButton:        p.showButton        !== undefined ? p.showButton : true,
        buttonText:        p.buttonText        || 'Learn More',
        buttonUrl:         p.buttonUrl         || '',
        buttonOpenInNewTab: p.buttonOpenInNewTab !== undefined ? p.buttonOpenInNewTab : true,
        buttonStyle:       p.buttonStyle       || 'solid',
        buttonBgColor:     p.buttonBgColor     || '',
        buttonTextColor:   p.buttonTextColor   || '',
        buttonBorderRadius: p.buttonBorderRadius || 'rounded',

        // Style
        textColor: p.textColor || '#1a1a1a',
      }
    );
    ReactDom.render(element, this.domElement);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) return;
    this._isDarkTheme = !!currentTheme.isInverted;
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  /* ── Intercept property changes to extract image URLs ─────────────
   *  Overriding onPropertyPaneFieldChanged is the correct SPFx pattern.
   *  We NEVER call this.render() while the property pane is active —
   *  the framework calls render() automatically after this method returns.
   *  The only exception is async FileReader (local upload), where we must
   *  call render() ourselves once the data URL is ready.
   * ───────────────────────────────────────────────────────────────── */
  protected onPropertyPaneFieldChanged(
    propertyPath: string,
    _oldValue: any,  // eslint-disable-line @typescript-eslint/no-explicit-any
    newValue: any    // eslint-disable-line @typescript-eslint/no-explicit-any
  ): void {
    super.onPropertyPaneFieldChanged(propertyPath, _oldValue, newValue);

    const extractUrl = (
      result: IFilePickerResult,
      urlProp: 'backgroundImageUrl' | 'siteImageUrl'
    ) => {
      if (!result) return;
      if (result.fileAbsoluteUrl) {
        // SharePoint / stock / Bing image → direct URL, framework re-renders
        this.properties[urlProp] = result.fileAbsoluteUrl;
      } else {
        // Local file upload → async FileReader → manual render needed
        result.downloadFileContent()
          .then((file: File) => {
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
              this.properties[urlProp] = e.target ? (e.target.result as string) : '';
              this.render(); // async: property pane no longer in mid-interaction
            };
            reader.readAsDataURL(file);
          })
          .catch((err: Error) => {
            console.error('[SiteBanner] local file read failed:', err);
          });
      }
    };

    if (propertyPath === 'backgroundImageFilePickerResult') {
      extractUrl(newValue as IFilePickerResult, 'backgroundImageUrl');
    }
    if (propertyPath === 'siteImageFilePickerResult') {
      extractUrl(newValue as IFilePickerResult, 'siteImageUrl');
    }
  }


  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    const p = this.properties;
    const isImageBg = p.backgroundType === 'image';
    const hasOverlay = isImageBg && p.overlayType && p.overlayType !== 'none';

    return {
      pages: [
        {
          header: { description: 'Site Banner Configuration' },
          displayGroupsAsAccordion: true,
          groups: [

            /* ── Background ─────────────────────────────────── */
            {
              groupName: '🎨 Background',
              isCollapsed: false,
              groupFields: [
                PropertyPaneDropdown('backgroundType', {
                  label: 'Background Type',
                  options: [
                    { key: 'color', text: '🎨 Solid Color / Gradient' },
                    { key: 'image', text: '🖼️ Image' },
                  ],
                  selectedKey: p.backgroundType || 'color',
                }),

                ...(!isImageBg ? [
                  PropertyPaneTextField('backgroundColor', {
                    label: 'Color / Gradient CSS',
                    description: 'E.g. #94cc00  or  linear-gradient(135deg,#c8e652,#94cc00)',
                    placeholder: 'linear-gradient(135deg, #c8e652 0%, #94cc00 100%)',
                  }),
                ] : []),

                ...(isImageBg ? [
                  PropertyFieldFilePicker('backgroundImageFilePickerResult', {
                    context: this.context as any,
                    filePickerResult: p.backgroundImageFilePickerResult,
                    onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                    properties: this.properties,
                    /* onSave/onChanged store the result; URL extracted in
                       onPropertyPaneFieldChanged override above */
                    onSave: (result: IFilePickerResult) => {
                      this.properties.backgroundImageFilePickerResult = result;
                    },
                    onChanged: (result: IFilePickerResult) => {
                      this.properties.backgroundImageFilePickerResult = result;
                    },
                    key: 'bgImagePicker',
                    buttonLabel: 'Select Background Image',
                    label: 'Background Image',
                    accepts: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
                  }),
                  PropertyPaneDropdown('backgroundImageFit', {
                    label: 'Image Fit',
                    options: [
                      { key: 'cover',   text: 'Cover (fill)'   },
                      { key: 'contain', text: 'Contain (fit)'  },
                      { key: 'fill',    text: 'Stretch (fill)' },
                    ],
                    selectedKey: p.backgroundImageFit || 'cover',
                  }),
                  PropertyPaneDropdown('overlayType', {
                    label: 'Overlay Type',
                    options: [
                      { key: 'none',  text: 'None'          },
                      { key: 'dark',  text: 'Dark overlay'  },
                      { key: 'light', text: 'Light overlay' },
                    ],
                    selectedKey: p.overlayType || 'none',
                  }),
                  ...(hasOverlay ? [
                    PropertyPaneSlider('overlayOpacity', {
                      label: 'Overlay Opacity',
                      min: 0.05, max: 0.85, step: 0.05,
                      value: p.overlayOpacity !== undefined ? p.overlayOpacity : 0.35,
                    }),
                  ] : []),
                ] : []),
              ],
            },

            /* ── Layout ──────────────────────────────────────── */
            {
              groupName: '📐 Layout',
              isCollapsed: true,
              groupFields: [
                PropertyPaneSlider('bannerHeight', {
                  label: 'Banner Height (px)',
                  min: 100, max: 600, step: 10,
                  value: p.bannerHeight !== undefined ? p.bannerHeight : 180,
                }),
                PropertyPaneSlider('borderRadius', {
                  label: 'Corner Radius (px)',
                  min: 0, max: 40, step: 1,
                  value: p.borderRadius !== undefined ? p.borderRadius : 10,
                }),
                PropertyPaneSlider('contentPadding', {
                  label: 'Content Padding (px)',
                  min: 12, max: 72, step: 4,
                  value: p.contentPadding !== undefined ? p.contentPadding : 28,
                }),
                PropertyPaneDropdown('contentAlignment', {
                  label: 'Content Alignment',
                  options: [
                    { key: 'left',   text: '⬅ Left'   },
                    { key: 'center', text: '↔ Center' },
                    { key: 'right',  text: '➡ Right'  },
                  ],
                  selectedKey: p.contentAlignment || 'left',
                }),
                PropertyPaneToggle('showBoxShadow', {
                  label: 'Show Drop Shadow',
                  checked: p.showBoxShadow !== undefined ? p.showBoxShadow : true,
                }),
              ],
            },

            /* ── Site Image ──────────────────────────────────── */
            {
              groupName: '🖼️ Site Image / Logo',
              isCollapsed: true,
              groupFields: [
                PropertyPaneToggle('showSiteImage', {
                  label: 'Show Site Image',
                  checked: p.showSiteImage !== undefined ? p.showSiteImage : true,
                }),
                ...(p.showSiteImage !== false ? [
                  PropertyFieldFilePicker('siteImageFilePickerResult', {
                    context: this.context as any,
                    filePickerResult: p.siteImageFilePickerResult,
                    onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                    properties: this.properties,
                    /* URL extracted in onPropertyPaneFieldChanged override */
                    onSave: (result: IFilePickerResult) => {
                      this.properties.siteImageFilePickerResult = result;
                    },
                    onChanged: (result: IFilePickerResult) => {
                      this.properties.siteImageFilePickerResult = result;
                    },
                    key: 'siteImagePicker',
                    buttonLabel: 'Select Site Image / Logo',
                    label: 'Site Image',
                    accepts: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
                  }),
                  PropertyPaneSlider('siteImageSize', {
                    label: 'Image Size (px)',
                    min: 40, max: 220, step: 4,
                    value: p.siteImageSize !== undefined ? p.siteImageSize : 100,
                  }),
                  PropertyPaneDropdown('siteImageShape', {
                    label: 'Image Shape',
                    options: [
                      { key: 'rounded', text: '▢ Rounded Square' },
                      { key: 'circle',  text: '⬤ Circle'        },
                      { key: 'square',  text: '■ Square'         },
                    ],
                    selectedKey: p.siteImageShape || 'rounded',
                  }),
                ] : []),
              ],
            },

            /* ── Content ─────────────────────────────────────── */
            {
              groupName: '✏️ Content',
              isCollapsed: false,
              groupFields: [
                PropertyPaneToggle('showEyebrow', {
                  label: 'Show Eyebrow Label',
                  checked: p.showEyebrow !== undefined ? p.showEyebrow : true,
                }),
                ...(p.showEyebrow !== false ? [
                  PropertyPaneTextField('eyebrowText', {
                    label: 'Eyebrow Label',
                    placeholder: 'e.g. ANNOUNCEMENT',
                  }),
                ] : []),

                PropertyPaneToggle('showTitle', {
                  label: 'Show Title',
                  checked: p.showTitle !== undefined ? p.showTitle : true,
                }),
                ...(p.showTitle !== false ? [
                  PropertyPaneTextField('title', {
                    label: 'Banner Title',
                    placeholder: 'e.g. Welcome to Our Intranet',
                  }),
                  PropertyPaneSlider('titleFontSize', {
                    label: 'Title Font Size (px, 0 = auto)',
                    min: 0, max: 72, step: 2,
                    value: p.titleFontSize || 0,
                  }),
                ] : []),

                PropertyPaneToggle('showDescription', {
                  label: 'Show Description',
                  checked: p.showDescription !== undefined ? p.showDescription : true,
                }),
                ...(p.showDescription !== false ? [
                  PropertyPaneTextField('description', {
                    label: 'Description',
                    placeholder: 'Short tagline or description...',
                    multiline: true,
                    rows: 3,
                  }),
                ] : []),
              ],
            },

            /* ── CTA Button ──────────────────────────────────── */
            {
              groupName: '🔘 CTA Button',
              isCollapsed: true,
              groupFields: [
                PropertyPaneToggle('showButton', {
                  label: 'Show Button',
                  checked: p.showButton !== undefined ? p.showButton : true,
                }),
                ...(p.showButton !== false ? [
                  PropertyPaneTextField('buttonText', {
                    label: 'Button Label',
                    placeholder: 'e.g. Learn More',
                  }),
                  PropertyPaneTextField('buttonUrl', {
                    label: 'Button URL',
                    placeholder: 'https://...',
                  }),
                  PropertyPaneToggle('buttonOpenInNewTab', {
                    label: 'Open in New Tab',
                    checked: p.buttonOpenInNewTab !== undefined ? p.buttonOpenInNewTab : true,
                  }),
                  PropertyPaneDropdown('buttonStyle', {
                    label: 'Button Style',
                    options: [
                      { key: 'solid',   text: '■ Solid (filled)'     },
                      { key: 'outline', text: '□ Outline (border)'   },
                      { key: 'ghost',   text: '◻ Ghost (frosted)'    },
                    ],
                    selectedKey: p.buttonStyle || 'solid',
                  }),
                  PropertyPaneDropdown('buttonBorderRadius', {
                    label: 'Button Shape',
                    options: [
                      { key: 'rounded', text: 'Rounded'   },
                      { key: 'pill',    text: 'Pill'      },
                      { key: 'square',  text: 'Square'    },
                    ],
                    selectedKey: p.buttonBorderRadius || 'rounded',
                  }),
                  PropertyPaneLabel('buttonColors', {
                    text: 'Custom Button Colors (leave blank for defaults)',
                  }),
                  PropertyPaneTextField('buttonBgColor', {
                    label: 'Button Background Color',
                    placeholder: 'e.g. #0078d4',
                  }),
                  PropertyPaneTextField('buttonTextColor', {
                    label: 'Button Text Color',
                    placeholder: 'e.g. #ffffff',
                  }),
                ] : []),
              ],
            },

            /* ── Typography & Style ──────────────────────────── */
            {
              groupName: '🎨 Typography & Style',
              isCollapsed: true,
              groupFields: [
                PropertyPaneTextField('textColor', {
                  label: 'Text Color',
                  description: 'CSS color for all text in the banner.',
                  placeholder: '#1a1a1a',
                }),
                PropertyPaneLabel('styleHint', {
                  text: 'Tip: Use light text (#ffffff) when background is dark.',
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
