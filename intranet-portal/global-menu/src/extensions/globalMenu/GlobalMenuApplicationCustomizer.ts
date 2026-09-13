import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';

import { GlobalHeader, IGlobalHeaderProps } from '../../components/GlobalHeader';

import { ENABLE_GLOBAL_ACROSS_TENANT, ENABLE_GLOBAL_SCSS_ACROSS_TENANT, ROOT_SITE_URL } from '../../config/constants';

const LOG_SOURCE: string = 'GlobalMenuApplicationCustomizer';

export interface IGlobalMenuApplicationCustomizerProperties {
}

export default class GlobalMenuApplicationCustomizer
  extends BaseApplicationCustomizer<IGlobalMenuApplicationCustomizerProperties> {

  private _topPlaceholder: PlaceholderContent | undefined;

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized Global Menu Application Customizer`);

    const currentSiteUrl = this.context.pageContext.site.absoluteUrl.toLowerCase();
    const rootUrl = ROOT_SITE_URL.toLowerCase();

    // Determine if we should hide the SharePoint elements
    if (ENABLE_GLOBAL_SCSS_ACROSS_TENANT || currentSiteUrl === rootUrl)
      document.body.classList.add('hide-sp-elements');

    // Determine if we should run on this site
    if (!ENABLE_GLOBAL_ACROSS_TENANT) {
      // If ROOT_SITE_URL is defined and the current site collection doesn't match ROOT_SITE_URL, abort.
      if (rootUrl && currentSiteUrl !== rootUrl) {
        console.log(`[GlobalMenu] Skipped loading on ${currentSiteUrl} because it is not the ROOT_SITE_URL.`);
        return Promise.resolve();
      }
    }



    // Check for edit mode via query parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('isEdit') === 'true' || urlParams.get('Mode') === 'Edit') {
      document.body.classList.add('is-edit-mode');
    } else {
      document.body.classList.remove('is-edit-mode');
    }

    // Call render method for configuring the placeholder
    this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceHolders);
    this._renderPlaceHolders();

    return Promise.resolve();
  }

  private _renderPlaceHolders = (): void => {
    // Handling the top placeholder
    if (!this._topPlaceholder) {
      this._topPlaceholder = this.context.placeholderProvider.tryCreateContent(
        PlaceholderName.Top,
        { onDispose: this._onDispose }
      );

      // The extension should not assume that the expected placeholder is available.
      if (!this._topPlaceholder) {
        console.error('The expected placeholder (Top) was not found.');
        return;
      }

      if (this._topPlaceholder.domElement) {
        const element: React.ReactElement<IGlobalHeaderProps> = React.createElement(
          GlobalHeader,
          {
            context: this.context
          }
        );
        ReactDOM.render(element, this._topPlaceholder.domElement);
      }
    }
  }

  private _onDispose = (): void => {
    console.log('[GlobalMenuApplicationCustomizer._onDispose] Disposed custom top and bottom placeholders.');
    if (this._topPlaceholder && this._topPlaceholder.domElement) {
      ReactDOM.unmountComponentAtNode(this._topPlaceholder.domElement);
    }
  }
}
