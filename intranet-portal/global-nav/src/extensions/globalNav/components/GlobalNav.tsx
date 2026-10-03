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
  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(true);
  const [activeItemId, setActiveItemId] = React.useState<string>('p-home');
  const [sections, setSections] = React.useState<INavSection[]>(props.sections || mockNavSections);
  const [railTopItems, setRailTopItems] = React.useState<INavItem[]>(props.railItems || mockRailTopItems);
  const [railBottomItems, setRailBottomItems] = React.useState<INavItem[]>(mockRailBottomItems);
  const [expandedSections, setExpandedSections] = React.useState<{ [key: string]: boolean }>({
    explore: true,
    recent: true
  });

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
    setIsDrawerOpen(prev => !prev);
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
          isDrawerOpen={isDrawerOpen}
          onToggleDrawer={handleToggleDrawer}
          activeItemId={activeItemId}
          onSelectItem={handleSelectItem}
        />

        {/* Expanded Navigation Drawer */}
        <NavigationDrawer
          isOpen={isDrawerOpen}
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
