import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/fields";
import "@pnp/sp/views";
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { INavItem } from "./navigationConfig";

const LIST_NAME = "GlobalNavigationConfig";

export const NavigationService = {

  ensureNavigationList: async (context: WebPartContext): Promise<void> => {
    const sp = spfi().using(SPFx(context));
    try {
      // Check if list exists
      const list = sp.web.lists.getByTitle(LIST_NAME);
      await list.select("Title")();
      console.log(`${LIST_NAME} list exists.`);
    } catch (e) {
      console.log(`${LIST_NAME} does not exist. Creating...`);
      try {
        await sp.web.lists.add(LIST_NAME, "Stores global navigation configuration.", 100);
        const newList = sp.web.lists.getByTitle(LIST_NAME);

        // Add columns
        await newList.fields.addText("NavUrl", { MaxLength: 255 });
        await newList.fields.addText("ParentTitle", { MaxLength: 255 });
        await newList.fields.addBoolean("OpenInNewTab");

        // Add to default view
        const view = await newList.defaultView;
        await view.fields.add("NavUrl");
        await view.fields.add("ParentTitle");
        await view.fields.add("OpenInNewTab");

        // Seed sample data based on reference image
        const sampleItems = [
          { Title: "Home", NavUrl: "sites/sitename#home", ParentTitle: null, OpenInNewTab: false },
          { Title: "Feed", NavUrl: "sites/sitename#feed", ParentTitle: null, OpenInNewTab: false },
          { Title: "Sites", NavUrl: null, ParentTitle: null, OpenInNewTab: false },
          { Title: "People", NavUrl: "sites/sitename#people", ParentTitle: null, OpenInNewTab: false },
          { Title: "Apps", NavUrl: "sites/sitename#apps", ParentTitle: null, OpenInNewTab: false },

          // Sites Submenu
          { Title: "Resources Library", NavUrl: "sites/sitename#resources", ParentTitle: "Sites", OpenInNewTab: false },
          { Title: "Employee Engagement", NavUrl: "sites/sitename#engagement", ParentTitle: "Sites", OpenInNewTab: false },
          { Title: "Marketing", NavUrl: "sites/sitename#marketing", ParentTitle: "Sites", OpenInNewTab: false },
          { Title: "All sites", NavUrl: "sites/sitename#allsites", ParentTitle: "Sites", OpenInNewTab: false },

          // Department Submenu
          { Title: "Department", NavUrl: null, ParentTitle: "Sites", OpenInNewTab: false },
          { Title: "Human Resources (HR)", NavUrl: "sites/sitename#hr", ParentTitle: "Department", OpenInNewTab: false },
          { Title: "IT", NavUrl: "sites/sitename#it", ParentTitle: "Department", OpenInNewTab: false },
          { Title: "Project Management", NavUrl: "sites/sitename#pm", ParentTitle: "Department", OpenInNewTab: false },
          { Title: "Training", NavUrl: "sites/sitename#training", ParentTitle: "Department", OpenInNewTab: false }
        ];

        for (const item of sampleItems) {
          await newList.items.add(item);
        }
        console.log(`Successfully seeded ${LIST_NAME} list.`);

      } catch (err) {
        console.error("Error creating navigation list", err);
      }
    }
  },

  getNavigationItems: async (context: WebPartContext): Promise<INavItem[]> => {
    const sp = spfi().using(SPFx(context));
    try {
      const items: any[] = await sp.web.lists.getByTitle(LIST_NAME).items.select("Id", "Title", "NavUrl", "ParentTitle", "OpenInNewTab")();

      // Build the tree structure
      const navMap = new Map<string, INavItem>();
      const rootItems: INavItem[] = [];

      // First pass: create all objects
      items.forEach(item => {
        navMap.set(item.Title, {
          title: item.Title,
          url: item.NavUrl,
          openInNewTab: item.OpenInNewTab,
          subNav: []
        });
      });

      // Second pass: link parents to children
      items.forEach(item => {
        const navItem = navMap.get(item.Title)!;
        if (item.ParentTitle && navMap.has(item.ParentTitle)) {
          const parent = navMap.get(item.ParentTitle)!;
          parent.subNav!.push(navItem);
        } else {
          rootItems.push(navItem);
        }
      });

      return rootItems;
    } catch (e) {
      console.error("Error fetching navigation items", e);
      return [];
    }
  }
};
