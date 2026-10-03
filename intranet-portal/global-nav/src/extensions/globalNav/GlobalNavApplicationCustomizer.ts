import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Log } from '@microsoft/sp-core-library';
import { BaseApplicationCustomizer } from '@microsoft/sp-application-base';
import { GlobalNav } from './components/GlobalNav';
import { IGlobalNavProps } from './components/IGlobalNavProps';
import { ENABLE_GLOBAL_ACROSS_TENANT, ROOT_SITE_URL } from '../../config/constants';

const LOG_SOURCE: string = 'GlobalNavApplicationCustomizer';

export interface IGlobalNavApplicationCustomizerProperties {
  testMessage?: string;
}

/**
 * GlobalNavApplicationCustomizer
 *
 * Places simpplr-global-nav-host directly before SPPageChrome in the DOM.
 * Applies margin-left to SPPageChrome so the entire SharePoint UI is on the right side.
 * - Expanded: 296px margin-left
 * - Collapsed: 56px margin-left
 */
export default class GlobalNavApplicationCustomizer
  extends BaseApplicationCustomizer<IGlobalNavApplicationCustomizerProperties> {

  private _domContainer: HTMLDivElement | null = null;

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized GlobalNavApplicationCustomizer');

    const currentSiteUrl = (this.context.pageContext.site.absoluteUrl || '').toLowerCase();
    const rootUrl = (ROOT_SITE_URL || '').toLowerCase();

    // Check if the extension should run on this site collection
    if (!ENABLE_GLOBAL_ACROSS_TENANT) {
      if (rootUrl && currentSiteUrl !== rootUrl) {
        console.log(`[GlobalNav] Skipped loading on ${currentSiteUrl} because it is not ROOT_SITE_URL (${rootUrl}).`);
        return Promise.resolve();
      }
    }

    // Check for SharePoint page edit mode
    const urlParams = new URLSearchParams(window.location.search);
    const isEdit = urlParams.get('isEdit') === 'true' || urlParams.get('Mode') === 'Edit';
    if (isEdit) {
      console.log('[GlobalNav] Page is in Edit Mode');
    }

    this._renderSidebar();

    return Promise.resolve();
  }

  private _renderSidebar(): void {
    const containerId = 'simpplr-global-nav-host';

    let container = document.getElementById(containerId) as HTMLDivElement;
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;

      const spChrome =
        document.getElementById('SPPageChrome') ||
        document.querySelector('.SPPageChrome') ||
        document.querySelector('[id*="SPPageChrome"]');

      if (spChrome && spChrome.parentNode) {
        spChrome.parentNode.insertBefore(container, spChrome);
      } else {
        document.body.insertBefore(container, document.body.firstChild);
      }
    }
    this._domContainer = container;

    this._adjustPageLayout();

    const element: React.ReactElement<IGlobalNavProps> = React.createElement(GlobalNav, {
      context: this.context,
      rootSiteUrl: ROOT_SITE_URL
    });

    ReactDOM.render(element, this._domContainer);
  }

  private _adjustPageLayout(): void {
    const styleId = 'simpplr-global-nav-body-offset';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.type = 'text/css';
      document.head.appendChild(styleEl);
    }

    styleEl.innerHTML = `
      #SPPageChrome,
      .SPPageChrome,
      [id*="SPPageChrome"],
      #spoAppComponent,
      .spoAppComponentFlex {
        transition: margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        box-sizing: border-box !important;
      }

      body.simpplr-nav-expanded #SPPageChrome,
      body.simpplr-nav-expanded .SPPageChrome,
      body.simpplr-nav-expanded [id*="SPPageChrome"],
      body.simpplr-nav-expanded #spoAppComponent,
      body.simpplr-nav-expanded .spoAppComponentFlex {
        margin-left: 296px !important;
        width: calc(100% - 296px) !important;
        max-width: calc(100% - 296px) !important;
      }

      body.simpplr-nav-collapsed #SPPageChrome,
      body.simpplr-nav-collapsed .SPPageChrome,
      body.simpplr-nav-collapsed [id*="SPPageChrome"],
      body.simpplr-nav-collapsed #spoAppComponent,
      body.simpplr-nav-collapsed .spoAppComponentFlex {
        margin-left: 56px !important;
        width: calc(100% - 56px) !important;
        max-width: calc(100% - 56px) !important;
      }
    `;

    document.body.classList.add('simpplr-nav-active');
    document.body.classList.add('simpplr-nav-expanded');
  }

  protected onDispose(): void {
    console.log('[GlobalNavApplicationCustomizer.onDispose] Disposing sidebar component');
    if (this._domContainer) {
      ReactDOM.unmountComponentAtNode(this._domContainer);
      if (this._domContainer.parentNode) {
        this._domContainer.parentNode.removeChild(this._domContainer);
      }
      this._domContainer = null;
    }
    document.body.classList.remove('simpplr-nav-active', 'simpplr-nav-expanded', 'simpplr-nav-collapsed');
    const styleEl = document.getElementById('simpplr-global-nav-body-offset');
    if (styleEl && styleEl.parentNode) {
      styleEl.parentNode.removeChild(styleEl);
    }
  }
}
