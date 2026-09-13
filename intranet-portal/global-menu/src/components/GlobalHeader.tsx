import * as React from 'react';
import { ApplicationCustomizerContext } from '@microsoft/sp-application-base';
import { INavMenuItem } from '../models/IGlobalNavigationItem';
import { GlobalNavigationService } from '../services/GlobalNavigationService';

import styles from '../styles/GlobalMenu.module.scss';
import { ThemeProvider, PartialTheme } from '@fluentui/react';
import { THEME_CONFIG } from '../config/constants';
import { GlobalNavigation } from './GlobalNavigation';
import { GlobalSearch } from './GlobalSearch';
import { SiteBranding } from './SiteBranding';

export interface IGlobalHeaderProps {
  context: ApplicationCustomizerContext;
}

export const GlobalHeader: React.FC<IGlobalHeaderProps> = ({ context }) => {
  const [navItems, setNavItems] = React.useState<INavMenuItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<boolean>(false);

  const [siteTitle, setSiteTitle] = React.useState<string>(context.pageContext.web.title);
  const [siteLogoUrl, setSiteLogoUrl] = React.useState<string>(context.pageContext.web.logoUrl);

  React.useEffect(() => {
    const fetchNav = async () => {
      try {
        const service = new GlobalNavigationService(context);

        // Load the root web's title and logo
        const rootWeb = await service.getRootWebInfo();
        if (rootWeb) {
          if (rootWeb.Title) setSiteTitle(rootWeb.Title);
          if (rootWeb.SiteLogoUrl) setSiteLogoUrl(rootWeb.SiteLogoUrl);
        }

        const items = await service.getNavigationItems();
        setNavItems(items);
      } catch (err) {
        console.error("Failed to load navigation", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchNav();
  }, [context]);

  return (
    <ThemeProvider theme={THEME_CONFIG as PartialTheme}>
      <div className={styles.globalHeaderContainer}>
        <div className={styles.leftAndMiddle}>
          <SiteBranding title={siteTitle} logoUrl={siteLogoUrl} />
          <div className={styles.navigationSection}>
            {loading ? (
              <span className={styles.loadingText}>...</span>
            ) : error ? (
              <span className={styles.errorText}>Unable to load global navigation.</span>
            ) : (
              <GlobalNavigation items={navItems} />
            )}
          </div>
        </div>
        <div className={styles.rightSection}>
          <GlobalSearch />
        </div>
      </div>
    </ThemeProvider>
  );
};
