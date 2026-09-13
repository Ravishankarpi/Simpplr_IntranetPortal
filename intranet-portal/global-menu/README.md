# SharePoint Global Menu Application Customizer

## 1. Project Purpose
This Application Customizer provides a global header and navigation menu across the SharePoint site collection. It displays a responsive global navigation hierarchy with a nested submenu search and provides a mock UI for global search integration. 

## 2. Architecture
The solution uses the SPFx Application Customizer to inject a React component (`GlobalHeader`) into the `Top` placeholder of modern SharePoint pages. The navigation data is fetched dynamically from a centralized SharePoint list via PnPjs. 

## 3. Technologies
- SharePoint Framework (SPFx) Application Customizer
- React & ReactDOM
- TypeScript
- Fluent UI React (components like SearchBox, ContextualMenu, Callout, Tooltip)
- PnPjs for SharePoint data access

## 4. Folder Structure
- `src/extensions/globalMenu/GlobalMenuApplicationCustomizer.ts`: Entry point.
- `src/components/`: React components (`GlobalHeader`, `GlobalNavigation`, `GlobalSearch`, etc.).
- `src/config/constants.ts`: Global configuration variables.
- `src/models/`: TypeScript interfaces.
- `src/services/`: `GlobalNavigationService.ts` for PnPjs calls.
- `src/styles/`: SCSS styling module.

## Prerequisites

- SharePoint Online tenant
- Node.js version 18.x (Required for SPFx 1.20.0)
- `gulp-cli` globally installed
- A `.env` file in the root of the project to set up the target environment variables.

## Getting Started

1. Clone the repository.
2. Run `npm install` to restore dependencies.
3. Create a `.env` file in the root directory (next to `package.json`) and configure your target domain and site:
   ```env
   DOMAIN=https://yourtenant.sharepoint.com
   SITE_NAME=yoursitename
   ENABLE_GLOBAL_NAVIGATION_ACROSS_TENANT=true
   ENABLE_GLOBAL_SCSS_ACROSS_TENANT=true
   ```
4. Run `gulp serve --nobrowser` to test the extension locally using the SPFx workbench or your live site query strings.
5. Run `gulp bundle --ship` and `gulp package-solution --ship` to build the `.sppkg` file for production deployment.

## SharePoint List Configuration

The application customizer expects a list named **GlobalNavigationConfig** on the root site defined by your `.env` file. 

**Auto-Creation:** If this list does not exist on the root site, the extension will automatically attempt to create it with the correct schema upon the first load!

**List Schema:**
- **Title**: Standard SharePoint Title column (Used as the text for the navigation link).
- **NavUrl**: Single line of text (The target URL for the link).
- **ParentTitle**: Single line of text (The `Title` of the parent node. Leave blank for root-level items).
- **OpenInNewTab**: Yes/No boolean column.
- **Description**: Multiple lines of text (Optional description).
- **Image**: Thumbnail column (Allows uploading images which are stored as list item attachments).
- **OrderNumber**: Number column (Used to sort items in ascending order. If missing, items fall back to alphabetical sorting by Title).

The hierarchy is built recursively by matching `ParentTitle` with the `Title` of other items. There is no hardcoded limit on nesting.

## 8. Nested Submenu Behavior
Opening a top-level menu displays its children. If a child has children, clicking it expands its nested items below it in an accordion style or standard dropdown format.

## 9. Submenu Search
A search input is available in submenus that have children. It filters the currently loaded navigation items (case-insensitive on Title) and their children immediately, showing "No results found" if nothing matches.

## 10. Site Name / Logo
The left side of the header retrieves the current site's title and logo URL dynamically from the SPFx context (`context.pageContext.web`). If no logo is found, it falls back to a Fluent UI Persona.

## 11. Global Search UI
A Global Search box is rendered on the right side. Clicking it opens a Search Panel callout. Currently, this implements only the UI frontend.

## 12. Recent Searches
The search panel includes a "Recent Searches" section for quick access. This is currently using mock data and prepared for future state/model implementation.

## 13. Search Suggestions
The search panel also includes "Suggested" items. Currently mock data, with the UI structured to connect to a backend API later.

## 14. Future Search Implementation
The search logic is isolated in the UI. A future implementation can utilize PnPjs to run SharePoint search queries scoped to the site collection, hydrate the recent searches, and retrieve search suggestions.

## 15. Site Collection Scope
This extension belongs to one site collection. It is designed to work on the parent site and its subsites but always fetches navigation from the root site.

## 16. Parent/Root Site Configuration
The `GlobalNavigationConfig` list name and `ROOT_SITE_URL` are defined in `src/config/constants.ts`. If `ROOT_SITE_URL` is left empty, it defaults to `context.pageContext.site.absoluteUrl`.

## 17. Local Development
Run `gulp serve` to test locally using the SharePoint workbench.

## 18. Build/Package
Run `gulp bundle --ship` and `gulp package-solution --ship` to create the `.sppkg` file.

## 19. Deployment
Upload the generated `.sppkg` to the SharePoint App Catalog and deploy it.

## 20. Application Customizer Registration
The extension is registered to the Site Collection via `ClientSideInstance.xml` or during deployment prompts.

## 21. Required Permissions
Ensure users have Read access to the `GlobalNavigationConfig` list on the root site.

## 22. Troubleshooting
- If menus do not load, verify the list exists and the user has permissions.
- If styling looks incorrect, verify the Fluent UI theme overrides.

## 23. Known Limitations
- Global Search currently uses mock data.
- Does not automatically create the SharePoint list on deployment.
