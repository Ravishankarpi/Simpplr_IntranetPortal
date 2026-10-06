import * as React from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  Box,
  Typography,
  createTheme,
  ThemeProvider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  IPersonalizedCompanyCalendarItem,
  upcomingCalendarData,
  popularCalendarData
} from './mockData';
import styles from './PersonalizedCompanyCalendar.module.scss';

export interface IPersonalizedCompanyCalendarProps {
  context: WebPartContext;
  calendarTitle?: string;
  itemCount?: number;
  showSeeMore?: boolean;
  seeMoreUrl?: string;
}

const muiTheme = createTheme({
  palette: {
    primary: {
      main: '#0078d4'
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#666666'
    }
  },
  typography: {
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
    fontSize: 14
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          fontSize: '14px'
        }
      }
    }
  }
});

export const PersonalizedCompanyCalendar: React.FC<IPersonalizedCompanyCalendarProps> = (
  props: IPersonalizedCompanyCalendarProps
): JSX.Element => {
  const [activeTab, setActiveTab] = React.useState<'upcoming' | 'popular'>('upcoming');
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);

  const currentItems: IPersonalizedCompanyCalendarItem[] =
    activeTab === 'upcoming' ? upcomingCalendarData : popularCalendarData;

  const effectiveItemCount: number =
    props.itemCount !== undefined && props.itemCount > 0 ? props.itemCount : 4;
  const shouldShowSeeMore: boolean = props.showSeeMore !== false;
  const hasExternalUrl: boolean = Boolean(
    props.seeMoreUrl && props.seeMoreUrl.trim() !== '' && props.seeMoreUrl !== '#'
  );

  // Sliced items according to itemCount and isExpanded state
  const displayedItems: IPersonalizedCompanyCalendarItem[] =
    isExpanded || (!shouldShowSeeMore && props.itemCount === undefined)
      ? currentItems
      : currentItems.slice(0, effectiveItemCount);

  const hasHiddenItems: boolean = currentItems.length > effectiveItemCount;
  const renderSeeMoreButton: boolean = shouldShowSeeMore && (hasHiddenItems || hasExternalUrl);

  const handleItemClick = (item: IPersonalizedCompanyCalendarItem): void => {
    if (item.url && item.url !== '#') {
      window.open(item.url, '_blank');
    }
  };

  const handleSeeMoreClick = (): void => {
    if (hasExternalUrl) {
      window.open(props.seeMoreUrl, '_blank');
    } else {
      setIsExpanded((prev: boolean): boolean => !prev);
    }
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <Box className={styles.container}>
        {/* Header Title */}
        <Typography component="h2" className={styles.headerTitle}>
          {props.calendarTitle || 'Personalized Company Calendar'}
        </Typography>

        {/* Tabs: Upcoming / Popular */}
        <Box className={styles.tabsContainer} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'upcoming'}
            className={`${styles.tabButton} ${activeTab === 'upcoming' ? styles.tabActive : ''}`}
            onClick={(): void => {
              setActiveTab('upcoming');
              setIsExpanded(false);
            }}
          >
            Upcoming
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'popular'}
            className={`${styles.tabButton} ${activeTab === 'popular' ? styles.tabActive : ''}`}
            onClick={(): void => {
              setActiveTab('popular');
              setIsExpanded(false);
            }}
          >
            Popular
          </button>
        </Box>

        {/* Calendar Events List */}
        <Box className={styles.listSection}>
          {displayedItems.map((item: IPersonalizedCompanyCalendarItem): JSX.Element => (
            <Box
              key={item.id}
              className={styles.eventRow}
              onClick={(): void => handleItemClick(item)}
              role="article"
            >
              {/* Calendar Date Block (Left Tile) */}
              <Box className={styles.dateTile}>
                <span className={styles.dateMonth}>{item.month}</span>
                <span className={styles.dateDay}>{item.day}</span>
              </Box>

              {/* Event Details (Right) */}
              <Box className={styles.details}>
                <Typography component="h3" className={styles.eventTitle}>
                  {item.title}
                </Typography>
                <Typography component="p" className={styles.eventDate}>
                  {item.formattedDate}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* See More Button at Bottom */}
        {renderSeeMoreButton && (
          <Box className={styles.seeMoreContainer}>
            <button
              type="button"
              className={styles.seeMoreButton}
              onClick={handleSeeMoreClick}
              aria-label={
                hasExternalUrl
                  ? 'See more calendar events'
                  : isExpanded
                  ? 'See less calendar events'
                  : 'See more calendar events'
              }
            >
              {hasExternalUrl ? (
                <>
                  <span>See more</span>
                  <OpenInNewIcon sx={{ fontSize: 16 }} />
                </>
              ) : isExpanded ? (
                <>
                  <span>See less</span>
                  <ExpandLessIcon sx={{ fontSize: 18 }} />
                </>
              ) : (
                <>
                  <span>See more</span>
                  <ExpandMoreIcon sx={{ fontSize: 18 }} />
                </>
              )}
            </button>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default PersonalizedCompanyCalendar;
