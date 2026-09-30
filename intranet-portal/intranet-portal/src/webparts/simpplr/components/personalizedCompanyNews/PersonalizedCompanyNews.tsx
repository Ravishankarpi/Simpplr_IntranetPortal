import * as React from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  Box,
  Typography,
  createTheme,
  ThemeProvider
} from '@mui/material';
import {
  IPersonalizedCompanyNewsItem,
  latestNewsData,
  popularNewsData
} from './mockData';
import styles from './PersonalizedCompanyNews.module.scss';

export interface IPersonalizedCompanyNewsProps {
  context: WebPartContext;
  newsTitle?: string;
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

export const PersonalizedCompanyNews: React.FC<IPersonalizedCompanyNewsProps> = (
  props: IPersonalizedCompanyNewsProps
): JSX.Element => {
  const [activeTab, setActiveTab] = React.useState<'latest' | 'popular'>('latest');

  const currentDataset: IPersonalizedCompanyNewsItem[] =
    activeTab === 'latest' ? latestNewsData : popularNewsData;

  const featuredItem: IPersonalizedCompanyNewsItem | undefined =
    currentDataset.find((item: IPersonalizedCompanyNewsItem): boolean => !!item.isFeatured) ||
    currentDataset[0];

  const listItems: IPersonalizedCompanyNewsItem[] = currentDataset.filter(
    (item: IPersonalizedCompanyNewsItem): boolean => item.id !== (featuredItem ? featuredItem.id : null)
  );

  const handleItemClick = (item: IPersonalizedCompanyNewsItem): void => {
    if (item.url && item.url !== '#') {
      window.open(item.url, '_blank');
    }
  };

  const handleCategoryClick = (e: React.MouseEvent, category: string): void => {
    e.stopPropagation();
    // Placeholder for category navigation
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <Box className={styles.container}>
        {/* Title */}
        <Typography component="h2" className={styles.headerTitle}>
          {props.newsTitle || 'Personalized Company News'}
        </Typography>

        {/* Tabs: Latest / Popular */}
        <Box className={styles.tabsContainer} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'latest'}
            className={`${styles.tabButton} ${activeTab === 'latest' ? styles.tabActive : ''}`}
            onClick={(): void => setActiveTab('latest')}
          >
            Latest
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

        {/* Featured News Item */}
        {featuredItem && (
          <Box
            className={styles.featuredSection}
            onClick={(): void => handleItemClick(featuredItem)}
            role="article"
          >
            <img
              src={featuredItem.imageUrl}
              alt={featuredItem.title}
              className={styles.featuredImage}
            />

            {/* Badges / Tags */}
            <Box className={styles.tagRow}>
              <Typography component="span" className={styles.tagPage}>
                PAGE
              </Typography>
              {featuredItem.contentType === 'MUST READ' && (
                <Typography component="span" className={styles.tagMustRead}>
                  MUST READ
                </Typography>
              )}
            </Box>

            {/* Featured Title */}
            <Typography component="h3" className={styles.featuredTitle}>
              {featuredItem.title}
            </Typography>

            {/* Metadata: "in [Category] on [Date]" */}
            <Typography component="p" className={styles.metaText}>
              in{' '}
              <span
                className={styles.categoryLink}
                onClick={(e: React.MouseEvent): void => handleCategoryClick(e, featuredItem.category)}
              >
                {featuredItem.category}
              </span>{' '}
              on {featuredItem.date}
            </Typography>
          </Box>
        )}

        {/* Compact News List Items */}
        <Box className={styles.listSection}>
          {listItems.map((item: IPersonalizedCompanyNewsItem): JSX.Element => (
            <Box
              key={item.id}
              className={styles.newsRow}
              onClick={(): void => handleItemClick(item)}
              role="article"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className={styles.thumbnail}
              />

              <Box className={styles.itemContent}>
                <Box className={styles.tagRow} sx={{ mb: 0.5 }}>
                  <Typography component="span" className={styles.tagPage}>
                    {item.contentType || 'PAGE'}
                  </Typography>
                </Box>

                <Typography component="h4" className={styles.itemTitle}>
                  {item.title}
                </Typography>

                <Typography component="p" className={styles.metaText}>
                  in{' '}
                  <span
                    className={styles.categoryLink}
                    onClick={(e: React.MouseEvent): void => handleCategoryClick(e, item.category)}
                  >
                    {item.category}
                  </span>{' '}
                  on {item.date}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default PersonalizedCompanyNews;
