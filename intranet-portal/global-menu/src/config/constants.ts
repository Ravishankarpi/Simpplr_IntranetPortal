export const GLOBAL_NAVIGATION_LIST = "GlobalNavigationConfig";
export const domain = process.env.DOMAIN;//|| "https://sr7lt.sharepoint.com";
export const siteName = process.env.SITE_NAME;// || "newww";
export const ROOT_SITE_URL = `${domain}/sites/${siteName}`;// Empty string implies the current site collection root. Can be configured.
export const ENABLE_GLOBAL_ACROSS_TENANT = false;//process.env.ENABLE_GLOBAL_NAVIGATION_ACROSS_TENANT;  // When false, the extension only loads on ROOT_SITE_URL;
export const ENABLE_GLOBAL_SCSS_ACROSS_TENANT = false;//process.env.ENABLE_GLOBAL_SCSS_ACROSS_TENANT;

export const THEME_CONFIG = {};