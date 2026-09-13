import { SPFI, spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/fields";
import "@pnp/sp/views";
import { IGlobalNavigationItem, INavMenuItem } from "../models/IGlobalNavigationItem";
import { GLOBAL_NAVIGATION_LIST, ROOT_SITE_URL } from "../config/constants";
import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";

export class GlobalNavigationService {
  private sp: SPFI;

  constructor(context: ApplicationCustomizerContext) {
    this.sp = spfi(ROOT_SITE_URL || context.pageContext.site.absoluteUrl).using(SPFx(context));
  }

  public async getRootWebInfo(): Promise<{ Title: string; SiteLogoUrl: string | null }> {
    try {
      const web = await this.sp.web.select("Title", "SiteLogoUrl")();
      return { Title: web.Title, SiteLogoUrl: web.SiteLogoUrl };
    } catch (e) {
      console.error("Failed to load root web info", e);
      return { Title: "", SiteLogoUrl: "" };
    }
  }

  private async ensureNavigationList(): Promise<void> {
    try {
      const ensureResult = await this.sp.web.lists.ensure(GLOBAL_NAVIGATION_LIST, "Global Navigation Configuration", 100);
      const list = ensureResult.list;

      // Helper to safely add fields and ignore errors if they already exist
      const addFieldSafe = async (operation: Promise<any>) => {
        try { await operation; } catch (e) { /* ignore */ }
      };

      await addFieldSafe(list.fields.addText("NavUrl"));
      await addFieldSafe(list.fields.addText("ParentTitle"));
      await addFieldSafe(list.fields.addBoolean("OpenInNewTab"));
      await addFieldSafe(list.fields.addMultilineText("Description"));
      await addFieldSafe(list.fields.addNumber("OrderNumber"));

      try {
        await list.fields.createFieldAsXml('<Field Type="Thumbnail" DisplayName="Image" Name="Image" />');
      } catch (e) { /* ignore */ }

      // Add fields to default view safely
      try {
        const view = await list.defaultView;
        await addFieldSafe(view.fields.add("NavUrl"));
        await addFieldSafe(view.fields.add("ParentTitle"));
        await addFieldSafe(view.fields.add("OrderNumber"));
      } catch (e) { /* ignore */ }

      console.log(`[GlobalMenu] List fields ensured: ${GLOBAL_NAVIGATION_LIST}`);
    } catch (e) {
      console.error("[GlobalMenu] Failed to ensure navigation list", e);
    }
  }

  public async getNavigationItems(): Promise<INavMenuItem[]> {
    try {
      let list = this.sp.web.lists.getByTitle(GLOBAL_NAVIGATION_LIST);
      let listId: string;

      try {
        const listInfo = await list.select("Id")();
        listId = listInfo.Id;
      } catch (err: any) {
        // If list doesn't exist (404), ensure it is created
        if (err?.message?.includes("404") || err?.status === 404) {
          console.log(`[GlobalMenu] List not found. Attempting to create ${GLOBAL_NAVIGATION_LIST}...`);
          await this.ensureNavigationList();

          // Re-fetch after creation
          list = this.sp.web.lists.getByTitle(GLOBAL_NAVIGATION_LIST);
          const listInfo = await list.select("Id")();
          listId = listInfo.Id;
        } else {
          throw err;
        }
      }

      let items: IGlobalNavigationItem[] = await list
        .items.select("Id", "Title", "NavUrl", "ParentTitle", "OpenInNewTab", "Description", "Image", "OrderNumber")();

      // Fix image URLs for SharePoint modern image columns
      items = items.map(item => {
        if (item.Image) {
          try {
            const imgObj = JSON.parse(item.Image);
            if (imgObj && imgObj.fileName && !imgObj.serverRelativeUrl) {
              const rootUrl = ROOT_SITE_URL;
              const urlObj = new URL(rootUrl);
              imgObj.serverUrl = urlObj.origin;

              // Ensure no trailing slash on pathname
              const basePath = urlObj.pathname.replace(/\/$/, "");

              // Handle Thumbnail columns that fallback to list item attachments
              if (imgObj.fileName.startsWith("Reserved_ImageAttachment_")) {
                imgObj.serverRelativeUrl = `${basePath}/Lists/${GLOBAL_NAVIGATION_LIST}/Attachments/${item.Id}/${imgObj.fileName}`;
              } else {
                imgObj.serverRelativeUrl = `${basePath}/SiteAssets/Lists/${listId}/${imgObj.fileName}`;
              }

              item.Image = JSON.stringify(imgObj);
            }
          } catch (e) {
            // ignore
          }
        }
        return item;
      });

      return this.buildHierarchy(items);
    } catch (error) {
      console.error("Error fetching global navigation:", error);
      return [];
    }
  }

  private buildHierarchy(items: IGlobalNavigationItem[]): INavMenuItem[] {
    const itemMap = new Map<string, INavMenuItem>();
    const rootItems: INavMenuItem[] = [];

    // First pass: create node for each item
    items.forEach(item => {
      itemMap.set(item.Title, { ...item, children: [] });
    });

    // Second pass: attach children to parents
    items.forEach(item => {
      const node = itemMap.get(item.Title);
      if (node) {
        if (item.ParentTitle && itemMap.has(item.ParentTitle)) {
          const parent = itemMap.get(item.ParentTitle);
          parent?.children.push(node);
        } else {
          // If no parent or parent not found, it's a root item
          rootItems.push(node);
        }
      }
    });

    // Sort function: OrderNumber ascending, then Title ascending
    const sortNodes = (a: INavMenuItem, b: INavMenuItem) => {
      // Parse float just in case it's a string from SharePoint
      const parsedA = parseFloat(a.OrderNumber as any);
      const parsedB = parseFloat(b.OrderNumber as any);

      const orderA = !isNaN(parsedA) ? parsedA : Number.MAX_VALUE;
      const orderB = !isNaN(parsedB) ? parsedB : Number.MAX_VALUE;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      // Fallback to alphabetical sorting by Title
      const titleA = (a.Title || "").trim();
      const titleB = (b.Title || "").trim();
      return titleA.localeCompare(titleB);
    };

    // Third pass: sort all children arrays
    itemMap.forEach(node => {
      if (node.children.length > 0) {
        node.children.sort(sortNodes);
      }
    });

    // Sort root items
    rootItems.sort(sortNodes);

    return rootItems;
  }
}
