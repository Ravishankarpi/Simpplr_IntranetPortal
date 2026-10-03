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
 * Injects a dual-layer Sidebar Navigation (Far-left Dark Rail + Expanded Menu Drawer)
 * into a dedicated fixed container on document.body.
 *
 * Honors ROOT_SITE_URL configuration:
 * Only activates when running on ROOT_SITE_URL (or when ENABLE_GLOBAL_ACROSS_TENANT is true).
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

    // Ensure singleton container
    let container = document.getElementById(containerId) as HTMLDivElement;
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      document.body.appendChild(container);
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
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.type = 'text/css';
      styleEl.innerHTML = `
        body.simpplr-nav-active #workbenchPageContent,
        body.simpplr-nav-active #spPageCanvasContent {
          margin-left: 56px !important;
          transition: margin-left 0.25s ease;
        }
      `;
      document.head.appendChild(styleEl);
    }
    document.body.classList.add('simpplr-nav-active');
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
    document.body.classList.remove('simpplr-nav-active');
  }
}
