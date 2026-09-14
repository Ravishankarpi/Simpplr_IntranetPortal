import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFI, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/sites";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/search";
import "@pnp/sp/site-groups";

let _sp: SPFI;

export const getSP = (context?: WebPartContext): SPFI => {
  if (context != null) {
    _sp = spfi().using(SPFx(context));
  }
  return _sp;
};
