import * as React from 'react';
import styles from './LatestPopularArticle.module.scss';
import type { ILatestPopularArticleProps } from './ILatestPopularArticleProps';
import { SPService } from '../../../shared/SPService';
import { Constants, ROOT_SITE_URL } from '../../../shared/Constant';

export interface ILatestPopularArticleState {
  pages: any[];
  loading: boolean;
  sortingOption: string;
}

export default class LatestPopularArticle extends React.Component<ILatestPopularArticleProps, ILatestPopularArticleState> {
  constructor(props: ILatestPopularArticleProps) {
    super(props);
    this.state = {
      pages: [],
      loading: true,
      sortingOption: 'Latest'
    };
  }

  public async componentDidMount() {
    await this.fetchData();
  }

  public async componentDidUpdate(prevProps: ILatestPopularArticleProps, prevState: ILatestPopularArticleState) {
    if (prevProps.siteSelection !== this.props.siteSelection ||
      prevProps.showSites !== this.props.showSites ||
      prevProps.maxSitePageCount !== this.props.maxSitePageCount) {
      await this.fetchData();
    }
    
    if (prevState.sortingOption !== this.state.sortingOption) {
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

  public render(): React.ReactElement<ILatestPopularArticleProps> {
    const {
      showBanner,
      showSiteName,
      showTitle,
      showPublishedAt,
      showPostedBy,
      layoutView
    } = this.props;

    return (
      <section className={styles.latestPopularArticle}>
        <div className={styles.sortButtonGroup}>
          <button 
            className={`${styles.sortButton} ${this.state.sortingOption === 'Latest' ? styles.sortButtonActive : ''}`}
            onClick={() => this.setSorting('Latest')}
          >
            Latest
          </button>
          <button 
            className={`${styles.sortButton} ${this.state.sortingOption === 'Popular' ? styles.sortButtonActive : ''}`}
            onClick={() => this.setSorting('Popular')}
          >
            Popular
          </button>
        </div>

        {this.state.loading && <div>Loading articles...</div>}
        {!this.state.loading && this.state.pages.length === 0 && <div>No articles found.</div>}
        
        {!this.state.loading && this.state.pages.length > 0 && (
          <div className={layoutView === 'Row' ? styles.rowView : styles.listView}>
            {this.state.pages.map((page, idx) => {
              const dateStr = new Date(page.PublishedDate).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
              });
              
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
              );
            })}
          </div>
        )}
      </section>
    );
  }
}
