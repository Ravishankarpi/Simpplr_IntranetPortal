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
  showToast: boolean;
  toastMessage: string;
  narrowContainer: boolean;  // true when the listView is < 400px wide
}

const CARDS_VISIBLE = 3;

/* Sort option metadata */
const SORT_OPTIONS = [
  { key: 'Latest', label: 'Sort by: Latest' },
  { key: 'Popular', label: 'Sort by: Popular' },
  { key: 'A-Z', label: 'Sort by: A → Z' },
  { key: 'Z-A', label: 'Sort by: Z → A' },
  { key: 'Oldest', label: 'Sort by: Oldest' },
];

/* Which SP sort key to request for each UI option */
const SP_SORT_MAP: Record<string, string> = {
  Latest: 'Latest',
  Popular: 'Popular',
  'A-Z': 'Latest',  // fetch latest, then sort client-side
  'Z-A': 'Latest',
  Oldest: 'Latest',
};

function applyClientSort(pages: any[], option: string): any[] {
  switch (option) {
    case 'A-Z':
      return [...pages].sort((a, b) => (a.Title || '').localeCompare(b.Title || ''));
    case 'Z-A':
      return [...pages].sort((a, b) => (b.Title || '').localeCompare(a.Title || ''));
    case 'Oldest':
      return [...pages].sort((a, b) =>
        new Date(a.PublishedDate || 0).getTime() - new Date(b.PublishedDate || 0).getTime()
      );
    default:
      return pages;
  }
}

export default class LatestPopularArticle extends React.Component<ILatestPopularArticleProps, ILatestPopularArticleState> {
  private trackOuterRef: React.RefObject<HTMLDivElement> = React.createRef();
  private _listViewRef: React.RefObject<HTMLDivElement> = React.createRef();
  private _resizeObserver: ResizeObserver | null = null;

  constructor(props: ILatestPopularArticleProps) {
    super(props);
    this.state = {
      pages: [],
      loading: true,
      sortingOption: 'Latest',
      carouselIndex: 0,
      showToast: false,
      toastMessage: '',
      narrowContainer: false,
    };
  }

  public async componentDidMount() {
    await this.fetchData();
    // Watch the listView container for width changes
    if (this._listViewRef.current && typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const isNarrow = entry.contentRect.width < 400;
          if (this.state.narrowContainer !== isNarrow) {
            this.setState({ narrowContainer: isNarrow });
          }
        }
      });
      this._resizeObserver.observe(this._listViewRef.current);
    }
  }

  public componentWillUnmount() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
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
      const spSort = SP_SORT_MAP[this.state.sortingOption] || 'Latest';
      const rawPages = await SPService.getSitePages(siteUrls, Constants.PromotedState, maxCount, spSort);
      const pages = applyClientSort(rawPages, this.state.sortingOption);

      this.setState({ pages, loading: false });
    } catch (err) {
      console.error(err);
      this.setState({ loading: false });
    }
  }

  private setSorting = (option: string) => {
    this.setState({ sortingOption: option });
  }

  /* ── Share: copy URL to clipboard ── */
  private handleShare = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    const copy = (text: string) => {
      if (navigator.clipboard) return navigator.clipboard.writeText(text);
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
    copy(url)
      .then(() => {
        this.setState({ showToast: true, toastMessage: '🔗 Link copied to clipboard!' });
        setTimeout(() => this.setState({ showToast: false, toastMessage: '' }), 2500);
      })
      .catch(() => {
        this.setState({ showToast: true, toastMessage: 'Could not copy link.' });
        setTimeout(() => this.setState({ showToast: false, toastMessage: '' }), 2500);
      });
  }

  /* ── Learn more: open page in new tab ── */
  private handleLearnMore = (_e: React.MouseEvent, url: string) => {
    window.open(url, '_self', 'noopener,noreferrer');
  }

  /* ── Carousel helpers ─────────────────────────────── */
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
    return 280;
  }

  /* ── Shimmer ─────────────────────────────────────── */
  private renderShimmer(): React.ReactElement {
    const { layoutView } = this.props;
    const isListView = layoutView === 'List';

    if (isListView) {
      return (
        <div className={styles.shimmerListContainer}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={styles.shimmerListItem}>
              <div className={styles.shimmerListThumb} />
              <div className={styles.shimmerListBody}>
                <div className={styles.shimmerLine} />
                <div className={styles.shimmerLineShort} />
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className={styles.shimmerRowContainer}>
        {[1, 2, 3].map(i => (
          <div key={i} className={styles.shimmerCard}>
            <div className={styles.shimmerImage} />
            <div className={styles.shimmerContent}>
              <div className={styles.shimmerLine} />
              <div className={styles.shimmerLineShort} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ── Shared card renderer ────────────────────────── */
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
      <div
        key={idx}
        className={styles.card}
        style={extraStyle}
      >
        {showBanner && (
          <div className={styles.imageContainer}
            onClick={(e) => this.handleLearnMore(e, page.Url)}
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
            {metaString || '\u00A0'}
          </div>
        </div>
        <div
          className={styles.cardFooter}
          style={this.state.narrowContainer ? { display: 'none' } : undefined}
        >
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
    );
  }

  /* ── Carousel render ─────────────────────────────── */
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
      showWebPartTitle,
      webPartTitle,
    } = this.props;

    return (
      <section className={styles.latestPopularArticle} style={{ padding: 0, margin: 0 }}>

        {/* ── Toast ── */}
        {this.state.showToast && (
          <div className={styles.toast}>{this.state.toastMessage}</div>
        )}

        {/* ── Web Part Title ── */}
        {showWebPartTitle && webPartTitle && (
          <div className={styles.webPartTitleBar}>
            <h2 className={styles.webPartTitle}>{webPartTitle}</h2>
          </div>
        )}

        {/* ── Filter / Sort bar ── */}
        {!hideUIFilter && (
          <div className={styles.filterBar}>
            <select
              className={styles.filterSelect}
              value={this.state.sortingOption}
              onChange={(e) => this.setSorting(e.target.value)}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* ── Loading shimmer ── */}
        {this.state.loading && this.renderShimmer()}

        {/* ── Empty state ── */}
        {!this.state.loading && this.state.pages.length === 0 && <div>No articles found.</div>}

        {/* ── Content ── */}
        {!this.state.loading && this.state.pages.length > 0 && (
          layoutView === 'Carousel'
            ? this.renderCarousel()
            : (
              <div
                ref={layoutView === 'Row' ? undefined : this._listViewRef}
                className={layoutView === 'Row' ? styles.rowView : styles.listView}
              >
                {this.state.pages.map((page, idx) => this.renderCard(page, idx))}
              </div>
            )
        )}
      </section>
    );
  }
}
