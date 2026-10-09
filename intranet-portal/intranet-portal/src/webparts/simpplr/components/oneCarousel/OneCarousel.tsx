import * as React from 'react';
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  createTheme,
  ThemeProvider
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { IOneCarouselProps, ICarouselItem } from './IOneCarouselProps';
import { mockCarouselItems } from './mockData';
import styles from './OneCarousel.module.scss';

const muiTheme = createTheme({
  palette: {
    primary: {
      main: '#0078d4'
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#424242'
    }
  },
  typography: {
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif'
  }
});

const ITEMS_PER_PAGE: number = 3;

export const OneCarousel: React.FC<IOneCarouselProps> = (props: IOneCarouselProps): JSX.Element => {
  const [currentPage, setCurrentPage] = React.useState<number>(0);
  const [isPaused, setIsPaused] = React.useState<boolean>(false);
  const items: ICarouselItem[] = mockCarouselItems;

  const autoPlay: boolean = props.autoPlay !== false;
  const intervalSeconds: number =
    props.interval !== undefined && props.interval > 0 ? props.interval : 5;

  const totalPages: number = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
  const startIndex: number = currentPage * ITEMS_PER_PAGE;
  const visibleItems: ICarouselItem[] = items.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Auto-slide effect based on configured timeframe (default 5 seconds)
  React.useEffect((): (() => void) | void => {
    if (!autoPlay || isPaused || totalPages <= 1) {
      return;
    }

    const timer: number = window.setInterval((): void => {
      setCurrentPage((prev: number): number => (prev + 1) % totalPages);
    }, intervalSeconds * 1000);

    return (): void => {
      window.clearInterval(timer);
    };
  }, [autoPlay, isPaused, totalPages, intervalSeconds]);

  const isPrevDisabled: boolean = totalPages <= 1;
  const isNextDisabled: boolean = totalPages <= 1;

  const handlePrev = (): void => {
    if (totalPages <= 1) {
      return;
    }
    setCurrentPage((prev: number): number => (prev - 1 + totalPages) % totalPages);
  };

  const handleNext = (): void => {
    if (totalPages <= 1) {
      return;
    }
    setCurrentPage((prev: number): number => (prev + 1) % totalPages);
  };

  const handleCardClick = (item: ICarouselItem): void => {
    if (item.url && item.url !== '#') {
      window.open(item.url, '_blank');
    }
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <Box
        className={styles.oneCarouselContainer}
        onMouseEnter={(): void => setIsPaused(true)}
        onMouseLeave={(): void => setIsPaused(false)}
      >
        {props.title && (
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              mb: 2,
              color: '#1a1a1a',
              letterSpacing: '-0.01em'
            }}
          >
            {props.title}
          </Typography>
        )}

        <Box sx={{ position: 'relative', width: '100%' }}>
          {/* Previous Navigation Button */}
          <IconButton
            aria-label="Previous items"
            onClick={handlePrev}
            disabled={isPrevDisabled}
            sx={{
              position: 'absolute',
              left: 0,
              top: '130px', // Centered vertically over the 280px image area
              transform: 'translateY(-50%)',
              zIndex: 10,
              backgroundColor: isPrevDisabled ? 'rgba(70, 95, 140, 0.25)' : 'rgba(70, 95, 140, 0.65)',
              color: '#ffffff',
              borderRadius: '0 4px 4px 0',
              width: 38,
              height: 52,
              '&:hover': {
                backgroundColor: isPrevDisabled ? 'rgba(70, 95, 140, 0.25)' : 'rgba(50, 75, 120, 0.85)'
              },
              '&.Mui-disabled': {
                color: 'rgba(255, 255, 255, 0.4)',
                backgroundColor: 'rgba(70, 95, 140, 0.25)'
              },
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <ChevronLeftIcon fontSize="medium" />
          </IconButton>

          {/* Next Navigation Button */}
          <IconButton
            aria-label="Next items"
            onClick={handleNext}
            disabled={isNextDisabled}
            sx={{
              position: 'absolute',
              right: 0,
              top: '130px', // Centered vertically over the 280px image area
              transform: 'translateY(-50%)',
              zIndex: 10,
              backgroundColor: isNextDisabled ? 'rgba(70, 95, 140, 0.25)' : 'rgba(70, 95, 140, 0.65)',
              color: '#ffffff',
              borderRadius: '4px 0 0 4px',
              width: 38,
              height: 52,
              '&:hover': {
                backgroundColor: isNextDisabled ? 'rgba(70, 95, 140, 0.25)' : 'rgba(50, 75, 120, 0.85)'
              },
              '&.Mui-disabled': {
                color: 'rgba(255, 255, 255, 0.4)',
                backgroundColor: 'rgba(70, 95, 140, 0.25)'
              },
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <ChevronRightIcon fontSize="medium" />
          </IconButton>

          {/* Carousel Track with 2:1:1 layout */}
          <Box className={styles.carouselTrack}>
            {visibleItems.map((item: ICarouselItem, index: number): JSX.Element => {
              const isFirstCard: boolean = index === 0;

              return (
                <Box
                  key={item.id}
                  sx={{
                    flex: isFirstCard ? '2 1 0' : '1 1 0',
                    minWidth: 0,
                    display: 'flex'
                  }}
                >
                  <Card
                    elevation={0}
                    onClick={(): void => handleCardClick(item)}
                    sx={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      border: '1px solid #e7e7e7',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)'
                      }
                    }}
                  >
                    {/* Card Image */}
                    <CardMedia
                      component="img"
                      image={item.imageUrl}
                      alt={item.title}
                      sx={{
                        height: 280,
                        width: '100%',
                        objectFit: 'cover',
                        // Anchor smaller cards to the left so image text stays visible
                        objectPosition: isFirstCard ? 'center center' : 'left center',
                        display: 'block',
                        backgroundColor: '#f3f3f3'
                      }}
                      // MUI CardMedia sets object-fit: inherit by default; override it inline
                      style={{ objectFit: 'cover', objectPosition: isFirstCard ? 'center center' : 'left center' }}
                    />

                    {/* Card Content */}
                    <CardContent
                      sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: isFirstCard ? '20px 24px' : '18px 20px',
                        backgroundColor: '#ffffff',
                        '&:last-child': {
                          paddingBottom: isFirstCard ? '20px' : '18px'
                        }
                      }}
                    >
                      {/* Bold Black Title */}
                      <Typography
                        component="h3"
                        sx={{
                          fontWeight: 700,
                          fontSize: isFirstCard ? '1.35rem' : '1.15rem',
                          lineHeight: 1.3,
                          color: '#1a1a1a',
                          mb: 2.5,
                          wordBreak: 'break-word',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {item.title}
                      </Typography>

                      {/* Category Text + Published Date inline: "In [Category] · [Date]" */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          fontSize: '0.9rem',
                          color: '#424242'
                        }}
                      >
                        <Typography
                          component="span"
                          sx={{
                            fontSize: 'inherit',
                            color: '#424242',
                            mr: 0.5
                          }}
                        >
                          In
                        </Typography>
                        <Typography
                          component="span"
                          sx={{
                            fontSize: 'inherit',
                            fontWeight: 500,
                            color: '#0078d4',
                            cursor: 'pointer',
                            '&:hover': {
                              textDecoration: 'underline',
                              color: '#106ebe'
                            }
                          }}
                        >
                          {item.category}
                        </Typography>
                        {item.publishedDate && (
                          <>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: 'inherit',
                                color: '#9e9e9e',
                                mx: 0.75
                              }}
                            >
                              ·
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: '0.85rem',
                                color: '#757575'
                              }}
                            >
                              {item.publishedDate}
                            </Typography>
                          </>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              );
            })}

            {/* Incomplete page filler to preserve 2:1:1 ratio if fewer than 3 items */}
            {visibleItems.length === 1 && (
              <>
                <Box sx={{ flex: '1 1 0', minWidth: 0 }} />
                <Box sx={{ flex: '1 1 0', minWidth: 0 }} />
              </>
            )}
            {visibleItems.length === 2 && (
              <Box sx={{ flex: '1 1 0', minWidth: 0 }} />
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default OneCarousel;
