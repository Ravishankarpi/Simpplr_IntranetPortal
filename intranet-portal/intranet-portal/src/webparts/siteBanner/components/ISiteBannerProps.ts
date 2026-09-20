import { IFilePickerResult } from '@pnp/spfx-property-controls/lib/PropertyFieldFilePicker';

export interface ISiteBannerProps {
  isDarkTheme: boolean;
  hasTeamsContext: boolean;
  context: any;

  /* ── Background ─────────────────────────────────────── */
  backgroundType: string;                        // 'color' | 'image'
  backgroundColor: string;                       // CSS color / gradient
  backgroundImageUrl: string;                    // absolute URL when type=image
  backgroundImageFilePickerResult: IFilePickerResult;
  backgroundImageFit: string;                    // 'cover' | 'contain' | 'center'
  overlayType: string;                           // 'none' | 'dark' | 'light'
  overlayOpacity: number;                        // 0–1

  /* ── Layout ─────────────────────────────────────────── */
  bannerHeight: number;                          // px, min-height
  borderRadius: number;                          // px
  contentPadding: number;                        // px (vertical + horizontal)
  contentAlignment: string;                      // 'left' | 'center' | 'right'
  showBoxShadow: boolean;

  /* ── Site image ─────────────────────────────────────── */
  showSiteImage: boolean;
  siteImageUrl: string;
  siteImageFilePickerResult: IFilePickerResult;
  siteImageSize: number;                         // px
  siteImageShape: string;                        // 'square' | 'rounded' | 'circle'

  /* ── Content ─────────────────────────────────────────── */
  showEyebrow: boolean;
  eyebrowText: string;

  showTitle: boolean;
  title: string;
  titleFontSize: number;                         // px

  showDescription: boolean;
  description: string;

  /* ── CTA Button ─────────────────────────────────────── */
  showButton: boolean;
  buttonText: string;
  buttonUrl: string;
  buttonOpenInNewTab: boolean;
  buttonStyle: string;                           // 'solid' | 'outline' | 'ghost'
  buttonBgColor: string;                         // custom bg for solid variant
  buttonTextColor: string;                       // custom text color for button
  buttonBorderRadius: string;                    // 'square' | 'rounded' | 'pill'

  /* ── Style ──────────────────────────────────────────── */
  textColor: string;
}
