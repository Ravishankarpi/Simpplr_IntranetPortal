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
  IPersonalizedCompanyNewsItem,
  latestNewsData,
  popularNewsData
} from './mockData';
import styles from './PersonalizedCompanyNews.module.scss';

export interface IPersonalizedCompanyNewsProps {
  context: WebPartContext;
  newsTitle?: string;
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

export const PersonalizedCompanyNews: React.FC<IPersonalizedCompanyNewsProps> = (
  props: IPersonalizedCompanyNewsProps
): JSX.Element => {
  const [activeTab, setActiveTab] = React.useState<'latest' | 'popular'>('latest');
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);

  const currentDataset: IPersonalizedCompanyNewsItem[] =
    activeTab === 'latest' ? latestNewsData : popularNewsData;

  const featuredItem: IPersonalizedCompanyNewsItem | undefined =
    currentDataset.find((item: IPersonalizedCompanyNewsItem): boolean => !!item.isFeatured) ||
    currentDataset[0];

  const listItems: IPersonalizedCompanyNewsItem[] = currentDataset.filter(
    (item: IPersonalizedCompanyNewsItem): boolean => item.id !== (featuredItem ? featuredItem.id : null)
  );

  const effectiveItemCount: number =
    props.itemCount !== undefined && props.itemCount > 0 ? props.itemCount : 4;
  const shouldShowSeeMore: boolean = props.showSeeMore !== false;
  const hasExternalUrl: boolean = Boolean(
    props.seeMoreUrl && props.seeMoreUrl.trim() !== '' && props.seeMoreUrl !== '#'
  );

  const maxListCount: number = Math.max(0, effectiveItemCount - (featuredItem ? 1 : 0));
  const displayedListItems: IPersonalizedCompanyNewsItem[] =
    isExpanded || (!shouldShowSeeMore && props.itemCount === undefined)
      ? listItems
      : listItems.slice(0, maxListCount);

  const totalItemCount: number = currentDataset.length;
  const displayedTotalCount: number = (featuredItem ? 1 : 0) + displayedListItems.length;
  const hasHiddenItems: boolean = totalItemCount > displayedTotalCount;
  const renderSeeMoreButton: boolean = shouldShowSeeMore && (hasHiddenItems || hasExternalUrl);

  const handleItemClick = (item: IPersonalizedCompanyNewsItem): void => {
    if (item.url && item.url !== '#') {
      window.open(item.url, '_blank');
    }
  };

  const handleCategoryClick = (e: React.MouseEvent, category: string): void => {
    e.stopPropagation();
    // Placeholder for category navigation
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
            onClick={(): void => {
              setActiveTab('latest');
              setIsExpanded(false);
            }}
          >
            Latest
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
          {displayedListItems.map((item: IPersonalizedCompanyNewsItem): JSX.Element => (
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

        {/* See More Button at Bottom */}
        {renderSeeMoreButton && (
          <Box className={styles.seeMoreContainer}>
            <button
              type="button"
              className={styles.seeMoreButton}
              onClick={handleSeeMoreClick}
              aria-label={
                hasExternalUrl
                  ? 'See more company news'
                  : isExpanded
                  ? 'See less company news'
                  : 'See more company news'
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

export default PersonalizedCompanyNews;
