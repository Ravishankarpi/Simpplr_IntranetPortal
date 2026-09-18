import * as React from 'react';
import styles from './LatestPopularArticle.module.scss';
import type { ILatestPopularArticleProps } from './ILatestPopularArticleProps';
import { SPService } from '../../../shared/SPService';
import { Constants, ROOT_SITE_URL } from '../../../shared/Constant';

export interface ILatestPopularArticleState {
  pages: any[];
  loading: boolean;
  sortingOption: string;
  carouselIndex: number;
}

const CARDS_VISIBLE = 3; // how many cards to show at once

export default class LatestPopularArticle extends React.Component<ILatestPopularArticleProps, ILatestPopularArticleState> {
  private trackOuterRef: React.RefObject<HTMLDivElement> = React.createRef();

  constructor(props: ILatestPopularArticleProps) {
    super(props);
    this.state = {
      pages: [],
      loading: true,
      sortingOption: 'Latest',
      carouselIndex: 0,
    };
  }

  public async componentDidMount() {
    await this.fetchData();
  }

  public async componentDidUpdate(prevProps: ILatestPopularArticleProps, prevState: ILatestPopularArticleState) {
    if (
      prevProps.siteSelection !== this.props.siteSelection ||
      prevProps.showSites !== this.props.showSites ||
      prevProps.maxSitePageCount !== this.props.maxSitePageCount
    ) {
      await this.fetchData();
    }

    if (this.props.hideUIFilter && prevProps.paneFilterSelection !== this.props.paneFilterSelection) {
      this.setState({ sortingOption: this.props.paneFilterSelection || 'Latest' });
    }

    if (prevState.sortingOption !== this.state.sortingOption) {
      await this.fetchData();
    }
  }

  private async fetchData() {
    this.setState({ loading: true, carouselIndex: 0 });
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
      const pages = await SPService.getSitePages(siteUrls, Constants.PromotedState, maxCount, this.state.sortingOption);

      this.setState({ pages, loading: false });
    } catch (err) {
      console.error(err);
      this.setState({ loading: false });
    }
  }

  private setSorting = (option: string) => {
    this.setState({ sortingOption: option });
  }

  /* ── Carousel helpers ───────────────────────────── */
  private get maxIndex(): number {
    return Math.max(0, this.state.pages.length - CARDS_VISIBLE);
  }

  private prevSlide = () => {
    this.setState(s => ({ carouselIndex: Math.max(0, s.carouselIndex - 1) }));
  }

  private nextSlide = () => {
    this.setState(s => ({ carouselIndex: Math.min(this.maxIndex, s.carouselIndex + 1) }));
  }

  private goToSlide = (idx: number) => {
    this.setState({ carouselIndex: Math.min(this.maxIndex, Math.max(0, idx)) });
  }

  private getCardWidth(): number {
    if (this.trackOuterRef.current) {
      const gap = 16;
      const totalGap = gap * (CARDS_VISIBLE - 1);
      return (this.trackOuterRef.current.clientWidth - totalGap) / CARDS_VISIBLE;
    }
    return 280; // fallback
  }

  /* ── Shared card renderer ───────────────────────── */
  private renderCard(page: any, idx: number, extraStyle?: React.CSSProperties): React.ReactElement {
    const { showBanner, showSiteName, showTitle, showPublishedAt, showPostedBy } = this.props;

    const dateStr = page.PublishedDate
      ? new Date(page.PublishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '';

    let metaString = '';
    if (showSiteName && page.SiteName) metaString += `In ${page.SiteName}`;
    if (showPostedBy && page.Author) metaString += `${metaString ? ' ' : ''}by ${page.Author}`;
    if (showPublishedAt && page.PublishedDate) metaString += `${metaString ? ' ' : ''}on ${dateStr}`;

    return (
      <a
        key={idx}
        href={page.Url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.card}
        style={extraStyle}
      >
        {showBanner && (
          <div className={styles.imageContainer}>
            <img
              src={page.BannerImageUrl || 'https://via.placeholder.com/400x225?text=No+Image'}
              alt={page.Title || 'Article'}
            />
          </div>
        )}
        <div className={styles.cardContent}>
          {showTitle && <h3 className={styles.title} title={page.Title}>{page.Title}</h3>}
          <div className={styles.metaData} title={metaString}>
            {metaString || '\u00A0'}
          </div>
        </div>
        <div className={styles.cardFooter}>
          <span
            className={styles.cardAction}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            Share
          </span>
          <span className={styles.cardAction}>Learn more</span>
        </div>
      </a>
    );
  }

  /* ── Carousel render ────────────────────────────── */
  private renderCarousel(): React.ReactElement {
    const { pages, carouselIndex } = this.state;
    const cardWidth = this.getCardWidth();
    const gap = 16;
    const translateX = carouselIndex * (cardWidth + gap);
    const dots = Math.max(1, pages.length - CARDS_VISIBLE + 1);

    return (
      <div className={styles.carouselWrapper}>
        {/* Prev button */}
        <button
          className={`${styles.carouselBtn} ${styles.carouselBtnPrev}`}
          onClick={this.prevSlide}
          disabled={carouselIndex === 0}
          aria-label="Previous"
        >
          <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" /></svg>
        </button>

        {/* Track */}
        <div className={styles.carouselTrackOuter} ref={this.trackOuterRef}>
          <div
            className={styles.carouselTrack}
            style={{ transform: `translateX(-${translateX}px)` }}
          >
            {pages.map((page, idx) => (
              <div
                key={idx}
                className={styles.carouselItem}
                style={{ width: `${cardWidth}px` }}
              >
                {this.renderCard(page, idx)}
              </div>
            ))}
          </div>
        </div>

        {/* Next button */}
        <button
          className={`${styles.carouselBtn} ${styles.carouselBtnNext}`}
          onClick={this.nextSlide}
          disabled={carouselIndex >= this.maxIndex}
          aria-label="Next"
        >
          <svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
        </button>

        {/* Dot indicators */}
        {dots > 1 && (
          <div className={styles.carouselDots}>
            {Array.from({ length: dots }).map((_, i) => (
              <button
                key={i}
                className={`${styles.carouselDot}${i === carouselIndex ? ' ' + styles.activeDot : ''}`}
                onClick={() => this.goToSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  public render(): React.ReactElement<ILatestPopularArticleProps> {
    const {
      showBanner,
      showSiteName,
      showTitle,
      showPublishedAt,
      showPostedBy,
      layoutView,
      hideUIFilter,
    } = this.props;

    return (
      <section className={styles.latestPopularArticle} style={{ padding: 0, margin: 0 }}>
        {/* Sort dropdown */}
        {!hideUIFilter && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
            <select
              value={this.state.sortingOption}
              onChange={(e) => this.setSorting(e.target.value)}
              style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '12px', outline: 'none', cursor: 'pointer' }}
            >
              <option value="Latest">Sort by: Latest</option>
              <option value="Popular">Sort by: Popular</option>
            </select>
          </div>
        )}

        {this.state.loading && <div>Loading articles...</div>}
        {!this.state.loading && this.state.pages.length === 0 && <div>No articles found.</div>}

        {!this.state.loading && this.state.pages.length > 0 && (
          layoutView === 'Carousel'
            ? this.renderCarousel()
            : (
              <div className={layoutView === 'Row' ? styles.rowView : styles.listView}>
                {this.state.pages.map((page, idx) => {
                  const dateStr = page.PublishedDate
                    ? new Date(page.PublishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '';

                  let metaString = '';
                  if (showSiteName && page.SiteName) metaString += `In ${page.SiteName}`;
                  if (showPostedBy && page.Author) metaString += `${metaString ? ' ' : ''}by ${page.Author}`;
                  if (showPublishedAt && page.PublishedDate) metaString += `${metaString ? ' ' : ''}on ${dateStr}`;

                  return (
                    <a key={idx} href={page.Url} target="_blank" rel="noopener noreferrer" className={styles.card}>
                      {showBanner && (
                        <div className={styles.imageContainer}>
                          <img src={page.BannerImageUrl || 'https://via.placeholder.com/400x200?text=No+Image'} alt="Banner" />
                        </div>
                      )}
                      <div className={styles.cardContent}>
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
                    </a>
                  );
                })}
              </div>
            )
        )}
      </section>
    );
  }
}

