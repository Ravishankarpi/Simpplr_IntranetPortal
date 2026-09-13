export interface IGlobalNavigationItem {
  Id: number;
  Title: string;
  NavUrl: string;
  ParentTitle: string;
  OpenInNewTab: boolean;
  Description?: string;
  Image?: string;
  OrderNumber?: number;
}

export interface INavMenuItem extends IGlobalNavigationItem {
  children: INavMenuItem[];
}

export function getImageUrl(imageStr?: string): string | undefined {
  if (!imageStr) return undefined;
  try {
    const imgObj = JSON.parse(imageStr);
    if (imgObj && imgObj.serverRelativeUrl) {
      return (imgObj.serverUrl || '') + imgObj.serverRelativeUrl;
    }
  } catch (e) {
    if (imageStr.startsWith('http') || imageStr.startsWith('/')) {
      return imageStr;
    }
  }
  return undefined;
}
