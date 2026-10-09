import * as React from 'react';
import { Box, Typography, Collapse, Avatar } from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import { INavItem, INavSection } from './IGlobalNavProps';
import styles from './GlobalNav.module.scss';

export interface INavigationDrawerProps {
  isOpen: boolean;
  sections: INavSection[];
  activeItemId: string;
  onSelectItem: (item: INavItem) => void;
  expandedSections: { [key: string]: boolean };
  onToggleSection: (sectionId: string) => void;
}

export const NavigationDrawer: React.FC<INavigationDrawerProps> = (props: INavigationDrawerProps): JSX.Element => {
  const [avatarErrors, setAvatarErrors] = React.useState<{ [key: string]: boolean }>({});

  const handleAvatarError = (id: string): void => {
    setAvatarErrors((prev: { [key: string]: boolean }): { [key: string]: boolean } => ({
      ...prev,
      [id]: true
    }));
  };

  const getDrawerIcon = (iconName?: string): JSX.Element => {
    switch (iconName?.toLowerCase()) {
      case 'home':
        return <HomeOutlinedIcon className={styles.navItemIcon} />;
      case 'feed':
        return <ChatBubbleOutlineIcon className={styles.navItemIcon} />;
      case 'hub':
      case 'myhub':
        return <DashboardOutlinedIcon className={styles.navItemIcon} />;
      case 'onboarding':
      case 'rocket':
        return <RocketLaunchOutlinedIcon className={styles.navItemIcon} />;
      case 'mustreads':
      case 'book':
        return <MenuBookOutlinedIcon className={styles.navItemIcon} />;
      case 'rewardstore':
      case 'reward':
        return <CardGiftcardOutlinedIcon className={styles.navItemIcon} />;
      case 'events':
      case 'calendar':
        return <CalendarTodayOutlinedIcon className={styles.navItemIcon} />;
      case 'circle':
        return <FiberManualRecordIcon className={styles.navItemIcon} sx={{ fontSize: '10px !important' }} />;
      case 'culture':
        return <EmojiEventsOutlinedIcon className={styles.navItemIcon} />;
      case 'career':
        return <SchoolOutlinedIcon className={styles.navItemIcon} />;
      default:
        return <FiberManualRecordIcon className={styles.navItemIcon} sx={{ fontSize: '10px !important' }} />;
    }
  };

  const getInitial = (title: string): string => {
    return title ? title.trim().charAt(0).toUpperCase() : 'S';
  };

  const getRandomColor = (id: string): string => {
    const colors = ['#0284c7', '#0d9488', '#e11d48', '#8b5cf6', '#d97706'];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };
  return (
    <Box
      // eslint-disable-next-line no-constant-condition
      className={`${styles.navDrawer} ${!props.isOpen ? styles.navDrawerCollapsed : ''}`}
      role="region"
      aria-label="Expanded Navigation Menu"
    >
      {/* Branding Header */}
      <Box className={styles.drawerHeader}>
        <Typography component="h1" className={styles.brandTitle}>
          Simpplr
        </Typography>
      </Box>

      {/* Navigation Sections */}
      <Box className={styles.drawerContent}>
        {props.sections.map((section: INavSection): JSX.Element => {
          const isCollapsible = !!section.collapsible;
          const isSectionExpanded =
            props.expandedSections[section.id] !== undefined
              ? props.expandedSections[section.id]
              : section.isExpanded !== false;

          return (
            <Box key={section.id} sx={{ mb: 1 }}>
              {/* Section Accordion Title (if present) */}
              {section.title ? (
                <Box
                  className={styles.sectionHeader}
                  onClick={(): void => {
                    if (isCollapsible) {
                      props.onToggleSection(section.id);
                    }
                  }}
                  role={isCollapsible ? 'button' : undefined}
                  tabIndex={isCollapsible ? 0 : undefined}
                >
                  <Typography component="span" sx={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>
                    {section.title}
                  </Typography>
                  {isCollapsible && (
                    isSectionExpanded ? (
                      <KeyboardArrowUpIcon sx={{ fontSize: 16 }} />
                    ) : (
                      <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
                    )
                  )}
                </Box>
              ) : null}

              {/* Section Items */}
              <Collapse in={!isCollapsible || isSectionExpanded} timeout="auto" unmountOnExit={false}>
                <Box className={styles.sectionItemsContainer}>
                  {section.items.map((item: INavItem): JSX.Element => {
                    const isActive = props.activeItemId === item.id || (!props.activeItemId && item.isActive);
                    const hasAvatarError = !!avatarErrors[item.id];

                    return (
                      <Box
                        key={item.id}
                        className={`${styles.navListItem} ${isActive ? styles.navListItemActive : ''}`}
                        onClick={(): void => props.onSelectItem(item)}
                        role="link"
                        tabIndex={0}
                      >
                        {/* Leading Avatar / Icon */}
                        {item.avatarUrl && !hasAvatarError ? (
                          <Avatar
                            src={item.avatarUrl}
                            alt={item.title}
                            className={styles.siteAvatar}
                            imgProps={{
                              onError: (): void => handleAvatarError(item.id)
                            }}
                          />
                        ) : item.avatarUrl && hasAvatarError ? (
                          <Avatar
                            className={styles.siteAvatar}
                            sx={{ bgcolor: getRandomColor(item.id), color: '#ffffff' }}
                          >
                            {getInitial(item.title)}
                          </Avatar>
                        ) : (
                          getDrawerIcon(item.iconName)
                        )}

                        {/* Title */}
                        <Typography component="span" className={styles.navItemTitle} title={item.title}>
                          {item.title}
                        </Typography>

                        {/* Right Chevron for sub-navigation items */}
                        {item.hasChildren && <ChevronRightIcon className={styles.chevronIcon} />}
                      </Box>
                    );
                  })}
                </Box>
              </Collapse>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default NavigationDrawer;
