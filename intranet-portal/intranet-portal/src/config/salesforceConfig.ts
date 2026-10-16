export interface IDateFilterConfig {
  key: string;
  text: string;
  days: number | null; // null represents all days
}

export const salesforceConfig = {
  oauthDomain: "https://ornlfcu.my.salesforce.com",
  apiUrl: "https://ornlfcu.my.salesforce.com",
  clientId: "3MVG9mclR62wycM0GDu7g08q6iYAERIVgD9bzEQp4rsNTaIoqehKRv9TInyIup2GD9.g3vby1fd0iLP_1cObr",
  clientSecret: "ED63BF292022ADF516CC81DC24AEBA0A3F063835689806C1A67F280EBCBF8C82",
  sharePointSiteUrl: "https://sr7lt.sharepoint.com/sites/newww",
  defaultDateFilter: "30",
  corsProxyUrl: "http://localhost:8010/?url=",
  dateFilterOptions: [
    { key: "all", text: "All Days", days: null },
    { key: "90", text: "Last 90 Days", days: 90 },
    { key: "60", text: "Last 60 Days", days: 60 },
    { key: "30", text: "Last 30 Days", days: 30 }
  ] as IDateFilterConfig[]
};

