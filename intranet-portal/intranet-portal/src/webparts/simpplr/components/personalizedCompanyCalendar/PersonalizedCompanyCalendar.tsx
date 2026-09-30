import * as React from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  Box,
  Typography,
  createTheme,
  ThemeProvider
} from '@mui/material';
import {
  IPersonalizedCompanyCalendarItem,
  upcomingCalendarData,
  popularCalendarData
} from './mockData';
import styles from './PersonalizedCompanyCalendar.module.scss';

export interface IPersonalizedCompanyCalendarProps {
  context: WebPartContext;
  calendarTitle?: string;
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

  const currentItems: IPersonalizedCompanyCalendarItem[] =
    activeTab === 'upcoming' ? upcomingCalendarData : popularCalendarData;

  const handleItemClick = (item: IPersonalizedCompanyCalendarItem): void => {
    if (item.url && item.url !== '#') {
      window.open(item.url, '_blank');
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
            onClick={(): void => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'popular'}
            className={`${styles.tabButton} ${activeTab === 'popular' ? styles.tabActive : ''}`}
            onClick={(): void => setActiveTab('popular')}
          >
            Popular
          </button>
        </Box>

        {/* Calendar Events List */}
        <Box className={styles.listSection}>
          {currentItems.map((item: IPersonalizedCompanyCalendarItem): JSX.Element => (
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
      </Box>
    </ThemeProvider>
  );
};

export default PersonalizedCompanyCalendar;
