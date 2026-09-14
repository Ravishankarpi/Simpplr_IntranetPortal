import { getSP } from './pnpjsConfig';
import { Web } from "@pnp/sp/webs";
import { ROOT_SITE_URL } from './Constant';

export class SPService {
  /**
   * Fetches all subsites recursively starting from the root site.
   */
  public static async getAllSubSites(): Promise<any[]> {
    const sp = getSP();
    let allSites: any[] = [];
    
    // Get the root site web first based on ROOT_SITE_URL
    const rootWebObj = Web([sp.web, ROOT_SITE_URL]);
    const rootWeb = await rootWebObj.select("Title", "Url", "Id")();
    allSites.push({
      Title: rootWeb.Title,
      Url: rootWeb.Url,
      Id: rootWeb.Id
    });

    // Recursively get subsites starting from the configured root web
    await this._getSubWebs(rootWebObj, allSites);
    return allSites;
  }

  private static async _getSubWebs(parentWeb: any, allSites: any[]): Promise<void> {
    const webs = await parentWeb.webs();
    for (const web of webs) {
      allSites.push({
        Title: web.Title,
        Url: web.Url,
        Id: web.Id
      });
      // Need to get the web object to call .webs() on it
      const sp = getSP();
      const currentWeb = Web([sp.web, web.Url]);
      await this._getSubWebs(currentWeb, allSites);
    }
  }

  /**
   * Fetch site pages based on promoted states
   */
  public static async getSitePages(siteUrls: string[], promotedStates: number[], maxCount: number, sortingOption: string = 'Latest'): Promise<any[]> {
    let allPages: any[] = [];
    const sp = getSP();

    // The Search API requires Path correctly formatted.
    const pathFilter = siteUrls.map(url => `Path:"${url}/SitePages"`).join(" OR ");
    const promotedFilter = promotedStates.map(state => `PromotedState:${state}`).join(" OR ");
    const queryText = `(${pathFilter}) AND (${promotedFilter}) AND IsDocument:True AND FileExtension:aspx`;

    try {
      const searchResults = await sp.search({
        Querytext: queryText,
        SelectProperties: ["ListItemID", "Title", "Path", "BannerImageUrl", "PictureThumbnailURL", "FirstPublishedDate", "Modified", "Created", "Author", "SiteTitle", "ViewsLifeTime", "SPWebUrl"],
        RowLimit: 50, // Fetch up to 50 to ensure we have enough to sort properly
        SortList: sortingOption === 'Popular' 
          ? [{ Property: "ViewsLifeTime", Direction: 1 }] // 1 = descending
          : [{ Property: "FirstPublishedDate", Direction: 1 }]
      });

      if (searchResults && searchResults.PrimarySearchResults) {
        
        // Group by SPWebUrl to optimize querying Likes and Comments via RenderListDataAsStream
        const pagesBySite: { [url: string]: any[] } = {};
        searchResults.PrimarySearchResults.forEach((p: any) => {
          // Fallback to substring if SPWebUrl is not populated
          const webUrl = p.SPWebUrl || p.Path.substring(0, p.Path.toLowerCase().indexOf('/sitepages')); 
          if (!pagesBySite[webUrl]) pagesBySite[webUrl] = [];
          pagesBySite[webUrl].push(p);
        });

        // Fetch Likes and Comments concurrently per site
        await Promise.all(Object.keys(pagesBySite).map(async (webUrl) => {
          try {
            const web = Web([sp.web, webUrl]);
            const sitePages = pagesBySite[webUrl];
            
            // Build CAML query to get exact items
            const ids = sitePages.map(p => `<Value Type="Number">${p.ListItemID}</Value>`).join('');
            const viewXml = `<View><ViewFields><FieldRef Name="ID"/><FieldRef Name="_CommentCount"/><FieldRef Name="_LikeCount"/></ViewFields><Query><Where><In><FieldRef Name="ID"/><Values>${ids}</Values></In></Where></Query><RowLimit>50</RowLimit></View>`;
            
            const result = await web.lists.getByTitle("Site Pages").renderListDataAsStream({
              RenderOptions: 2,
              ViewXml: viewXml
            });

            if (result && result.Row) {
              result.Row.forEach((r: any) => {
                const match = sitePages.find(p => p.ListItemID == r.ID);
                if (match) {
                  match.LikesCount = r._LikeCount ? parseInt(r._LikeCount, 10) : 0;
                  match.CommentsCount = r._CommentCount ? parseInt(r._CommentCount, 10) : 0;
                }
              });
            }
          } catch (err) {
            console.error(`Error fetching likes/comments for site ${webUrl}: `, err);
          }
        }));

        // Map final properties
        searchResults.PrimarySearchResults.forEach((page: any) => {
          let bannerUrl = page.BannerImageUrl || page.PictureThumbnailURL || '';
          
          allPages.push({
            Id: page.ListItemID,
            Title: page.Title,
            Url: page.Path,
            BannerImageUrl: bannerUrl,
            PublishedDate: page.FirstPublishedDate || page.Modified || page.Created,
            Author: page.Author || '',
            SiteName: page.SiteTitle || '',
            Views: page.ViewsLifeTime ? parseInt(page.ViewsLifeTime, 10) : 0,
            Comments: page.CommentsCount || 0,
            Likes: page.LikesCount || 0
          });
        });
      }

      // Re-apply custom sorting logic for Popular (combining Views, Likes, and Comments weight)
      if (sortingOption === 'Popular') {
        allPages.sort((a, b) => {
          const scoreA = a.Views + a.Comments * 5 + a.Likes * 3;
          const scoreB = b.Views + b.Comments * 5 + b.Likes * 3;
          if (scoreB === scoreA) {
            return new Date(b.PublishedDate).getTime() - new Date(a.PublishedDate).getTime();
          }
          return scoreB - scoreA;
        });
      } else {
        // Latest
        allPages.sort((a, b) => new Date(b.PublishedDate).getTime() - new Date(a.PublishedDate).getTime());
      }

    } catch (e) {
      console.error(`Error fetching pages via Search API: `, e);
    }
    
    return allPages.slice(0, maxCount);
  }
}
