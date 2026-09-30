Act as a Senior Microsoft SharePoint Framework (SPFx) Developer and React UI Engineer.

I already have an existing SPFx solution/repository with other web parts and functionality.

IMPORTANT:
- Do NOT modify, remove, rename, refactor, or break any existing web parts.
- Do NOT change existing business logic.
- Do NOT modify existing UI components unless absolutely required for dependency installation.
- Add a completely NEW SPFx web part named:

oneCarousel

The new web part must be implemented inside the existing SPFx solution.

--------------------------------------------------
1. OBJECTIVE
--------------------------------------------------

Create a new React-based SPFx web part called:

oneCarousel

This web part will initially use MOCK DATA.

Later, the data source will be changed to SharePoint Site Pages.

For now, DO NOT implement SharePoint Site Pages integration.

Focus only on:
- UI
- responsive layout
- carousel behavior
- mock data
- component structure
- Material UI implementation

--------------------------------------------------
2. REFERENCE UI
--------------------------------------------------

Use the attached reference image as the exact visual inspiration.

The UI should closely reproduce the following characteristics:

- Horizontal carousel
- White/light page background
- Card-based layout
- Large image at the top of each card
- White content area below the image
- Bold black title
- Smaller "In [Category]" text
- Category should appear as blue clickable-looking text
- Left/right carousel navigation buttons
- Clean Microsoft/SharePoint-style corporate design
- Rounded card corners
- Very subtle borders/shadows
- Proper spacing between cards
- Image should cover the image area without distortion

Do NOT create a completely different design.

The reference image should be treated as the primary UI/UX reference.

--------------------------------------------------
3. UI LIBRARY
--------------------------------------------------

Use MATERIAL UI (MUI).

Do NOT use Fluent UI for this new web part.

Use Material UI components wherever practical.

Preferred components include:

- Card
- CardMedia
- CardContent
- Typography
- IconButton
- Box
- Stack
- Container

For carousel icons use Material UI icons such as:

ChevronLeft
ChevronRight

Install only the required Material UI packages if they are not already available in the existing solution.

For example:

@mui/material
@mui/icons-material

IMPORTANT:
Before installing packages, inspect the existing package.json.

Make sure the selected MUI version is compatible with the existing SPFx / React / TypeScript versions.

Do NOT upgrade SPFx, React, Node, TypeScript, or other existing project dependencies unnecessarily.

--------------------------------------------------
4. WEB PART NAME
--------------------------------------------------

Create:

oneCarousel

Expected structure should follow the existing SPFx solution conventions.

For example:

src/webparts/oneCarousel/

with appropriate files such as:

OneCarouselWebPart.ts
components/
  OneCarousel.tsx
  IOneCarouselProps.ts
  oneCarousel.module.scss

Follow the existing project's naming and folder conventions if they differ.

--------------------------------------------------
5. CAROUSEL LAYOUT
--------------------------------------------------

The carousel must display THREE content cards at a time.

However, the layout is NOT three equal cards.

Use a 2:1:1 layout.

Meaning:

CARD 1 = 2 units wide
CARD 2 = 1 unit wide
CARD 3 = 1 unit wide

Example:

┌────────────────────────────┬──────────────┬──────────────┐
│                            │              │              │
│          ITEM 1            │    ITEM 2    │    ITEM 3    │
│                            │              │              │
│       2x width             │    1x        │    1x        │
│                            │              │              │
└────────────────────────────┴──────────────┴──────────────┘

Total layout:

2 : 1 : 1

The first card must visually occupy approximately twice the width of each of the other two cards.

The cards should have consistent height.

--------------------------------------------------
6. CAROUSEL PAGINATION BEHAVIOR
--------------------------------------------------

Use sequential groups of THREE items.

Example mock data:

Item 1
Item 2
Item 3
Item 4
Item 5
Item 6
Item 7
Item 8
Item 9

Initial view:

┌────────────── Item 1 ──────────────┬── Item 2 ──┬── Item 3 ──┐
│                                   │            │            │
│              2x                   │     1x     │     1x     │
│                                   │            │            │
└───────────────────────────────────┴────────────┴────────────┘

When user clicks NEXT:

Show:

Item 4
Item 5
Item 6

Layout again:

┌────────────── Item 4 ──────────────┬── Item 5 ──┬── Item 6 ──┐

When user clicks NEXT again:

Show:

Item 7
Item 8
Item 9

Layout:

┌────────────── Item 7 ──────────────┬── Item 8 ──┬── Item 9 ──┐

NEXT should move by exactly 3 items.

Do NOT implement a one-item-at-a-time sliding carousel.

The behavior must be:

Page 1 = [1,2,3]
Page 2 = [4,5,6]
Page 3 = [7,8,9]

--------------------------------------------------
7. PREVIOUS / NEXT BUTTONS
--------------------------------------------------

Provide left and right navigation controls.

Example:

<                         >

Use Material UI IconButton.

The navigation buttons should visually resemble the reference image:

- Semi-transparent/light blue/gray background
- White or appropriate contrasting arrow icon
- Positioned vertically around the middle of the carousel
- Left button on the left edge
- Right button on the right edge

Do not make the navigation buttons visually dominant.

Behavior:

Initial state:
Previous = disabled
Next = enabled

After clicking Next:
Previous = enabled

At final page:
Next = disabled

For example:

Page 1:
[disabled Previous] [Next]

Page 2:
[Previous] [Next]

Page 3:
[Previous] [disabled Next]

--------------------------------------------------
8. INCOMPLETE LAST PAGE
--------------------------------------------------

Design the component so it safely handles a number of items that is not divisible by 3.

Example:

10 items:

Page 1:
1,2,3

Page 2:
4,5,6

Page 3:
7,8,9

Page 4:
10

Do not crash or produce layout errors.

For missing cards, use an appropriate empty space or responsive handling.

The primary mock data should contain at least 9 items so that the three-page behavior can be demonstrated.

--------------------------------------------------
9. CARD DESIGN
--------------------------------------------------

Each card should contain:

1. Image
2. Title
3. Category/location/context text

Example:

Image

New employee onboarding survey

In Corporate Communication

The title should be:

- bold
- black/dark
- approximately 20–24px depending on available width
- responsive
- allowed to wrap naturally

Category should be:

"In "

followed by a blue text value.

Example:

In Corporate Communication

Where:

"In" = normal dark text

"Corporate Communication" = blue

--------------------------------------------------
10. IMAGE HANDLING
--------------------------------------------------

Use mock image URLs for now.

Use realistic corporate images similar to the reference:

- employee onboarding
- coffee / employee experience
- city / workplace
- collaboration
- technology
- office
- meeting
- team
- business

Images should:

- fill the image area
- use object-fit: cover
- maintain consistent image height
- not distort
- work with different image dimensions

Create mock data in a dedicated TypeScript data structure.

Example concept:

const mockCarouselItems = [
  {
    id: 1,
    title: "New employee onboarding survey",
    category: "Corporate Communication",
    imageUrl: "..."
  },
  {
    id: 2,
    title: "Improving our employee experience",
    category: "San Francisco",
    imageUrl: "..."
  },
  ...
];

Do not hard-code the card HTML individually.

Render cards using map().

--------------------------------------------------
11. RESPONSIVE DESIGN
--------------------------------------------------

Desktop:

Use the required:

2 : 1 : 1

layout.

Tablet:

Adapt the layout gracefully.

Mobile:

Do not force the 2:1:1 desktop layout if it becomes unusable.

On small screens, cards may become:

1 column

or an appropriate mobile carousel.

The UI must remain usable.

The primary target is SharePoint desktop experience.

--------------------------------------------------
12. WEB PART PROPERTY
--------------------------------------------------

Create the standard SPFx web part structure.

The web part should render:

OneCarousel

Use proper React props.

Keep the component reusable.

For example:

IOneCarouselProps

should contain only the properties currently required.

Do not introduce unnecessary configuration options.

--------------------------------------------------
13. CONFIG.JSON
--------------------------------------------------

Inspect the existing project structure and identify the correct existing:

config.json

that needs to be updated for this new web part.

Update it only where required for the new oneCarousel web part.

IMPORTANT:

- Do not overwrite unrelated configuration.
- Preserve existing configuration.
- Do not remove existing entries.
- Do not modify configurations belonging to other web parts.
- Follow the existing SPFx solution's configuration pattern.

If the project contains a web part-specific config.json, update that appropriately.

If no config.json change is technically required for the current SPFx version/project structure, do not invent unnecessary configuration. Explain what was checked.

--------------------------------------------------
14. EXISTING SOLUTION SAFETY
--------------------------------------------------

This is extremely important.

Before making changes:

1. Inspect the existing project.
2. Identify:
   - SPFx version
   - React version
   - TypeScript version
   - package.json
   - existing web parts
   - existing config files
   - existing build configuration

3. Follow the existing project conventions.

Do NOT upgrade the project.

Do NOT migrate the project to a newer SPFx version.

Do NOT replace existing Fluent UI usage in existing web parts.

Only this NEW oneCarousel web part should use Material UI.

--------------------------------------------------
15. FUTURE DATA SOURCE
--------------------------------------------------

For this implementation, use MOCK DATA ONLY.

Do NOT connect to SharePoint Site Pages yet.

However, structure the data model so that later it can easily be replaced with SharePoint Site Pages data.

For example:

interface ICarouselItem {
    id: string | number;
    title: string;
    category: string;
    imageUrl: string;
    url?: string;
}

Later these values will come from Site Pages.

Keep this separation:

Mock Data
    ↓
Carousel Component
    ↓
UI

Later:

SharePoint Site Pages
    ↓
Data Mapping
    ↓
Carousel Component
    ↓
UI

--------------------------------------------------
16. CLICK BEHAVIOR
--------------------------------------------------

For now, clicking a card can either:

- be non-functional
OR
- use a mock URL

Prefer making the card clickable if the existing UI pattern supports it.

Do not implement SharePoint navigation/business logic yet.

--------------------------------------------------
17. ACCESSIBILITY
--------------------------------------------------

Implement basic accessibility:

- aria-label for Previous button
- aria-label for Next button
- meaningful alt text for images
- keyboard accessible buttons
- disabled state for navigation buttons

--------------------------------------------------
18. CODE QUALITY
--------------------------------------------------

Use clean React/TypeScript.

Avoid:

- unnecessary state
- duplicated JSX
- hard-coded card markup
- unnecessary dependencies
- inline styling everywhere

Prefer:

- reusable components
- typed interfaces
- CSS/SCSS or MUI styling consistently
- clean state management

The main carousel state can simply be:

currentPage

Calculate:

startIndex = currentPage * 3

visibleItems = mockCarouselItems.slice(startIndex, startIndex + 3)

Then render those three items using the 2:1:1 layout.

--------------------------------------------------
19. EXPECTED FILES
--------------------------------------------------

Create the required files for the new web part, following the existing project's conventions.

Expected conceptual structure:

src/
  webparts/
    oneCarousel/
      OneCarouselWebPart.ts
      components/
        OneCarousel.tsx
        IOneCarouselProps.ts
      oneCarousel.module.scss

Do not blindly create files if the existing project follows a different SPFx structure. Follow the existing structure.

--------------------------------------------------
20. ACCEPTANCE CRITERIA
--------------------------------------------------

The implementation is complete only when all of the following are true:

[ ] Existing web parts continue working.

[ ] New web part is named oneCarousel.

[ ] oneCarousel appears correctly in the SPFx web part toolbox.

[ ] Material UI is used for the new web part.

[ ] Fluent UI is NOT used for the new web part.

[ ] UI closely matches the supplied reference image.

[ ] Three items are displayed per page.

[ ] Layout is 2:1:1.

[ ] First card occupies approximately twice the width of cards 2 and 3.

[ ] Initial page shows:
    Item 1
    Item 2
    Item 3

[ ] Next shows:
    Item 4
    Item 5
    Item 6

[ ] Next shows:
    Item 7
    Item 8
    Item 9

[ ] Previous navigates back by exactly 3 items.

[ ] Next is disabled on the last page.

[ ] Previous is disabled on the first page.

[ ] Mock data is used.

[ ] No SharePoint Site Pages API integration is implemented yet.

[ ] Images use object-fit: cover.

[ ] Card titles and category text match the reference visual style.

[ ] Responsive behavior works.

[ ] Basic accessibility is implemented.

[ ] Existing project dependencies are not unnecessarily upgraded.

[ ] Existing web parts/configuration are not broken.

[ ] Relevant config.json is updated only where required.

--------------------------------------------------
21. FINAL OUTPUT
--------------------------------------------------

Before implementing oneCarousel, inspect and understand the existing:

1. Constants.ts
2. pnpjsConfig.ts

Specifically, check for:

- ROOT_SITE_URL
- Existing PnPjs configuration
- Existing SPFx context initialization
- Existing SharePoint site URL configuration
- Existing PnPjs/SPFI instance
- Existing reusable SharePoint service/helper methods

After implementation:

1. Show me the files created/modified.
2. Explain what was changed.
3. Show the package dependencies added.
4. Explain the carousel pagination logic.
5. Explain any config.json changes.
6. Explain how the mock data is structured.
7. Run the appropriate SPFx validation/build/lint commands available in the project.
8. Fix any TypeScript/build errors introduced by this implementation.
9. Do not modify unrelated existing code to hide errors.
10. Clearly mention if an existing project issue prevents successful build.

Do not implement Site Pages integration yet.

The immediate goal is:

EXISTING SPFX SOLUTION
        ↓
ADD NEW WEB PART
        ↓
oneCarousel
        ↓
Material UI
        ↓
Mock Data
        ↓
2 : 1 : 1 Card Layout
        ↓
3 Items Per Page
        ↓
Next = +3 Items
        ↓
Previous = -3 Items