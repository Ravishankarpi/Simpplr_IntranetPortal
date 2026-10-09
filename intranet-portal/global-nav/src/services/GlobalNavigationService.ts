import { spfi, SPFI, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/fields';
import '@pnp/sp/views';
import { ApplicationCustomizerContext } from '@microsoft/sp-application-base';
import { GLOBAL_NAVIGATION_LIST, ROOT_SITE_URL } from '../config/constants';
import { INavItem, INavSection } from '../extensions/globalNav/components/IGlobalNavProps';
import { mockNavSections, mockRailTopItems, mockRailBottomItems } from '../extensions/globalNav/components/mockData';

export interface IGlobalNavDbItem {
  Id?: number;
  Title: string;
  NavUrl?: string;
  Section?: string;
  ParentTitle?: string;
  IconName?: string;
  AvatarUrl?: string;
  OrderNumber?: number;
  HasChildren?: boolean;
  OpenInNewTab?: boolean;
}

export class GlobalNavigationService {
  private sp: SPFI;

  constructor(context: ApplicationCustomizerContext) {
    const targetUrl = ROOT_SITE_URL || context.pageContext.site.absoluteUrl;
    this.sp = spfi(targetUrl).using(SPFx(context));
  }

  /**
   * Ensures the GlobalNavigation list and its columns exist in SharePoint.
   * If newly created or empty, seeds the sample data from the reference design.
   */
  public async ensureNavigationList(): Promise<void> {
    try {
      const ensureResult = await this.sp.web.lists.ensure(
        GLOBAL_NAVIGATION_LIST,
        'Global Navigation Configuration for Simpplr Sidebar',
        100
      );
      const list = ensureResult.list;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const addFieldSafe = async (op: Promise<any>): Promise<void> => {
        try {
          await op;
        } catch {
          // ignore error if field already exists
        }
      };

      await addFieldSafe(list.fields.addText('NavUrl'));
      await addFieldSafe(list.fields.addText('Section'));
      await addFieldSafe(list.fields.addText('ParentTitle'));
      await addFieldSafe(list.fields.addText('IconName'));
      await addFieldSafe(list.fields.addText('AvatarUrl'));
      await addFieldSafe(list.fields.addNumber('OrderNumber'));
      await addFieldSafe(list.fields.addBoolean('HasChildren'));
      await addFieldSafe(list.fields.addBoolean('OpenInNewTab'));

      // Check item count; if 0, seed initial items
      const existingItems = await list.items.select('Id').top(1)();
      if (!existingItems || existingItems.length === 0) {
        console.log(`[GlobalNavService] Seeding default navigation items into ${GLOBAL_NAVIGATION_LIST}...`);
        await this.seedDefaultItems(list);
      }
    } catch (e) {
      console.warn('[GlobalNavService] Could not ensure navigation list in SharePoint:', e);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async seedDefaultItems(list: any): Promise<void> {
    const initialItems: IGlobalNavDbItem[] = [
      // Primary Drawer items
      { Title: 'Home', NavUrl: '/', Section: 'primary', IconName: 'Home', OrderNumber: 1 },
      { Title: 'Feed', NavUrl: '#/feed', Section: 'primary', IconName: 'Feed', OrderNumber: 2 },
      { Title: 'My Hub', NavUrl: '#/hub', Section: 'primary', IconName: 'Hub', OrderNumber: 3 },
      { Title: 'Onboarding', NavUrl: '#/onboarding', Section: 'primary', IconName: 'Onboarding', OrderNumber: 4 },
      { Title: 'Must reads', NavUrl: '#/must-reads', Section: 'primary', IconName: 'MustReads', OrderNumber: 5 },
      { Title: 'Reward store', NavUrl: '#/reward-store', Section: 'primary', IconName: 'RewardStore', HasChildren: true, OrderNumber: 6 },
      { Title: 'Events', NavUrl: '#/events', Section: 'primary', IconName: 'Events', OrderNumber: 7 },

      // Explore Drawer items
      { Title: 'Benefits', NavUrl: '#/benefits', Section: 'explore', IconName: 'Circle', HasChildren: true, OrderNumber: 1 },
      { Title: 'Culture & Recogni...', NavUrl: '#/culture', Section: 'explore', IconName: 'Culture', HasChildren: true, OrderNumber: 2 },
      { Title: 'Career & Learning', NavUrl: '#/career', Section: 'explore', IconName: 'Career', HasChildren: true, OrderNumber: 3 },

      // Recently visited Drawer items
      {
        Title: 'Human Resources',
        NavUrl: '#/hr',
        Section: 'recent',
        AvatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80',
        OrderNumber: 1
      },
      {
        Title: 'How We Grow Aga...',
        NavUrl: '#/growth',
        Section: 'recent',
        AvatarUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=100&q=80',
        OrderNumber: 2
      },
      {
        Title: 'All Employees',
        NavUrl: '#/all-employees',
        Section: 'recent',
        AvatarUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=100&q=80',
        OrderNumber: 3
      },
      {
        Title: 'Improving Our Empl...',
        NavUrl: '#/experience',
        Section: 'recent',
        AvatarUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=100&q=80',
        OrderNumber: 4
      },

      // Rail Top items
      { Title: 'Home', NavUrl: '/', Section: 'rail-top', IconName: 'Home', OrderNumber: 1 },
      { Title: 'People', NavUrl: '#/people', Section: 'rail-top', IconName: 'People', OrderNumber: 2 },
      { Title: 'Recognition', NavUrl: '#/recognition', Section: 'rail-top', IconName: 'Wave', OrderNumber: 3 },
      { Title: 'Bookmarks', NavUrl: '#/bookmarks', Section: 'rail-top', IconName: 'Bookmark', OrderNumber: 4 },
      { Title: 'Explore', NavUrl: '#/explore', Section: 'rail-top', IconName: 'Compass', OrderNumber: 5 },

      // Rail Bottom items
      { Title: 'Analytics', NavUrl: '#/analytics', Section: 'rail-bottom', IconName: 'Analytics', OrderNumber: 1 },
      { Title: 'Trending', NavUrl: '#/trending', Section: 'rail-bottom', IconName: 'Trending', OrderNumber: 2 },
      { Title: 'Settings', NavUrl: '#/settings', Section: 'rail-bottom', IconName: 'Settings', OrderNumber: 3 }
    ];

    for (const item of initialItems) {
      try {
        await list.items.add(item);
      } catch (err) {
        console.warn('[GlobalNavService] Could not add seed item:', item.Title, err);
      }
    }
  }

  /**
   * Retrieves navigation data from SharePoint or falls back to mock data.
   */
  public async getNavigationData(): Promise<{
    sections: INavSection[];
    railTopItems: INavItem[];
    railBottomItems: INavItem[];
  }> {
    try {
      await this.ensureNavigationList();

      const list = this.sp.web.lists.getByTitle(GLOBAL_NAVIGATION_LIST);
      const items: IGlobalNavDbItem[] = await list.items.select(
        'Id',
        'Title',
        'NavUrl',
        'Section',
        'ParentTitle',
        'IconName',
        'AvatarUrl',
        'OrderNumber',
        'HasChildren',
        'OpenInNewTab'
      )();

      if (!items || items.length === 0) {
        return {
          sections: mockNavSections,
          railTopItems: mockRailTopItems,
          railBottomItems: mockRailBottomItems
        };
      }

      const mapItem = (it: IGlobalNavDbItem): INavItem => ({
        id: String(it.Id || it.Title),
        title: it.Title,
        url: it.NavUrl || '#',
        iconName: it.IconName,
        avatarUrl: it.AvatarUrl,
        hasChildren: !!it.HasChildren,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        category: (it.Section as any) || 'primary',
        orderNumber: it.OrderNumber || 0
      });

      const sortByOrder = (a: INavItem, b: INavItem): number => (a.orderNumber || 0) - (b.orderNumber || 0);

      const railTop = items.filter(i => i.Section === 'rail-top').map(mapItem).sort(sortByOrder);
      const railBottom = items.filter(i => i.Section === 'rail-bottom').map(mapItem).sort(sortByOrder);

      const primaryItems = items.filter(i => !i.Section || i.Section === 'primary').map(mapItem).sort(sortByOrder);
      const exploreItems = items.filter(i => i.Section === 'explore').map(mapItem).sort(sortByOrder);
      const recentItems = items.filter(i => i.Section === 'recent').map(mapItem).sort(sortByOrder);

      const sections: INavSection[] = [
        {
          id: 'primary',
          title: '',
          collapsible: false,
          items: primaryItems.length > 0 ? primaryItems : mockNavSections[0].items
        },
        {
          id: 'explore',
          title: 'Explore',
          collapsible: true,
          isExpanded: true,
          items: exploreItems.length > 0 ? exploreItems : mockNavSections[1].items
        },
        {
          id: 'recent',
          title: 'Recently visited',
          collapsible: true,
          isExpanded: true,
          items: recentItems.length > 0 ? recentItems : mockNavSections[2].items
        }
      ];

      return {
        sections,
        railTopItems: railTop.length > 0 ? railTop : mockRailTopItems,
        railBottomItems: railBottom.length > 0 ? railBottom : mockRailBottomItems
      };
    } catch (e) {
      console.warn('[GlobalNavService] Using fallback mock data:', e);
      return {
        sections: mockNavSections,
        railTopItems: mockRailTopItems,
        railBottomItems: mockRailBottomItems
      };
    }
  }
}
