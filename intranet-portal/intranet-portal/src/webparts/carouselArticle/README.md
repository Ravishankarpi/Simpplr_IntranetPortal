# CarouselArticle WebPart Instructions and Prompt

## Purpose
This document stores the instructions and prompts used for the AI to understand and modify the CarouselArticle webpart.

## Instructions / Prompt

**Note:** Add following instruction into webpart CarouselArticle and make the changes

1. **Add Carousel UI:** exactly same as pasted image
2. **Add Property Pane following input like:**
   - Add current slide show count dropdown value 1, 2, 3 for single slide as like pasted image
   - Add Max SitePage shows count in the carousel. (example if i choose current slide show coun 3 and Max SitePage Count is 5 then current slide will be 3 article and if click or auto next then current slide show 2,3, and 4 article then after auto next then current slide show 3,4,5 then auto next 4,5,1 like this way.)
   - Add Another dropdown like Show-> All sites, selected sites as sub site as per below
   - Bring sub sites and nested sub sites based on site Root/Collection
   - sorting dropdown -> recent/latest, popular, or any other option for sorting if available
   - Add input for carousel time.
3. **Item UI:** image bring sitepage banner or any first image, Site name, Title, published at, posted by
4. **Add property pane dropdown like show columns:** banner or first image unselectable like disable, site name unselectable like disable, Title unselectable like disable, published, posted by.
5. **Read selected sites/all sites site pages**

*Later instructions will be provided for latestPopularArticle root site get it from Constant.ts ROOT_SITE_URL*
