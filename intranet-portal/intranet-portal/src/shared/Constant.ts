export const Constants = {
  PromotedState: [0, 1, 2] // 1: Promoted as News, 2: Published as News
};
let env = "PROD";
let domain = "https://ornlfcu.sharepoint.com";
let siteName = "simpplr-dev";

if (env == "DEV") {
  domain = "https://sr7lt.sharepoint.com";
  siteName = "newww";
} else if (env == "PROD") {
  domain = "https://ornlfcu.sharepoint.com";
  siteName = "simpplr-dev";
}
export const ROOT_SITE_URL = `${domain}/sites/${siteName}`;// Empty string implies the current site collection root. Can be configured.

export const THEME_CONFIG = {};
