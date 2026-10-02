import * as React from 'react';
import {
  Box,
  Typography,
  Button,
  Snackbar,
  Alert,
  createTheme,
  ThemeProvider
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import ArticleIcon from '@mui/icons-material/Article';
import { ISocialCampaignsProps, ISocialCampaignItem } from './ISocialCampaignsProps';
import { mockSocialCampaigns } from './mockData';
import styles from './SocialCampaigns.module.scss';

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
  }
});

export const SocialCampaigns: React.FC<ISocialCampaignsProps> = (
  props: ISocialCampaignsProps
): JSX.Element => {
  const [activeTab, setActiveTab] = React.useState<'latest' | 'popular'>('latest');
  const [imageErrorMap, setImageErrorMap] = React.useState<{ [key: string]: boolean }>({});
  const [snackbarOpen, setSnackbarOpen] = React.useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState<string>('');

  const allItems: ISocialCampaignItem[] = props.data || mockSocialCampaigns;
  const currentItems: ISocialCampaignItem[] = allItems.filter(
    (item: ISocialCampaignItem): boolean => item.category === activeTab
  );

  const handleImageError = (id: string): void => {
    setImageErrorMap((prev: { [key: string]: boolean }): { [key: string]: boolean } => ({
      ...prev,
      [id]: true
    }));
  };

  const handleShareClick = (item: ISocialCampaignItem): void => {
    const truncatedTitle: string =
      item.title.length > 35 ? `${item.title.substring(0, 35)}...` : item.title;
    setSnackbarMessage(`Share dialog ready for "${truncatedTitle}"`);
    setSnackbarOpen(true);
  };

  const handleItemClick = (item: ISocialCampaignItem): void => {
    if (item.url && item.url !== '#') {
      window.open(item.url, '_blank');
    }
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <Box className={styles.container}>
        {/* Main Title */}
        <Typography component="h2" className={styles.headerTitle}>
          {props.title || 'Social campaigns'}
        </Typography>

        {/* Sub-navigation Tabs: Latest / Popular */}
        <Box className={styles.tabsContainer} role="tablist" aria-label="Social campaigns tabs">
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

        {/* Vertical List of Social Campaign Cards */}
        <Box className={styles.campaignList}>
          {currentItems.map((item: ISocialCampaignItem): JSX.Element => {
            const hasError: boolean = !!imageErrorMap[item.id];

            return (
              <Box key={item.id} className={styles.campaignItem} role="article">
                {/* Top Teaser/Excerpt Line */}
                <Typography component="p" className={styles.excerptText} title={item.excerpt}>
                  {item.excerpt}
                </Typography>

                {/* Content Row: Thumbnail on Left, Details on Right */}
                <Box className={styles.contentRow}>
                  {/* Left: Rounded rectangular article/post thumbnail image */}
                  <Box className={styles.thumbnailWrapper}>
                    {!hasError && item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className={styles.thumbnailImage}
                        onError={(): void => handleImageError(item.id)}
                      />
                    ) : (
                      <Box className={styles.thumbnailFallback}>
                        <ArticleIcon fontSize="small" />
                      </Box>
                    )}
                  </Box>

                  {/* Right: Post title and social share stats row */}
                  <Box className={styles.detailsCol}>
                    <Typography
                      component="h3"
                      className={styles.postTitle}
                      onClick={(): void => handleItemClick(item)}
                      title={item.title}
                    >
                      {item.title}
                    </Typography>

                    <Box className={styles.actionsRow}>
                      {/* Social Share Counts */}
                      <Box className={styles.socialStats}>
                        {/* Facebook */}
                        <Box className={styles.socialStatItem}>
                          <FacebookIcon
                            className={`${styles.socialIcon} ${styles.fbIcon}`}
                            aria-label="Facebook shares"
                          />
                          <span>{item.shares.facebook}</span>
                        </Box>

                        {/* Twitter / X */}
                        <Box className={styles.socialStatItem}>
                          <TwitterIcon
                            className={`${styles.socialIcon} ${styles.twIcon}`}
                            aria-label="X shares"
                          />
                          <span>{item.shares.twitter}</span>
                        </Box>

                        {/* LinkedIn */}
                        <Box className={styles.socialStatItem}>
                          <LinkedInIcon
                            className={`${styles.socialIcon} ${styles.liIcon}`}
                            aria-label="LinkedIn shares"
                          />
                          <span>{item.shares.linkedin}</span>
                        </Box>
                      </Box>

                      {/* Share Action Button */}
                      <Button
                        variant="outlined"
                        size="small"
                        className={styles.shareButton}
                        aria-label={`Share ${item.title}`}
                        onClick={(): void => handleShareClick(item)}
                      >
                        Share
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Share Action Feedback Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={(): void => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={(): void => setSnackbarOpen(false)}
            severity="info"
            variant="filled"
            sx={{ width: '100%', fontSize: '0.825rem' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default SocialCampaigns;
