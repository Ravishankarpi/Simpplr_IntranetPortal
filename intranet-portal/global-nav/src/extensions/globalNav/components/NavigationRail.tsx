import * as React from 'react';
import { Box, IconButton, Tooltip, Menu, MenuItem } from '@mui/material';
import ViewSidebarOutlinedIcon from '@mui/icons-material/ViewSidebarOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AddIcon from '@mui/icons-material/Add';
import { INavItem } from './IGlobalNavProps';
import styles from './GlobalNav.module.scss';

export interface INavigationRailProps {
  topItems: INavItem[];
  bottomItems: INavItem[];
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
  activeItemId: string;
  onSelectItem: (item: INavItem) => void;
}

export const NavigationRail: React.FC<INavigationRailProps> = (props: INavigationRailProps): JSX.Element => {
  const [fabAnchorEl, setFabAnchorEl] = React.useState<null | HTMLElement>(null);

  const getRailIcon = (iconName?: string, isActive?: boolean): JSX.Element => {
    switch (iconName?.toLowerCase()) {
      case 'home':
        return <HomeOutlinedIcon fontSize="small" />;
      case 'people':
        return <PeopleOutlineIcon fontSize="small" />;
      case 'wave':
      case 'recognition':
        return <VolunteerActivismOutlinedIcon fontSize="small" />;
      case 'bookmark':
        return <BookmarkBorderIcon fontSize="small" />;
      case 'compass':
      case 'explore':
        return <ExploreOutlinedIcon fontSize="small" />;
      case 'analytics':
        return <BarChartOutlinedIcon fontSize="small" />;
      case 'trending':
        return <TrendingUpOutlinedIcon fontSize="small" />;
      case 'settings':
        return <SettingsOutlinedIcon fontSize="small" />;
      default:
        return <HomeOutlinedIcon fontSize="small" />;
    }
  };

  const handleFabClick = (event: React.MouseEvent<HTMLElement>): void => {
    setFabAnchorEl(event.currentTarget);
  };

  const handleFabClose = (): void => {
    setFabAnchorEl(null);
  };

  return (
    <Box className={styles.navRail} role="navigation" aria-label="Global Navigation Rail">
      {/* Top Section */}
      <Box className={styles.railTopGroup}>
        {/* Toggle Drawer Button */}
        <Tooltip title={props.isDrawerOpen ? 'Collapse menu' : 'Expand menu'} placement="right">
          <IconButton
            className={styles.railIconButton}
            onClick={props.onToggleDrawer}
            aria-label="Toggle Navigation Drawer"
            size="small"
          >
            <ViewSidebarOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Top Rail Items */}
        {props.topItems.map((item: INavItem): JSX.Element => {
          const isActive = props.activeItemId === item.id || (!props.activeItemId && item.isActive);

          return (
            <Tooltip key={item.id} title={item.title} placement="right">
              <IconButton
                className={`${styles.railIconButton} ${isActive ? styles.railActivePill : ''}`}
                onClick={(): void => props.onSelectItem(item)}
                aria-label={item.title}
                size="small"
              >
                {getRailIcon(item.iconName, isActive)}
              </IconButton>
            </Tooltip>
          );
        })}
      </Box>

      {/* Bottom Section */}
      <Box className={styles.railBottomGroup}>
        {props.bottomItems.map((item: INavItem): JSX.Element => (
          <Tooltip key={item.id} title={item.title} placement="right">
            <IconButton
              className={styles.railIconButton}
              onClick={(): void => props.onSelectItem(item)}
              aria-label={item.title}
              size="small"
            >
              {getRailIcon(item.iconName, false)}
            </IconButton>
          </Tooltip>
        ))}

        {/* Floating Action Button (+) */}
        <Tooltip title="Create new" placement="right">
          <IconButton
            className={styles.fabButton}
            onClick={handleFabClick}
            aria-label="Create Action"
            size="small"
          >
            <AddIcon fontSize="medium" />
          </IconButton>
        </Tooltip>

        {/* FAB Quick Action Menu */}
        <Menu
          anchorEl={fabAnchorEl}
          open={Boolean(fabAnchorEl)}
          onClose={handleFabClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <MenuItem onClick={handleFabClose}>Post an Update</MenuItem>
          <MenuItem onClick={handleFabClose}>Create Event</MenuItem>
          <MenuItem onClick={handleFabClose}>Share Knowledge</MenuItem>
          <MenuItem onClick={handleFabClose}>Upload Document</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default NavigationRail;
