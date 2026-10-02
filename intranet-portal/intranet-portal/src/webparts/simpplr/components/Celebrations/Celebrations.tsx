import * as React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Button,
  IconButton,
  createTheme,
  ThemeProvider
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PersonIcon from '@mui/icons-material/Person';
import { ICelebrationsProps, ICelebration, ICelebrationsData } from './ICelebrationsProps';
import { defaultCelebrationsData } from './mockData';
import styles from './Celebrations.module.scss';

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

export const Celebrations: React.FC<ICelebrationsProps> = (
  props: ICelebrationsProps
): JSX.Element => {
  const data: ICelebrationsData = props.data || defaultCelebrationsData;
  const { upcomingCount, celebrations } = data;

  const [currentIndex, setCurrentIndex] = React.useState<number>(0);
  const [imageErrorMap, setImageErrorMap] = React.useState<{ [key: string]: boolean }>({});
  const [followingMap, setFollowingMap] = React.useState<{ [key: string]: boolean }>({});

  const celebrationsCount: number = celebrations ? celebrations.length : 0;
  const currentCelebration: ICelebration | undefined =
    celebrationsCount > 0 ? celebrations[currentIndex % celebrationsCount] : undefined;

  const handleNext = (): void => {
    if (celebrationsCount > 1) {
      setCurrentIndex((prev: number): number => (prev + 1) % celebrationsCount);
    }
  };

  const handleToggleFollow = (celebrationId: string): void => {
    setFollowingMap((prev: { [key: string]: boolean }): { [key: string]: boolean } => ({
      ...prev,
      [celebrationId]: !prev[celebrationId]
    }));
  };

  const handleImageError = (celebrationId: string): void => {
    setImageErrorMap((prev: { [key: string]: boolean }): { [key: string]: boolean } => ({
      ...prev,
      [celebrationId]: true
    }));
  };

  const getInitials = (name: string): string => {
    if (!name) return '';
    const parts: string[] = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return (parts[0] ? parts[0][0] : '?').toUpperCase();
  };

  const isFollowing: boolean = currentCelebration
    ? !!followingMap[currentCelebration.id]
    : false;

  const hasImageError: boolean = currentCelebration
    ? !!imageErrorMap[currentCelebration.id]
    : false;

  return (
    <ThemeProvider theme={muiTheme}>
      <Box className={styles.container}>
        {/* Section Heading */}
        <Typography component="h2" className={styles.headerTitle}>
          {props.title || 'Celebrations'}
        </Typography>

        {/* Horizontal Two-Part Layout: Left Summary Card + Right Upcoming Celebration */}
        <Box className={styles.cardLayout}>
          {/* LEFT: Large Blue Summary Card */}
          <Box className={styles.summaryCard} role="region" aria-label="Celebrations Summary">
            <Typography component="div" className={styles.summaryNumber}>
              {upcomingCount}
            </Typography>
            <Typography component="div" className={styles.summaryLabel}>
              {'Upcoming\nCelebrations'}
            </Typography>
          </Box>

          {/* RIGHT: Upcoming Celebration / Person Card */}
          <Box
            className={styles.celebrationCard}
            role="region"
            aria-label="Upcoming Celebration"
          >
            {currentCelebration ? (
              <>
                {/* Circular Profile Image with Graceful Fallback */}
                <Box className={styles.avatarContainer}>
                  {!hasImageError && currentCelebration.profileImage ? (
                    <Avatar
                      src={currentCelebration.profileImage}
                      alt={currentCelebration.employeeName}
                      className={styles.avatar}
                      imgProps={{
                        onError: (): void => handleImageError(currentCelebration.id)
                      }}
                    />
                  ) : (
                    <Avatar
                      className={styles.avatar}
                      sx={{
                        bgcolor: '#0078d4',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '1.25rem'
                      }}
                      alt={currentCelebration.employeeName}
                    >
                      {getInitials(currentCelebration.employeeName) || <PersonIcon />}
                    </Avatar>
                  )}
                </Box>

                {/* Contextual Label */}
                <Typography component="div" className={styles.contextLabel}>
                  {"What's coming"}
                </Typography>

                {/* Employee Name */}
                <Typography component="h3" className={styles.employeeName}>
                  {currentCelebration.employeeName}
                </Typography>

                {/* Service Info / Celebration Type */}
                <Typography component="p" className={styles.serviceInfo}>
                  {currentCelebration.years && currentCelebration.years > 0
                    ? `${currentCelebration.years} ${
                        currentCelebration.years === 1 ? 'year' : 'years'
                      }`
                    : currentCelebration.celebrationType}
                </Typography>

                {/* Time Remaining */}
                <Typography component="p" className={styles.timeRemaining}>
                  {currentCelebration.daysUntil === 0
                    ? 'Today'
                    : currentCelebration.daysUntil === 1
                    ? 'in 1 day'
                    : `in ${currentCelebration.daysUntil} days`}
                </Typography>

                {/* Follow Button */}
                <Button
                  variant={isFollowing ? 'outlined' : 'contained'}
                  color="primary"
                  size="small"
                  aria-label={`${isFollowing ? 'Unfollow' : 'Follow'} ${currentCelebration.employeeName}`}
                  onClick={(): void => handleToggleFollow(currentCelebration.id)}
                  className={`${styles.followButton} ${
                    isFollowing ? styles.followingActive : ''
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>

                {/* Right Navigation Arrow Button */}
                {celebrationsCount > 1 && (
                  <IconButton
                    aria-label="Next celebration"
                    onClick={handleNext}
                    size="small"
                    className={styles.navArrowButton}
                  >
                    <ChevronRightIcon fontSize="small" />
                  </IconButton>
                )}
              </>
            ) : (
              <Typography color="text.secondary">
                No upcoming celebrations
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Celebrations;
