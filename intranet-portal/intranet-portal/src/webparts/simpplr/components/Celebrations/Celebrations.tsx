import * as React from 'react';
import { useState, useEffect } from 'react';
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
import { getSP } from '../../../../shared/pnpjsConfig';
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

const AVATAR_COLORS = [
  '#0078d4', // Microsoft Blue
  '#107c41', // Forest Green
  '#5c2d91', // Royal Purple
  '#d83b01', // Burnt Orange
  '#008272', // Teal
  '#a80000', // Crimson
  '#004e8c', // Deep Navy
  '#8764b8', // Lavender
  '#ca5010', // Amber
  '#038387'  // Cyan
];

const getAvatarBgColor = (name: string): string => {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

/**
 * Safely extracts a clean URL string from various SharePoint field types
 */
const parseUrlValue = (val: unknown): string => {
  if (!val) return '';
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined') {
      return '';
    }
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
      return trimmed;
    }
    const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) return srcMatch[1];
    const hrefMatch = trimmed.match(/href=["']([^"']+)["']/i);
    if (hrefMatch && hrefMatch[1]) return hrefMatch[1];
    return trimmed;
  }
  if (typeof val === 'object' && val !== null) {
    const obj = val as Record<string, unknown>;
    if (typeof obj.Url === 'string' && obj.Url.trim()) return obj.Url.trim();
    if (typeof obj.url === 'string' && obj.url.trim()) return obj.url.trim();
    if (typeof obj.serverRelativeUrl === 'string' && obj.serverRelativeUrl.trim()) return obj.serverRelativeUrl.trim();
    if (typeof obj.ServerRelativeUrl === 'string' && obj.ServerRelativeUrl.trim()) return obj.ServerRelativeUrl.trim();
  }
  return '';
};

interface IParsedDate {
  year: number;
  month: number; // 0-indexed (0 = Jan, 11 = Dec)
  day: number;
}

/**
 * Parses date string or Date object into year, month, and day components
 * avoiding timezone offset shifts.
 */
const parseDateParts = (rawVal: unknown): IParsedDate | undefined => {
  if (!rawVal) return undefined;

  if (typeof rawVal === 'string') {
    const trimmed = rawVal.trim();
    if (!trimmed || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined') {
      return undefined;
    }

    // YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
    const ymdMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (ymdMatch) {
      const year = parseInt(ymdMatch[1], 10);
      const month = parseInt(ymdMatch[2], 10) - 1;
      const day = parseInt(ymdMatch[3], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day) && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
        return { year, month, day };
      }
    }

    // MM/DD/YYYY
    const mdyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (mdyMatch) {
      const month = parseInt(mdyMatch[1], 10) - 1;
      const day = parseInt(mdyMatch[2], 10);
      const year = parseInt(mdyMatch[3], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day) && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
        return { year, month, day };
      }
    }

    // Fallback: standard Date parsing
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return {
        year: parsed.getFullYear(),
        month: parsed.getMonth(),
        day: parsed.getDate()
      };
    }
  } else if (rawVal instanceof Date && !isNaN(rawVal.getTime())) {
    return {
      year: rawVal.getFullYear(),
      month: rawVal.getMonth(),
      day: rawVal.getDate()
    };
  }

  return undefined;
};

/**
 * Calculates daysUntil (0 for today, 1 for tomorrow, etc.) and milestone years
 * for the next occurrence of the celebration event.
 */
const calculateCelebrationEvent = (
  dateParts: IParsedDate,
  celebrationType: 'Birthday' | 'Work Anniversary',
  today: Date
): { daysUntil: number; years?: number } => {
  const currentYear = today.getFullYear();

  let eventDate = new Date(currentYear, dateParts.month, dateParts.day);
  eventDate.setHours(0, 0, 0, 0);

  const todayMidnight = new Date(today);
  todayMidnight.setHours(0, 0, 0, 0);

  // If already passed earlier this year, next occurrence is next year
  if (eventDate.getTime() < todayMidnight.getTime()) {
    eventDate = new Date(currentYear + 1, dateParts.month, dateParts.day);
    eventDate.setHours(0, 0, 0, 0);
  }

  const diffMs = eventDate.getTime() - todayMidnight.getTime();
  const daysUntil = Math.round(diffMs / (1000 * 60 * 60 * 24));

  let years: number | undefined = undefined;
  if (celebrationType === 'Work Anniversary') {
    years = eventDate.getFullYear() - dateParts.year;
    if (years <= 0) {
      years = 1;
    }
  }

  return { daysUntil, years };
};

/**
 * Case-insensitive property lookup with keyword fallbacks
 */
const getFieldValue = (item: Record<string, unknown>, primaryKey: string, fallbackKeywords: string[]): unknown => {
  if (item[primaryKey] !== undefined && item[primaryKey] !== null && item[primaryKey] !== '') {
    return item[primaryKey];
  }
  for (const key of Object.keys(item)) {
    const lowerKey = key.toLowerCase();
    if (fallbackKeywords.some((kw) => lowerKey.includes(kw.toLowerCase()))) {
      const val = item[key];
      if (val !== undefined && val !== null && val !== '') {
        return val;
      }
    }
  }
  return undefined;
};

export const Celebrations: React.FC<ICelebrationsProps> = (
  props: ICelebrationsProps
): JSX.Element => {
  const [celebrationsData, setCelebrationsData] = useState<ICelebrationsData>(
    props.data || defaultCelebrationsData
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [imageErrorMap, setImageErrorMap] = useState<{ [key: string]: boolean }>({});
  const [followingMap, setFollowingMap] = useState<{ [key: string]: boolean }>({});

  const { upcomingCount, celebrations } = celebrationsData;
  const celebrationsCount: number = celebrations ? celebrations.length : 0;
  const currentCelebration: ICelebration | undefined =
    celebrationsCount > 0 ? celebrations[currentIndex % celebrationsCount] : undefined;

  useEffect(() => {
    // If explicit data was supplied via props, use it directly
    if (props.data && props.data.celebrations && props.data.celebrations.length > 0) {
      setCelebrationsData(props.data);
      return;
    }

    let isMounted = true;

    const loadCelebrationsFromSharePoint = async (): Promise<void> => {
      if (!props.context) return;

      try {
        const sp = getSP(props.context);
        const listTitle = 'Simpplr__People__c_Migration';
        const list = sp.web.lists.getByTitle(listTitle);

        // Required columns specified by user
        const PHOTO_INTERNAL_NAME = 'Simpplr__External_Full_Photo_URL0';
        const BIRTH_DATE_COL = 'Simpplr__Birth_Date__c';
        const JOINING_DATE_COL = 'Simpplr__Joining_Date__c';

        let items: Array<Record<string, unknown>> = [];

        // 1. Try querying with the specified columns
        try {
          items = await list.items
            .select('Id', 'Title', PHOTO_INTERNAL_NAME, BIRTH_DATE_COL, JOINING_DATE_COL)
            .top(50)();
        } catch (selectErr) {
          console.warn('Direct select with celebration columns failed, trying fallback resolution:', selectErr);
          try {
            // Check list fields metadata to resolve actual internal names if needed
            const allFields = await list.fields.select('Title', 'InternalName', 'EntityPropertyName')();
            const findInternal = (targetNames: string[], defaultName: string): string => {
              for (const tn of targetNames) {
                const match = allFields.find(
                  (f) =>
                    (f.InternalName || '').toLowerCase() === tn.toLowerCase() ||
                    (f.Title || '').toLowerCase() === tn.toLowerCase()
                );
                if (match && match.InternalName) return match.InternalName;
              }
              return defaultName;
            };

            const resolvedPhoto = findInternal(['Simpplr__External_Full_Photo_URL0', 'Simpplr__External_Full_Photo_URL_SP'], PHOTO_INTERNAL_NAME);
            const resolvedBirth = findInternal(['Simpplr__Birth_Date__c', 'Birth_Date', 'BirthDate'], BIRTH_DATE_COL);
            const resolvedJoin = findInternal(['Simpplr__Joining_Date__c', 'Joining_Date', 'JoiningDate'], JOINING_DATE_COL);

            const safeSelect = ['Id', 'Title'];
            [resolvedPhoto, resolvedBirth, resolvedJoin].forEach((col) => {
              if (col && safeSelect.indexOf(col) === -1) safeSelect.push(col);
            });

            items = await list.items.select(...safeSelect).top(50)();
          } catch (fieldsErr) {
            console.warn('Dynamic field select failed, querying without select:', fieldsErr);
            items = await list.items.top(50)();
          }
        }

        if (isMounted && items && items.length > 0) {
          const today = new Date();
          const allCelebrations: ICelebration[] = [];

          items.forEach((item, idx) => {
            const empName = (typeof item.Title === 'string' && item.Title.trim())
              ? item.Title.trim()
              : (typeof item.Simpplr__Name__c === 'string' && item.Simpplr__Name__c.trim())
                ? item.Simpplr__Name__c.trim()
                : (typeof item.Name === 'string' && item.Name.trim())
                  ? item.Name.trim()
                  : `Employee ${item.Id || idx + 1}`;

            // Profile photo from Simpplr__External_Full_Photo_URL0
            const rawPhoto = getFieldValue(item, PHOTO_INTERNAL_NAME, ['photo_url0', 'external_full_photo', 'photo_url']);
            const profileImage = parseUrlValue(rawPhoto);

            // 1. Birthday Celebration from Simpplr__Birth_Date__c
            const rawBirthDate = getFieldValue(item, BIRTH_DATE_COL, ['birth_date', 'birthdate', 'dob', 'birthday']);
            const birthParts = parseDateParts(rawBirthDate);
            if (birthParts) {
              const { daysUntil } = calculateCelebrationEvent(birthParts, 'Birthday', today);
              allCelebrations.push({
                id: `${item.Id || idx}-birthday`,
                employeeName: empName,
                celebrationType: 'Birthday',
                daysUntil,
                profileImage
              });
            }

            // 2. Work Anniversary Celebration from Simpplr__Joining_Date__c
            const rawJoiningDate = getFieldValue(item, JOINING_DATE_COL, ['joining_date', 'joiningdate', 'hiredate', 'startdate', 'anniversary']);
            const joiningParts = parseDateParts(rawJoiningDate);
            if (joiningParts) {
              const { daysUntil, years } = calculateCelebrationEvent(joiningParts, 'Work Anniversary', today);
              allCelebrations.push({
                id: `${item.Id || idx}-anniversary`,
                employeeName: empName,
                celebrationType: 'Work Anniversary',
                years,
                daysUntil,
                profileImage
              });
            }
          });

          // Sort by daysUntil ascending (nearest upcoming celebration first)
          allCelebrations.sort((a, b) => a.daysUntil - b.daysUntil);

          if (allCelebrations.length > 0) {
            const top20Celebrations = allCelebrations.slice(0, 20);
            setCelebrationsData({
              upcomingCount: top20Celebrations.length,
              celebrations: top20Celebrations
            });
            setCurrentIndex(0);
          }
        }
      } catch (err) {
        console.warn('Could not load celebrations from Simpplr__People__c_Migration, using mock data:', err);
      }
    };

    loadCelebrationsFromSharePoint().catch(console.error);

    return () => {
      isMounted = false;
    };
  }, [props.context, props.data]);

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
                        bgcolor: getAvatarBgColor(currentCelebration.employeeName),
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
