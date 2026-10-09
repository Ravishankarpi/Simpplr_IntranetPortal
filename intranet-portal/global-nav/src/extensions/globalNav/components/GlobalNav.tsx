import * as React from 'react';
import { Box, createTheme, ThemeProvider } from '@mui/material';
import { IGlobalNavProps, INavItem, INavSection } from './IGlobalNavProps';
import NavigationRail from './NavigationRail';
import NavigationDrawer from './NavigationDrawer';
import { mockNavSections, mockRailTopItems, mockRailBottomItems } from './mockData';
import { GlobalNavigationService } from '../../../services/GlobalNavigationService';
import styles from './GlobalNav.module.scss';

const muiTheme = createTheme({
  palette: {
    primary: {
      main: '#0078d4'
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b'
    }
  },
  typography: {
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
    fontSize: 14
  }
});

export const GlobalNav: React.FC<IGlobalNavProps> = (props: IGlobalNavProps): JSX.Element => {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);
  const [activeItemId, setActiveItemId] = React.useState<string>('p-home');
  const [sections, setSections] = React.useState<INavSection[]>(props.sections || mockNavSections);
  const [railTopItems, setRailTopItems] = React.useState<INavItem[]>(props.railItems || mockRailTopItems);
  const [railBottomItems, setRailBottomItems] = React.useState<INavItem[]>(mockRailBottomItems);
  const [expandedSections, setExpandedSections] = React.useState<{ [key: string]: boolean }>({
    explore: true,
    recent: true
  });

  // Synchronize SPPageChrome and layout offset with sidebar drawer state
  React.useEffect(() => {
    const offset = isDrawerOpen ? 296 : 56;

    document.body.classList.toggle('simpplr-nav-expanded', isDrawerOpen);
    document.body.classList.toggle('simpplr-nav-collapsed', !isDrawerOpen);

    const applyOffset = (): void => {
      // Ensure simpplr-global-nav-host is placed directly before SPPageChrome in DOM
      const host = document.getElementById('simpplr-global-nav-host');
      const spChrome =
        document.getElementById('SPPageChrome') ||
        document.querySelector('.SPPageChrome') ||
        document.querySelector('[id*="SPPageChrome"]');

      if (host && spChrome && spChrome.parentNode && host.nextSibling !== spChrome) {
        spChrome.parentNode.insertBefore(host, spChrome);
      }

      // Shift SPPageChrome and any sub-containers rightwards
      const targets = document.querySelectorAll(
        '#SPPageChrome, .SPPageChrome, [id*="SPPageChrome"], #spoAppComponent, .spoAppComponentFlex'
      );
      targets.forEach((el: Element) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.setProperty('margin-left', `${offset}px`, 'important');
        htmlEl.style.setProperty('width', `calc(100% - ${offset}px)`, 'important');
        htmlEl.style.setProperty('max-width', `calc(100% - ${offset}px)`, 'important');
        htmlEl.style.setProperty(
          'transition',
          'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          'important'
        );
        htmlEl.style.setProperty('box-sizing', 'border-box', 'important');
      });
    };

    applyOffset();

    const t1 = setTimeout(applyOffset, 150);
    const t2 = setTimeout(applyOffset, 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isDrawerOpen]);

  // Fetch or ensure SharePoint navigation list and data on mount
  React.useEffect(() => {
    let isMounted = true;
    const navService = new GlobalNavigationService(props.context);

    navService
      .getNavigationData()
      .then(data => {
        if (isMounted) {
          if (data.sections && data.sections.length > 0) {
            setSections(data.sections);
          }
          if (data.railTopItems && data.railTopItems.length > 0) {
            setRailTopItems(data.railTopItems);
          }
          if (data.railBottomItems && data.railBottomItems.length > 0) {
            setRailBottomItems(data.railBottomItems);
          }
        }
      })
      .catch(err => {
        console.warn('[GlobalNav] Failed to load data from service, using mock data:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [props.context]);

  const handleToggleDrawer = (): void => {
    // setIsDrawerOpen(prev => !prev);
  };

  const handleToggleSection = (sectionId: string): void => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleSelectItem = (item: INavItem): void => {
    setActiveItemId(item.id);
    if (item.url && item.url !== '#' && item.url.indexOf('#/') !== 0) {
      window.location.href = item.url;
    }
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <Box className={styles.navContainer} id="simpplr-global-nav-sidebar">
        {/* Far-Left Dark Rail */}
        <NavigationRail
          topItems={railTopItems}
          bottomItems={railBottomItems}
          isDrawerOpen={isDrawerOpen}////isDrawerOpen
          onToggleDrawer={handleToggleDrawer}
          activeItemId={activeItemId}
          onSelectItem={handleSelectItem}
        />

        {/* Expanded Navigation Drawer */}
        <NavigationDrawer
          isOpen={isDrawerOpen}//isDrawerOpen
          sections={sections}
          activeItemId={activeItemId}
          onSelectItem={handleSelectItem}
          expandedSections={expandedSections}
          onToggleSection={handleToggleSection}
        />
      </Box>
    </ThemeProvider>
  );
};

export default GlobalNav;
