Create a new component named "personalizedCompanyNews" inside the existing Simpplr SPFx web part. Do NOT create a new SPFx web part or change the existing oneCarousel component. Follow the same architecture, coding pattern, PnPjs setup, Constant.ts, ROOT_SITE_URL, pnpjsConfig.ts, property pane logic, and dynamic routing already used in the project.

Create the component under:

src/webparts/simpplr/components/personalizedCompanyNews/

Files:
- PersonalizedCompanyNews.tsx
- PersonalizedCompanyNews.module.scss
- mockData.ts

The component should be rendered when the existing Simpplr Web Part Title property is set to:

personalizedCompanyNews

Update SimpplrWebPart.ts to import and route to the new component using the existing normalizedTitle logic. Keep oneCarousel routing completely unchanged.

UI REQUIREMENT:
Use the uploaded screenshot as the exact visual reference for the new component.

The component should look like a compact corporate "Personalized Company News" feed.

Top section:
- Title: "Personalized Company News"
- Below the title, two tabs: "Latest" and "Popular"
- "Latest" should be selected by default.
- Selected tab should have a subtle bottom border/indicator.
- Popular should be muted gray.

Featured news:
- Large full-width image.
- Below the image show small uppercase label "MUST READ".
- Show title: "Employee Incentive Program".
- Below title show: "in Human Resources on Oct 16, 2022".
- "Human Resources" should be blue/clickable.
- Date should be gray.
- Keep the layout and spacing visually close to the screenshot.

Below the featured article, show compact news list items.

Example item 1:
- Thumbnail image on the left.
- Label: "PAGE"
- Title: "Where are we? Progress check-in"
- Metadata: "in CEO Corner on Oct 6, 2022"
- "CEO Corner" should be blue/clickable.

Example item 2:
- Thumbnail image.
- Label: "PAGE"
- Title: "Global Town Hall"
- Metadata: "in All Employees on Oct 6, 2022"
- "All Employees" should be blue/clickable.

Add several additional mock news items so scrolling and the Latest/Popular tabs can be demonstrated.

Use a strongly typed interface in mockData.ts, for example:

export interface IPersonalizedCompanyNewsItem {
    id: string | number;
    title: string;
    category: string;
    contentType: 'MUST READ' | 'PAGE';
    imageUrl: string;
    url?: string;
    date: string;
    isFeatured?: boolean;
}

Create separate mock datasets for Latest and Popular. The tabs should switch between the datasets. No SharePoint API integration is required yet.

IMPORTANT IMAGE REQUIREMENT:
Do not use this broken Unsplash URL:

https://images.unsplash.com/photo-1507992781348-310259076fa0

Use reliable working image URLs suitable for corporate news, employees, meetings, town halls, or office environments.

DESIGN:
- Use the existing project styling approach.
- Material UI v5 can be used because oneCarousel already uses MUI v5.
- Do not introduce Fluent UI.
- Use Segoe UI.
- White background.
- Primary text: #1a1a1a.
- Secondary text: #666666.
- Link blue: #0078d4.
- Border: #e7e7e7.
- Keep the UI clean, compact, professional, and close to the uploaded screenshot.
- Avoid large rounded cards, gradients, excessive shadows, or unnecessary icons.
- Featured image should use object-fit: cover.
- Secondary thumbnails should be approximately 60px x 60px.
- Add subtle hover behavior to clickable news items.

RESPONSIVE:
- Desktop: full-width compact news feed.
- Tablet: reduce spacing/image height appropriately.
- Mobile: single-column layout with no horizontal scrolling.

PROPERTY PANE:
Follow the existing dynamic property pane pattern.

When Title is:

personalizedCompanyNews

show a settings group:

"Personalized Company News Settings"

Add a configurable field:

"News Title"

Default value:

"Personalized Company News"

Keep disableReactivePropertyChanges = false so changing the Title immediately switches the component.

PROPS:
Create an appropriate props interface, for example:

export interface IPersonalizedCompanyNewsProps {
    context: WebPartContext;
    newsTitle?: string;
}

Pass the existing WebPart context from SimpplrWebPart.ts.

IMPORTANT:
Use the existing getSP(this.context) pattern if/when SharePoint integration is needed later. Do not create a new PnPjs configuration. Reuse the existing Constant.ts, ROOT_SITE_URL, and pnpjsConfig.ts patterns already present in the project.

Do not modify oneCarousel UI, behavior, data, routing, or files unless absolutely required for the new component integration.

Do not create another manifest, another Web Part, another config.json, or another PnPjs configuration.

Final expected structure:

src/webparts/simpplr/
    SimpplrWebPart.ts
    SimpplrWebPart.manifest.json
    components/
        oneCarousel/
        personalizedCompanyNews/
            PersonalizedCompanyNews.tsx
            PersonalizedCompanyNews.module.scss
            mockData.ts

The final result should allow:

Title = oneCarousel
→ existing OneCarousel

Title = personalizedCompanyNews
→ new Personalized Company News component matching the uploaded screenshot.