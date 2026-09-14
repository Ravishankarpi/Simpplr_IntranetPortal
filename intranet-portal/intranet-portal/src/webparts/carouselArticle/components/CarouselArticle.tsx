import * as React from 'react';
import styles from './CarouselArticle.module.scss';
import type { ICarouselArticleProps } from './ICarouselArticleProps';
import { SPService } from '../../../shared/SPService';
import { Constants, ROOT_SITE_URL } from '../../../shared/Constant';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export interface ICarouselArticleState {
  pages: any[];
  loading: boolean;
}

export default class CarouselArticle extends React.Component<ICarouselArticleProps, ICarouselArticleState> {
  constructor(props: ICarouselArticleProps) {
    super(props);
    this.state = {
      pages: [],
      loading: true
    };
  }

  public async componentDidMount() {
    await this.fetchData();
  }

  public async componentDidUpdate(prevProps: ICarouselArticleProps) {
    if (prevProps.siteSelection !== this.props.siteSelection ||
      prevProps.showSites !== this.props.showSites ||
      prevProps.maxSitePageCount !== this.props.maxSitePageCount ||
      prevProps.sortingOption !== this.props.sortingOption) {
      await this.fetchData();
    }
  }

  private async fetchData() {
    this.setState({ loading: true });
    try {
      let siteUrls = [];
      if (this.props.siteSelection === 'All') {
        const allSites = await SPService.getAllSubSites();
        siteUrls = allSites.map(s => s.Url);
      } else {
        if (this.props.showSites && this.props.showSites.length > 0) {
          siteUrls = [...this.props.showSites];
        } else {
          // Default to root if no input added
          siteUrls = [ROOT_SITE_URL];
        }
      }

      const maxCount = this.props.maxSitePageCount || 5;
      const pages = await SPService.getSitePages(siteUrls, Constants.PromotedState, maxCount, this.props.sortingOption);

      this.setState({ pages, loading: false });
    } catch (err) {
      console.error(err);
      this.setState({ loading: false });
    }
  }

  public render(): React.ReactElement<ICarouselArticleProps> {
    const {
      slideShowCount,
      autoScrollTime,
      showBanner,
      showSiteName,
      showTitle,
      showPublishedAt,
      showPostedBy
    } = this.props;

    if (this.state.loading) {
      return <div>Loading articles...</div>;
    }

    if (this.state.pages.length === 0) {
      return <div>No articles found.</div>;
    }

    const delay = (autoScrollTime || 3) * 1000;
    const slidesView = slideShowCount || 3;

    return (
      <section className={styles.carouselArticle}>
        <Swiper
          slidesPerView={slidesView}
          spaceBetween={20}
          loop={true}
          autoplay={{
            delay: delay,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          navigation={true}
          modules={[Autoplay, Pagination, Navigation]}
          className={styles.mySwiper}
        >
          {this.state.pages.map((page, idx) => {
            const dateStr = new Date(page.PublishedDate).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            });
            // Build the metadata string dynamically based on toggles
            let metaString = '';
            if (showSiteName && page.SiteName) {
              metaString += `In ${page.SiteName}`;
            }
            if (showPostedBy && page.Author) {
              metaString += `${metaString ? ' ' : ''}by ${page.Author}`;
            }
            if (showPublishedAt && page.PublishedDate) {
              metaString += `${metaString ? ' ' : ''}on ${dateStr}`;
            }

            return (
              <SwiperSlide key={idx} className={styles.swiperSlide}>
                <a href={page.Url} target="_blank" rel="noopener noreferrer" className={styles.card}>
                  {showBanner && (
                    <div className={styles.imageContainer} style={{ minHeight: `${this.props.carouselItemHeight || 150}px` }}>
                      <img src={page.BannerImageUrl || 'https://via.placeholder.com/400x200?text=No+Image'} alt="Banner" />
                    </div>
                  )}
                  <div className={styles.cardContent} style={{ backgroundColor: '#e4dede' }}>
                    {showTitle && <h3 className={styles.title} title={page.Title}>{page.Title}</h3>}
                    <div className={styles.metaData} title={metaString}>
                      {showSiteName && page.SiteName && (
                        <span>
                          In <strong style={{ color: 'var(--link, #0078d4)' }}>{page.SiteName}</strong>
                        </span>
                      )}
                      {(showPostedBy || showPublishedAt) && (
                        <span>
                          {showSiteName && page.SiteName ? ' ' : ''}
                          {showPostedBy && page.Author ? `by ${page.Author} ` : ''}
                          {showPublishedAt && page.PublishedDate ? `on ${dateStr}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </a>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </section>
    );
  }
}

