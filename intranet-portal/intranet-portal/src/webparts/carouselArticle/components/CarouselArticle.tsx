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
  showToast: boolean;
  toastMessage: string;
}

export default class CarouselArticle extends React.Component<ICarouselArticleProps, ICarouselArticleState> {
  constructor(props: ICarouselArticleProps) {
    super(props);
    this.state = {
      pages: [],
      loading: true,
      showToast: false,
      toastMessage: ''
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
        siteUrls = allSites.map((s: any) => s.Url);
      } else {
        if (this.props.showSites && this.props.showSites.length > 0) {
          siteUrls = [...this.props.showSites];
        } else {
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

  /* ── Share: copy URL to clipboard ── */
  private handleShare = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    const copy = (text: string) => {
      if (navigator.clipboard) {
        return navigator.clipboard.writeText(text);
      }
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return Promise.resolve();
    };

    copy(url).then(() => {
      this.setState({ showToast: true, toastMessage: '🔗 Link copied to clipboard!' });
      setTimeout(() => this.setState({ showToast: false, toastMessage: '' }), 2500);
    }).catch(() => {
      this.setState({ showToast: true, toastMessage: 'Could not copy link.' });
      setTimeout(() => this.setState({ showToast: false, toastMessage: '' }), 2500);
    });
  }

  /* ── Learn more: open page in new tab ── */
  private handleLearnMore = (_e: React.MouseEvent, url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  /* ── Shimmer skeleton ─────────────────────────────── */
  private renderShimmer(): React.ReactElement {
    const count = this.props.slideShowCount || 3;
    return (
      <section
        className={styles.carouselArticle}
        style={{ backgroundColor: this.props.backgroundColor || 'transparent' }}
      >
        {this.props.showWebPartTitle && this.props.webPartTitle && (
          <div className={styles.webPartTitleBar}>
            <h2 className={styles.webPartTitle}>{this.props.webPartTitle}</h2>
          </div>
        )}
        <div className={styles.shimmerContainer}>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className={styles.shimmerCard}>
              <div className={styles.shimmerImage} style={{ height: `${this.props.carouselItemHeight || 150}px` }} />
              <div className={styles.shimmerContent}>
                <div className={styles.shimmerLine} />
                <div className={styles.shimmerLineShort} />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
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
      return this.renderShimmer();
    }

    if (this.state.pages.length === 0) {
      return <div>No articles found.</div>;
    }

    const delay = (autoScrollTime || 3) * 1000;
    const slidesView = slideShowCount || 3;

    return (
      <section
        className={styles.carouselArticle}
        style={{ backgroundColor: this.props.backgroundColor || 'transparent' }}
      >
        {/* ── Toast notification ── */}
        {this.state.showToast && (
          <div className={styles.toast}>{this.state.toastMessage}</div>
        )}

        {/* ── Web Part Title ── */}
        {this.props.showWebPartTitle && this.props.webPartTitle && (
          <div className={styles.webPartTitleBar}>
            <h2 className={styles.webPartTitle}>{this.props.webPartTitle}</h2>
          </div>
        )}

        {/* ── Carousel track with side nav zones ── */}
        <div className={styles.carouselContainer}>
          <Swiper
            slidesPerView={slidesView}
            spaceBetween={16}
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
              const dateStr = page.PublishedDate
                ? new Date(page.PublishedDate).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                })
                : '';

              let metaString = '';
              if (showSiteName && page.SiteName) metaString += `In ${page.SiteName}`;
              if (showPostedBy && page.Author) metaString += `${metaString ? ' ' : ''}by ${page.Author}`;
              if (showPublishedAt && page.PublishedDate) metaString += `${metaString ? ' ' : ''}on ${dateStr}`;

              return (
                <SwiperSlide key={idx} className={styles.swiperSlide}>
                  <div className={styles.card}>
                    {showBanner && (
                      <div
                        onClick={(e) => this.handleLearnMore(e, page.Url)}

                        className={styles.imageContainer}
                        style={{ minHeight: `${this.props.carouselItemHeight || 150}px` }}

                      >
                        <img
                          src={page.BannerImageUrl || 'https://via.placeholder.com/400x225?text=No+Image'}
                          alt={page.Title || 'Article'}
                        />
                      </div>
                    )}
                    <div className={styles.cardContent}
                      onClick={(e) => this.handleLearnMore(e, page.Url)}

                    >
                      {showTitle && <h3 className={styles.title} title={page.Title}>{page.Title}</h3>}
                      <div className={styles.metaData} title={metaString}>
                        {showSiteName && page.SiteName && (
                          <span>In <strong style={{ color: 'var(--link, #0078d4)' }}>{page.SiteName}</strong></span>
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
                    <div className={styles.cardFooter}>
                      <span
                        className={styles.cardAction}
                        onClick={(e) => this.handleShare(e, page.Url)}
                      >
                        Share
                      </span>
                      <span
                        className={styles.cardAction}
                        onClick={(e) => this.handleLearnMore(e, page.Url)}
                      >
                        Learn more
                      </span>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </section>
    );
  }
}
