import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Dropdown,
  IDropdownOption,
  PrimaryButton,
  DefaultButton,
  Checkbox,
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  SelectionMode,
  ProgressIndicator,
  Spinner,
  SpinnerSize,
  MessageBar,
  MessageBarType,
  TextField,
  Toggle
} from '@fluentui/react';
import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/fields";
import "@pnp/sp/folders";
import "@pnp/sp/files";
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { salesforceConfig } from '../../../config/salesforceConfig';

export interface ISalesforceUrlConversionProps {
  context: WebPartContext;
}

export interface IColumnOption {
  key: string;
  columnName: string;
  targetSpColumnName: string;
  sampleUrl: string;
  selected: boolean;
  useToken: boolean; // false = without token (anonymous), true = with token
}

export const SalesforceUrlConversion: React.FC<ISalesforceUrlConversionProps> = (props) => {
  const [availableLists, setAvailableLists] = useState<IDropdownOption[]>([]);
  const [selectedList, setSelectedList] = useState<string>('');
  const [columns, setColumns] = useState<IColumnOption[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState<boolean>(false);
  const [isLoadingColumns, setIsLoadingColumns] = useState<boolean>(false);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<MessageBarType>(MessageBarType.info);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState<{ current: number; total: number; label: string }>({
    current: 0,
    total: 0,
    label: ''
  });
  const [useProxy, setUseProxy] = useState<boolean>(true);
  const [proxyUrl, setProxyUrl] = useState<string>((salesforceConfig as any).corsProxyUrl || 'http://localhost:8010/?url=');
  const [allAvailableFields, setAllAvailableFields] = useState<IDropdownOption[]>([]);
  const [namingColumns, setNamingColumns] = useState<string[]>([]);
  const [namingDelimiter, setNamingDelimiter] = useState<string>('+');

  const sp = spfi().using(SPFx(props.context));

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 199)]);
  };

  const getSalesforceToken = async (): Promise<string> => {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', salesforceConfig.clientId);
    params.append('client_secret', salesforceConfig.clientSecret);

    const response = await fetch(`${salesforceConfig.oauthDomain}/services/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      throw new Error(`Failed to get Salesforce token: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  };

  // Fetch custom and migration SharePoint lists in the site
  const loadSharePointLists = async () => {
    setIsLoadingLists(true);
    setStatusMessage('Loading SharePoint lists...');
    setMessageType(MessageBarType.info);
    try {
      const allLists = await sp.web.lists.select('Id', 'Title', 'BaseTemplate', 'Hidden')();
      const systemListNames = [
        'appdata', 'appfiles', 'composed looks', 'events', 'master page gallery',
        'microfeed', 'site assets', 'site pages', 'solution gallery', 'taxonomyhiddenlist',
        'theme gallery', 'user information list', 'web template extensions', 'salesforcemigration_auditlog'
      ];

      const filtered = allLists
        .filter(l => !l.Hidden && !systemListNames.includes(l.Title.toLowerCase()))
        .sort((a, b) => a.Title.localeCompare(b.Title));

      const dropdownOpts: IDropdownOption[] = filtered.map(l => ({
        key: l.Title,
        text: l.Title
      }));

      setAvailableLists(dropdownOpts);
      setStatusMessage(`Found ${filtered.length} SharePoint lists.`);
    } catch (err) {
      console.error(err);
      setStatusMessage(`Error loading lists: ${err.message || err}`);
      setMessageType(MessageBarType.error);
    } finally {
      setIsLoadingLists(false);
    }
  };

  useEffect(() => {
    void loadSharePointLists();
  }, []);

  // When a list is selected, fetch columns and sample data
  const handleListChange = async (listTitle: string) => {
    setSelectedList(listTitle);
    setColumns([]);
    if (!listTitle) return;

    setIsLoadingColumns(true);
    setStatusMessage(`Loading columns for "${listTitle}"...`);
    setMessageType(MessageBarType.info);

    try {
      const list = sp.web.lists.getByTitle(listTitle);

      // Fetch non-hidden text/multiline/url fields
      const allFields = await list.fields
        .select('Title', 'InternalName', 'TypeAsString', 'Hidden', 'ReadOnlyField')
        .filter('Hidden eq false and ReadOnlyField eq false')();

      const ignoredFields = [
        'contenttype', 'attachments', 'edit', 'linktitle', 'linktitlenomenu',
        'appcreatedby', 'appmodifiedby', 'complianceassetid'
      ];

      const relevantFields = allFields.filter(f =>
        !ignoredFields.includes(f.InternalName.toLowerCase()) &&
        !f.InternalName.endsWith('_SP') &&
        ['Text', 'Note', 'URL', 'MultilineText'].includes(f.TypeAsString)
      );

      // Fetch top sample items to inspect URL presence
      let sampleItems: any[] = [];
      try {
        sampleItems = await list.items.top(10)();
      } catch (e) {
        console.warn('Could not fetch sample items:', e);
      }

      const columnOptions: IColumnOption[] = relevantFields.map(field => {
        let sampleVal = '';
        for (const item of sampleItems) {
          const val = item[field.InternalName] || item[field.Title];
          if (val && typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://') || val.includes('/ncsphoto/'))) {
            sampleVal = val;
            break;
          } else if (val && typeof val === 'string' && !sampleVal) {
            sampleVal = val.length > 80 ? val.substring(0, 80) + '...' : val;
          }
        }

        const isLikelyUrl =
          sampleVal.startsWith('http://') ||
          sampleVal.startsWith('https://') ||
          sampleVal.includes('salesforce.com') ||
          field.InternalName.toLowerCase().includes('url') ||
          field.InternalName.toLowerCase().includes('photo') ||
          field.InternalName.toLowerCase().includes('image');

        return {
          key: field.InternalName,
          columnName: field.InternalName,
          targetSpColumnName: `${field.InternalName}_SP`,
          sampleUrl: sampleVal,
          selected: isLikelyUrl,
          useToken: false // default to false (without token / anonymous to avoid CORS errors)
        };
      });

      // Sort so URL candidates are at top
      columnOptions.sort((a, b) => (b.selected ? 1 : 0) - (a.selected ? 1 : 0));

      // Populate naming columns options from all available fields (excluding _SP)
      const namingFieldOptions: IDropdownOption[] = allFields
        .filter(f => !f.InternalName.endsWith('_SP'))
        .map(f => ({
          key: f.InternalName,
          text: `${f.Title} (${f.InternalName})`
        }))
        .sort((a, b) => a.text.localeCompare(b.text));

      setAllAvailableFields(namingFieldOptions);

      // Auto-detect naming columns based on user pattern: e.g. Simpplr__People_id + Simpplr__Name__c
      const autoNaming: string[] = [];
      const idField = allFields.find(f => {
        const name = f.InternalName.toLowerCase();
        return name === 'simpplr__people_id' || name === 'simpplr__people_id__c' || name === 'people_id' || name === 'sf_id' || name === 'simpplr__user__c';
      });
      if (idField) {
        autoNaming.push(idField.InternalName);
      }

      const nameField = allFields.find(f => {
        const name = f.InternalName.toLowerCase();
        return name === 'simpplr__name__c' || name === 'simpplr__full_name__c' || name === 'name' || name === 'title';
      });
      if (nameField) {
        autoNaming.push(nameField.InternalName);
      }

      if (autoNaming.length === 0) {
        autoNaming.push('Id');
      }
      setNamingColumns(autoNaming);

      setColumns(columnOptions);
      const urlCount = columnOptions.filter(c => c.selected).length;
      setStatusMessage(`Found ${columnOptions.length} text/URL columns (${urlCount} pre-selected as URL candidates).`);
    } catch (err) {
      console.error(err);
      setStatusMessage(`Error loading columns: ${err.message || err}`);
      setMessageType(MessageBarType.error);
    } finally {
      setIsLoadingColumns(false);
    }
  };

  const handleToggleColumn = (colName: string, selected: boolean) => {
    setColumns(prev => prev.map(c => c.columnName === colName ? { ...c, selected } : c));
  };

  const handleSelectAllColumns = (selectAll: boolean) => {
    setColumns(prev => prev.map(c => ({ ...c, selected: selectAll })));
  };

  const handleToggleToken = (colName: string, useToken: boolean) => {
    setColumns(prev => prev.map(c => c.columnName === colName ? { ...c, useToken } : c));
  };

  const handleSetAllTokens = (useToken: boolean) => {
    setColumns(prev => prev.map(c => ({ ...c, useToken })));
  };

  // Helper to ensure multi-level folders inside Document Library
  const ensureFolderPath = async (folderServerRelativeUrl: string) => {
    const webInfo = await sp.web.select("ServerRelativeUrl")();
    const webRelUrl = webInfo.ServerRelativeUrl.replace(/\/$/, '');

    const relativeToWeb = folderServerRelativeUrl.startsWith(webRelUrl)
      ? folderServerRelativeUrl.substring(webRelUrl.length).replace(/^\//, '')
      : folderServerRelativeUrl.replace(/^\//, '');

    const segments = relativeToWeb.split('/').filter(s => !!s);
    let currentPath = webRelUrl;

    for (const segment of segments) {
      currentPath = `${currentPath}/${segment}`;
      try {
        const folder = sp.web.getFolderByServerRelativePath(currentPath);
        await folder();
      } catch {
        const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
        try {
          await sp.web.getFolderByServerRelativePath(parentPath).folders.addUsingPath(segment);
        } catch {
          await sp.web.folders.addUsingPath(currentPath);
        }
      }
    }

    return sp.web.getFolderByServerRelativePath(folderServerRelativeUrl);
  };

  const getExtensionFromContentTypeOrUrl = (contentType: string, url: string): string => {
    const mime = contentType.toLowerCase();
    if (mime.includes('image/jpeg') || mime.includes('image/jpg')) return '.jpg';
    if (mime.includes('image/png')) return '.png';
    if (mime.includes('image/gif')) return '.gif';
    if (mime.includes('image/webp')) return '.webp';
    if (mime.includes('image/svg')) return '.svg';
    if (mime.includes('application/pdf')) return '.pdf';
    if (mime.includes('video/mp4')) return '.mp4';
    if (mime.includes('wordprocessingml') || mime.includes('msword')) return '.docx';
    if (mime.includes('spreadsheetml') || mime.includes('excel')) return '.xlsx';
    if (mime.includes('presentationml') || mime.includes('powerpoint')) return '.pptx';
    if (mime.includes('text/plain')) return '.txt';
    if (mime.includes('zip') || mime.includes('compressed')) return '.zip';

    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://dummy.com${url}`);
      const pathname = urlObj.pathname;
      const dotIndex = pathname.lastIndexOf('.');
      if (dotIndex > -1) {
        const ext = pathname.substring(dotIndex).toLowerCase();
        if (ext.length <= 6 && !ext.includes('/')) {
          return ext;
        }
      }
    } catch { }

    return '.png';
  };

  const getFieldValue = (item: any, colName: string): string => {
    if (item[colName] !== undefined && item[colName] !== null) {
      return String(item[colName]);
    }
    const lower = colName.toLowerCase();
    for (const k of Object.keys(item)) {
      if (k.toLowerCase() === lower && item[k] !== undefined && item[k] !== null) {
        return String(item[k]);
      }
    }
    return '';
  };

  const generateFileName = (item: any, selectedNamingCols: string[], delimiter: string, ext: string): string => {
    const parts: string[] = [];
    for (const col of selectedNamingCols) {
      const rawVal = getFieldValue(item, col).trim();
      if (rawVal) {
        // Remove invalid SharePoint file name characters: ~ " # % & * : < > ? / \ { | }
        const sanitized = rawVal.replace(/[~"#%&*<>?:/\\{|}]+/g, '_').trim();
        if (sanitized) {
          parts.push(sanitized);
        }
      }
    }

    let baseName = parts.join(delimiter);
    if (!baseName) {
      baseName = `item_${item.Id}`;
    }

    const cleanExt = ext.startsWith('.') ? ext : `.${ext}`;
    return `${baseName}${cleanExt}`;
  };

  const downloadMediaFile = async (url: string, useToken: boolean, token?: string): Promise<{ data: ArrayBuffer; contentType: string }> => {
    let fullUrl = url.trim();
    if (fullUrl.startsWith('/')) {
      fullUrl = `${salesforceConfig.apiUrl}${fullUrl}`;
    }

    const headers: Record<string, string> = {};
    if (useToken && token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Determine target fetch URL (direct or via CORS proxy)
    let fetchUrl = fullUrl;
    if (useProxy && proxyUrl) {
      const cleanProxyUrl = proxyUrl.trim();
      fetchUrl = cleanProxyUrl.includes('?url=')
        ? `${cleanProxyUrl}${encodeURIComponent(fullUrl)}`
        : `${cleanProxyUrl}${cleanProxyUrl.endsWith('/') ? '' : '/'}${encodeURIComponent(fullUrl)}`;
    }

    let response: Response;
    try {
      response = await fetch(fetchUrl, {
        method: 'GET',
        headers: Object.keys(headers).length > 0 ? headers : undefined
      });
    } catch {
      if (!useProxy) {
        throw new Error(`CORS Error: Browser blocked '${fullUrl}'. Salesforce /ncsphoto/ does not emit Access-Control-Allow-Origin headers even when added to Salesforce CORS. Enable 'Use CORS Proxy' and run 'npm run proxy' in terminal.`);
      } else {
        throw new Error(`CORS Proxy Error: Could not connect to '${proxyUrl}'. Please ensure the proxy is running in your terminal via 'npm run proxy' (node scripts/cors-proxy.js).`);
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    const blob = await response.blob();
    const data = await blob.arrayBuffer();
    return { data, contentType };
  };

  // Main Conversion Action
  const handleStartConversion = async () => {
    const selectedCols = columns.filter(c => c.selected);
    if (!selectedList) {
      setStatusMessage('Please select a SharePoint list.');
      setMessageType(MessageBarType.warning);
      return;
    }
    if (selectedCols.length === 0) {
      setStatusMessage('Please select at least one column for URL conversion.');
      setMessageType(MessageBarType.warning);
      return;
    }

    setIsConverting(true);
    setStatusMessage('Starting URL & media conversion...');
    setMessageType(MessageBarType.info);
    addLog(`=== Starting conversion for list: ${selectedList} ===`);

    try {
      const list = sp.web.lists.getByTitle(selectedList);

      // 1. Get Salesforce Token (only if at least one selected column requires it)
      const needsToken = selectedCols.some(c => c.useToken);
      let sfToken = '';
      if (needsToken) {
        addLog('Columns requiring authentication detected. Fetching Salesforce token...');
        try {
          sfToken = await getSalesforceToken();
          addLog('Salesforce token acquired.');
        } catch (authErr) {
          addLog(`Warning: Failed to fetch Salesforce token (${authErr.message}). Continuing...`);
        }
      } else {
        addLog('All selected columns configured without token (Anonymous / No CORS preflight).');
      }

      // 2. Identify Document Library Folder Root
      addLog('Resolving SharePoint Document Library...');
      let docLibServerRelativeUrl = '';
      try {
        const docLib = await sp.web.lists.getByTitle("Documents").select("RootFolder/ServerRelativeUrl").expand("RootFolder")();
        docLibServerRelativeUrl = docLib.RootFolder.ServerRelativeUrl;
      } catch {
        try {
          const docLib = await sp.web.lists.getByTitle("Shared Documents").select("RootFolder/ServerRelativeUrl").expand("RootFolder")();
          docLibServerRelativeUrl = docLib.RootFolder.ServerRelativeUrl;
        } catch {
          const webInfo = await sp.web.select("ServerRelativeUrl")();
          docLibServerRelativeUrl = `${webInfo.ServerRelativeUrl.replace(/\/$/, '')}/Shared Documents`;
        }
      }
      addLog(`Document Library path: ${docLibServerRelativeUrl}`);

      // 3. Ensure Target _SP Columns exist on the list
      addLog('Ensuring target _SP columns exist on list...');
      const targetColumnInternalNames: { [sourceCol: string]: string } = {};
      const targetColumnTypes: { [sourceCol: string]: string } = {};

      for (const col of selectedCols) {
        const targetSpCol = col.targetSpColumnName;
        try {
          const existingField = await list.fields.getByTitle(targetSpCol)();
          targetColumnInternalNames[col.columnName] = existingField.EntityPropertyName || targetSpCol;
          targetColumnTypes[col.columnName] = existingField.TypeAsString || '';
          addLog(`Target column "${targetSpCol}" already exists (Type: ${existingField.TypeAsString}).`);
        } catch {
          addLog(`Creating multiline text column "${targetSpCol}" on list "${selectedList}"...`);
          try {
            const newField: any = await list.fields.addMultilineText(targetSpCol, {
              NumberOfLines: 6,
              RichText: false,
              AppendOnly: false,
              AllowHyperlink: false
            });
            targetColumnInternalNames[col.columnName] = newField?.data?.EntityPropertyName || newField?.EntityPropertyName || targetSpCol;
            targetColumnTypes[col.columnName] = 'Note';
            addLog(`Created multiline text column "${targetSpCol}".`);
          } catch (createErr) {
            console.error(`Failed to create column ${targetSpCol}:`, createErr);
            addLog(`Error creating column ${targetSpCol}: ${createErr.message || createErr}`);
            targetColumnInternalNames[col.columnName] = targetSpCol;
            targetColumnTypes[col.columnName] = 'Note';
          }
        }
      }

      // 4. Ensure Folder Structure: SharedDocuments/<selectedList>/<columnName>
      const folderPathsByColumn: { [sourceCol: string]: string } = {};
      for (const col of selectedCols) {
        const folderPath = `${docLibServerRelativeUrl}/${selectedList}/${col.columnName}`;
        folderPathsByColumn[col.columnName] = folderPath;
        addLog(`Ensuring folder: ${folderPath}...`);
        await ensureFolderPath(folderPath);
      }

      // 5. Query List Items that have non-empty URL values
      addLog(`Fetching items from "${selectedList}"...`);
      const selectFields = Array.from(new Set([
        'Id',
        ...namingColumns,
        ...selectedCols.map(c => c.columnName),
        ...selectedCols.map(c => targetColumnInternalNames[c.columnName] || c.targetSpColumnName)
      ]));

      let allItems: any[] = [];
      try {
        allItems = await list.items.select(...selectFields).top(5000)();
      } catch {
        // Fallback to fetch all
        allItems = await list.items.top(5000)();
      }

      addLog(`Retrieved ${allItems.length} total items from list.`);

      // 6. Process each item and column
      let successCount = 0;
      let failureCount = 0;
      let skippedCount = 0;

      const totalOperations = allItems.length * selectedCols.length;
      let processedOperations = 0;

      for (let i = 0; i < allItems.length; i++) {
        const item = allItems[i];
        const updatePayload: any = {};
        let itemNeedsUpdate = false;

        for (const col of selectedCols) {
          processedOperations++;
          setProgress({
            current: processedOperations,
            total: totalOperations,
            label: `Processing item ${i + 1}/${allItems.length} - ${col.columnName}...`
          });

          const urlValue = item[col.columnName];
          const targetFieldInternalName = targetColumnInternalNames[col.columnName] || col.targetSpColumnName;
          const existingSpVal = item[targetFieldInternalName];

          if (!urlValue || typeof urlValue !== 'string' || urlValue.trim() === '') {
            skippedCount++;
            continue;
          }

          // If already converted to a SharePoint URL, skip to avoid re-downloading
          if (existingSpVal && typeof existingSpVal === 'string' && existingSpVal.includes(docLibServerRelativeUrl)) {
            skippedCount++;
            continue;
          }

          try {
            // Download from Salesforce with/without token based on column config
            const { data, contentType } = await downloadMediaFile(urlValue, col.useToken, sfToken);
            const ext = getExtensionFromContentTypeOrUrl(contentType, urlValue);
            const fileName = generateFileName(item, namingColumns, namingDelimiter, ext);

            // Upload to SharePoint Document Library folder
            const folderPath = folderPathsByColumn[col.columnName];
            const folder = sp.web.getFolderByServerRelativePath(folderPath);
            const fileAddResult = await folder.files.addUsingPath(fileName, data, { Overwrite: true });

            // Construct SharePoint URL
            const spFileUrl = `${window.location.origin}${fileAddResult.ServerRelativeUrl}`;
            
            const colType = targetColumnTypes[col.columnName] || '';
            if (colType === 'URL') {
              // SharePoint URL field takes { Url, Description } without __metadata
              updatePayload[targetFieldInternalName] = {
                Url: spFileUrl,
                Description: fileName
              };
            } else {
              // Plain string for Multiline Text / Note
              updatePayload[targetFieldInternalName] = spFileUrl;
            }

            itemNeedsUpdate = true;
            successCount++;

            addLog(`[Success] Item #${item.Id} (${col.columnName}) -> ${fileName}`);
          } catch (fileErr) {
            failureCount++;
            const errMsg = fileErr.message || fileErr;
            addLog(`[Failed] Item #${item.Id} (${col.columnName}): ${errMsg}`);

            // Log to audit log
            try {
              const auditList = sp.web.lists.getByTitle("SalesforceMigration_AuditLog");
              await auditList.items.add({
                Title: `URL Error - Item ${item.Id}`,
                SalesforceId: String(item.Id),
                ObjectName: `${selectedList}/${col.columnName}`,
                ErrorMessage: String(errMsg)
              });
            } catch { }
          }
        }

        // Commit update for this list item
        if (itemNeedsUpdate) {
          try {
            await list.items.getById(item.Id).update(updatePayload);
          } catch {
            // If direct update failed, try alternate payload WITHOUT __metadata
            const altPayload: any = {};
            for (const key of Object.keys(updatePayload)) {
              const val = updatePayload[key];
              if (typeof val === 'string') {
                altPayload[key] = {
                  Url: val,
                  Description: val.substring(val.lastIndexOf('/') + 1)
                };
              } else if (val && typeof val === 'object' && val.Url) {
                altPayload[key] = val.Url;
              } else {
                altPayload[key] = val;
              }
            }
            try {
              await list.items.getById(item.Id).update(altPayload);
            } catch (retryErr) {
              console.error(`Failed to update item ${item.Id}:`, retryErr);
              addLog(`[Update Error] Item #${item.Id}: ${retryErr.message || retryErr}`);
            }
          }
        }
      }

      const summaryMsg = `Conversion finished! ${successCount} media files converted, ${skippedCount} skipped, ${failureCount} failed.`;
      setStatusMessage(summaryMsg);
      setMessageType(failureCount > 0 ? MessageBarType.warning : MessageBarType.success);
      addLog(`=== ${summaryMsg} ===`);
    } catch (err) {
      console.error(err);
      setStatusMessage(`Error during conversion: ${err.message || err}`);
      setMessageType(MessageBarType.error);
      addLog(`[Fatal Error]: ${err.message || err}`);
    } finally {
      setIsConverting(false);
      setProgress({ current: 0, total: 0, label: '' });
    }
  };

  const columnsDef: IColumn[] = [
    {
      key: 'selected',
      name: 'Convert',
      fieldName: 'selected',
      minWidth: 70,
      maxWidth: 90,
      isResizable: false,
      onRenderHeader: () => {
        const allSelected = columns.length > 0 && columns.every(c => c.selected);
        const someSelected = columns.some(c => c.selected);
        return (
          <Checkbox
            label="Convert"
            checked={allSelected}
            indeterminate={someSelected && !allSelected}
            onChange={(e, checked) => handleSelectAllColumns(!!checked)}
            disabled={isConverting}
          />
        );
      },
      onRender: (item: IColumnOption) => (
        <Checkbox
          checked={item.selected}
          onChange={(e, checked) => handleToggleColumn(item.columnName, !!checked)}
          disabled={isConverting}
        />
      )
    },
    {
      key: 'columnName',
      name: 'Salesforce Source Column',
      fieldName: 'columnName',
      minWidth: 220,
      maxWidth: 280,
      isResizable: true,
      onRender: (item: IColumnOption) => (
        <span style={{ fontWeight: 600 }}>{item.columnName}</span>
      )
    },
    {
      key: 'targetSpColumnName',
      name: 'Target SharePoint Column',
      fieldName: 'targetSpColumnName',
      minWidth: 220,
      maxWidth: 280,
      isResizable: true,
      onRender: (item: IColumnOption) => (
        <span style={{ color: '#0078d4', fontFamily: 'monospace' }}>{item.targetSpColumnName}</span>
      )
    },
    {
      key: 'useToken',
      name: 'Auth Mode',
      fieldName: 'useToken',
      minWidth: 140,
      maxWidth: 170,
      isResizable: true,
      onRenderHeader: () => {
        const allToken = columns.length > 0 && columns.every(c => c.useToken);
        const someToken = columns.some(c => c.useToken);
        return (
          <Checkbox
            label="Use Token"
            checked={allToken}
            indeterminate={someToken && !allToken}
            onChange={(e, checked) => handleSetAllTokens(!!checked)}
            disabled={isConverting}
            title="Check for private Salesforce assets; uncheck for Anonymous URLs to avoid CORS errors"
          />
        );
      },
      onRender: (item: IColumnOption) => (
        <Checkbox
          label={item.useToken ? "With Token" : "Without Token"}
          checked={item.useToken}
          onChange={(e, checked) => handleToggleToken(item.columnName, !!checked)}
          disabled={isConverting}
          styles={{
            text: {
              color: item.useToken ? '#0078d4' : '#107c41',
              fontWeight: 600,
              fontSize: '12px'
            }
          }}
          title={item.useToken ? "Passes Authorization Bearer token" : "Anonymous GET: No headers sent, avoiding CORS origin error"}
        />
      )
    },
    {
      key: 'sampleUrl',
      name: 'Sample Value / URL',
      fieldName: 'sampleUrl',
      minWidth: 300,
      maxWidth: 500,
      isResizable: true,
      onRender: (item: IColumnOption) => (
        <span
          title={item.sampleUrl}
          style={{
            fontFamily: 'monospace',
            fontSize: '11px',
            color: item.sampleUrl.startsWith('http') ? '#107c41' : '#605e5c',
            wordBreak: 'break-all',
            display: 'block'
          }}
        >
          {item.sampleUrl || '(No sample value)'}
        </span>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', fontFamily: 'Segoe UI, sans-serif' }}>
      <h2 style={{ marginTop: 0, marginBottom: '6px' }}>Post-Migration URL & Media Conversion</h2>
      <p style={{ color: '#605e5c', marginBottom: '16px' }}>
        Download media files (photos, images, attachments) from Salesforce URLs in migrated lists, store them into SharePoint Document Library under <code>SharedDocuments/&lt;selectedlist&gt;/&lt;columnname&gt;</code>, and populate the new <code>&lt;columnname&gt;_SP</code> columns.
      </p>

      {/* Salesforce CORS & Proxy Configuration Banner */}
      <div style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid #edebe9',
        borderLeft: '4px solid #0078d4',
        padding: '16px 20px',
        marginBottom: '20px',
        borderRadius: '4px'
      }}>
        <div style={{ fontWeight: 600, fontSize: '15px', color: '#323130', marginBottom: '6px' }}>
          Salesforce Media Download &amp; CORS Configuration
        </div>
        <div style={{ fontSize: '13px', color: '#605e5c', lineHeight: '1.5', marginBottom: '12px' }}>
          <strong>Important:</strong> Salesforce&apos;s CORS Allowed Origins whitelist only applies to Salesforce REST APIs (<code>/services/data/</code>). Static profile photo URLs (like <code>/ncsphoto/...</code>) bypass the CORS filter and <strong>do not return <code>Access-Control-Allow-Origin</code></strong>, causing the browser to block direct downloads.
          <br />
          To download these media files into SharePoint seamlessly, use the built-in local CORS proxy:
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap', backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '4px', border: '1px solid #e1dfdd' }}>
          <Toggle
            label="Use CORS Proxy"
            checked={useProxy}
            onChange={(e, checked) => setUseProxy(!!checked)}
            onText="Enabled"
            offText="Direct"
            disabled={isConverting}
          />
          <TextField
            label="CORS Proxy URL"
            value={proxyUrl}
            onChange={(e, newVal) => setProxyUrl(newVal || '')}
            disabled={!useProxy || isConverting}
            styles={{ root: { minWidth: 320 } }}
            placeholder="http://localhost:8010/?url="
          />
          <div style={{ fontSize: '12px', color: '#605e5c', alignSelf: 'flex-end', paddingBottom: '6px' }}>
            Terminal command to start proxy: <code style={{ background: '#f3f2f1', padding: '3px 6px', borderRadius: '3px', fontWeight: 600 }}>npm run proxy</code>
          </div>
        </div>
      </div>

      {/* List Selection Section */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap' }}>
        <Dropdown
          label="Choose SharePoint List"
          placeholder="Select a list..."
          selectedKey={selectedList}
          options={availableLists}
          onChange={(e, option) => option && handleListChange(String(option.key))}
          disabled={isLoadingLists || isConverting}
          styles={{ root: { minWidth: 320 } }}
        />
        <DefaultButton
          text="Reload Lists"
          onClick={loadSharePointLists}
          disabled={isLoadingLists || isConverting}
        />
      </div>

      {isLoadingColumns && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0' }}>
          <Spinner size={SpinnerSize.small} label="Loading columns and sample values..." />
        </div>
      )}

      {statusMessage && (
        <MessageBar messageBarType={messageType} style={{ marginBottom: '16px' }}>
          {statusMessage}
        </MessageBar>
      )}

      {/* File Name Generation Settings */}
      {selectedList && allAvailableFields.length > 0 && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #edebe9',
          borderRadius: '4px',
          padding: '16px 20px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontWeight: 600, fontSize: '15px', color: '#323130', marginBottom: '4px' }}>
            📁 File Name Generation Settings
          </div>
          <div style={{ fontSize: '13px', color: '#605e5c', marginBottom: '12px' }}>
            Choose primary column(s) to name each downloaded file (e.g. <code>Simpplr__People_id+Simpplr__Name__c.png</code>):
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <Dropdown
              label="Primary / Naming Columns"
              placeholder="Select columns in order..."
              multiSelect
              selectedKeys={namingColumns}
              options={allAvailableFields}
              onChange={(e, option) => {
                if (!option) return;
                setNamingColumns(prev => {
                  const key = String(option.key);
                  if (option.selected) {
                    return prev.includes(key) ? prev : [...prev, key];
                  } else {
                    return prev.filter(k => k !== key);
                  }
                });
              }}
              disabled={isConverting}
              styles={{ root: { minWidth: 380, flex: '1 1 380px' } }}
            />

            <Dropdown
              label="Separator / Delimiter"
              selectedKey={namingDelimiter}
              options={[
                { key: '+', text: '+ (Plus: Col1+Col2)' },
                { key: '_', text: '_ (Underscore: Col1_Col2)' },
                { key: '-', text: '- (Hyphen: Col1-Col2)' },
                { key: '.', text: '. (Dot: Col1.Col2)' }
              ]}
              onChange={(e, option) => option && setNamingDelimiter(String(option.key))}
              disabled={isConverting}
              styles={{ root: { width: 190 } }}
            />
          </div>

          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            backgroundColor: '#f3f2f1',
            borderRadius: '4px',
            fontSize: '13px',
            color: '#323130',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            <strong>Naming Pattern Preview:</strong>
            <code style={{ color: '#0078d4', fontWeight: 600, background: '#ffffff', padding: '2px 8px', borderRadius: '3px', border: '1px solid #e1dfdd' }}>
              {namingColumns.length > 0 ? namingColumns.join(namingDelimiter) : 'item_[Id]'}.&lt;ext&gt;
            </code>
            <span style={{ color: '#605e5c', fontSize: '12px' }}>
              (e.g. {namingColumns.length > 0 ? namingColumns.join(namingDelimiter) : 'item_1'}.png / .docx / .pdf / .jpg)
            </span>
          </div>
        </div>
      )}

      {/* Progress Bar during conversion */}
      {isConverting && progress.total > 0 && (
        <div style={{ margin: '16px 0' }}>
          <ProgressIndicator
            label={progress.label}
            description={`${progress.current} of ${progress.total} operations`}
            percentComplete={progress.current / progress.total}
          />
        </div>
      )}

      {/* Columns List & Actions */}
      {columns.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ padding: '8px 12px', background: '#f3f9f1', borderLeft: '3px solid #107c41', marginBottom: '12px', fontSize: '13px', color: '#274b22' }}>
            <strong>💡 Auth Mode:</strong> For anonymous/public photo URLs (such as <code>/ncsphoto/</code> URLs), keep <strong>&quot;Without Token&quot;</strong> selected (default). Passing an Authorization token triggers CORS origin errors from Salesforce. Use <strong>&quot;With Token&quot;</strong> only for protected private assets.
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ fontWeight: 600, color: '#323130' }}>
              Select URL Columns ({columns.filter(c => c.selected).length} of {columns.length} selected)
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <DefaultButton
                text="Select All"
                onClick={() => handleSelectAllColumns(true)}
                disabled={isConverting}
              />
              <DefaultButton
                text="Deselect All"
                onClick={() => handleSelectAllColumns(false)}
                disabled={isConverting}
              />
              <DefaultButton
                text="All: Without Token"
                onClick={() => handleSetAllTokens(false)}
                disabled={isConverting}
              />
              <DefaultButton
                text="All: With Token"
                onClick={() => handleSetAllTokens(true)}
                disabled={isConverting}
              />
            </div>
          </div>

          <DetailsList
            items={columns}
            columns={columnsDef}
            setKey="set"
            layoutMode={DetailsListLayoutMode.justified}
            selectionMode={SelectionMode.none}
          />

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <PrimaryButton
              text="Convert URLs & Migrate Media to SharePoint"
              onClick={handleStartConversion}
              disabled={isConverting || columns.filter(c => c.selected).length === 0}
            />
            {isConverting && <Spinner size={SpinnerSize.small} label="Converting..." />}
          </div>
        </div>
      )}

      {/* Real-time Activity Logs */}
      {logs.length > 0 && (
        <div style={{ marginTop: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontWeight: 600 }}>Activity Log</span>
            <DefaultButton text="Clear Log" onClick={() => setLogs([])} disabled={isConverting} />
          </div>
          <div
            style={{
              backgroundColor: '#1e1e1e',
              color: '#d4d4d4',
              padding: '12px',
              fontFamily: 'Consolas, monospace',
              fontSize: '12px',
              height: '180px',
              overflowY: 'auto',
              borderRadius: '4px'
            }}
          >
            {logs.map((log, index) => (
              <div key={index} style={{ marginBottom: '3px' }}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
