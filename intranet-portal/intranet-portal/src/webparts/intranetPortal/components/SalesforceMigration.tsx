import * as React from 'react';
import { useState } from 'react';
import { TextField, PrimaryButton, DetailsList, DetailsListLayoutMode, IColumn, SelectionMode } from '@fluentui/react';
import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/fields";
import "@pnp/sp/views";
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { salesforceConfig } from '../../../config/salesforceConfig';

export interface ISalesforceMigrationProps {
  context: WebPartContext;
}

interface IColumnMapping {
  sfColumn: string;
  spColumn: string;
  spType: 'Text' | 'MultilineText';
}

export const SalesforceMigration: React.FC<ISalesforceMigrationProps> = (props) => {
  const [objectApiName, setObjectApiName] = useState<string>('');
  const [listName, setListName] = useState<string>('');
  const [columnMappings, setColumnMappings] = useState<IColumnMapping[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isMigrating, setIsMigrating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [totalCount, setTotalCount] = useState<number | null>(null);


  const sp = spfi().using(SPFx(props.context));

  const getSalesforceToken = async (): Promise<string> => {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials'); // Using client credentials as per request logic, although Salesforce requires more setup for this.
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
      throw new Error(`Failed to get token: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  };

  const fetchSalesforceData = async (token: string, url: string, allRecords: any[] = []): Promise<any[]> => {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Sforce-Query-Options': 'batchSize=2000'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const data = await response.json();
    const combinedRecords = [...allRecords, ...data.records];

    if (!data.done && data.nextRecordsUrl) {
      return fetchSalesforceData(token, `${salesforceConfig.apiUrl}${data.nextRecordsUrl}`, combinedRecords);
    }

    return combinedRecords;
  };

  const handleGetCount = async () => {
    if (!objectApiName) {
      setStatusMessage("Please enter an Object API Name.");
      return;
    }

    setStatusMessage("Fetching total record count...");
    try {
      const token = await getSalesforceToken();
      const query = `SELECT count() FROM ${objectApiName}`;
      const url = `${salesforceConfig.apiUrl}/services/data/v66.0/query/?q=${encodeURIComponent(query)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`Failed to fetch count: ${response.statusText}`);
      const data = await response.json();
      const count = data.totalSize ?? data.records?.length ?? 0;
      setTotalCount(count);
      setStatusMessage(`Total records for ${objectApiName}: ${count}`);
    } catch (err) {
      console.error(err);
      setStatusMessage(`Error fetching count: ${err.message || err}`);
    }
  };

  const handleAnalysis = async () => {
    if (!objectApiName) {
      setStatusMessage("Please enter an Object API Name.");
      return;
    }

    setIsAnalyzing(true);
    setStatusMessage("Analyzing object...");

    try {
      const token = await getSalesforceToken();

      setStatusMessage("Fetching object metadata...");
      const describeUrl = `${salesforceConfig.apiUrl}/services/data/v66.0/sobjects/${objectApiName}/describe`;
      const describeRes = await fetch(describeUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!describeRes.ok) throw new Error(`Failed to fetch object metadata: ${describeRes.statusText}`);
      const describeData = await describeRes.json();
      const fieldNames = describeData.fields.map((f: any) => f.name);

      setStatusMessage("Fetching all records...");
      const query = `SELECT ${fieldNames.join(',')} FROM ${objectApiName} ORDER BY CreatedDate DESC LIMIT 200`; // TODO: Remove LIMIT 200 after testing;
      const url = `${salesforceConfig.apiUrl}/services/data/v66.0/query/?q=${encodeURIComponent(query)}`;

      const allRecords = await fetchSalesforceData(token, url);
      setRecords(allRecords);

      if (allRecords.length > 0) {
        const firstRecord = allRecords[0];
        const keys = Object.keys(firstRecord).filter(k => k !== 'attributes');

        const mappings: IColumnMapping[] = [];
        keys.forEach(key => {
          let maxLength = 0;
          allRecords.forEach(r => {
            const val = r[key];
            if (val !== null && val !== undefined) {
              const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
              if (strVal.length > maxLength) {
                maxLength = strVal.length;
              }
            }
          });
          const spType = maxLength > 255 ? 'MultilineText' : 'Text';

          if (key.toLowerCase() === 'id') {
            mappings.push({ sfColumn: key, spColumn: `${objectApiName.replace(/__c$/, '')}_id`, spType: 'Text' });
          } else if (key.indexOf('Simpplr') === 0) {
            mappings.push({ sfColumn: key, spColumn: key, spType });
          }
        });

        setColumnMappings(mappings);
        setListName(`${objectApiName}_Migration`);
        setStatusMessage(`Analysis complete. Found ${allRecords.length} records.`);
      } else {
        setStatusMessage("No records found in Salesforce for this object.");
      }
    } catch (error) {
      console.error(error);
      setStatusMessage(`Error during analysis: ${error.message || error}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleColumnNameChange = (sfColumn: string, newSpColumn: string) => {
    setColumnMappings(prev =>
      prev.map(m => m.sfColumn === sfColumn ? { ...m, spColumn: newSpColumn } : m)
    );
  };

  const handleCreateAndMigrate = async () => {
    if (!listName) {
      setStatusMessage("Please provide a list name.");
      return;
    }

    setIsMigrating(true);
    setStatusMessage("Creating SharePoint List...");

    try {
      // 1. Create List
      const listEnsureResult = await sp.web.lists.ensure(listName);
      const list = listEnsureResult.list;

      // 1.5 Create Audit Log List
      setStatusMessage("Creating Audit Log List...");
      const auditListName = `SalesforceMigration_AuditLog`;
      const auditListEnsureResult = await sp.web.lists.ensure(auditListName);
      const auditList = auditListEnsureResult.list;
      try { await auditList.fields.addText("SalesforceId", { MaxLength: 255 }); } catch (e) { }
      try { await auditList.fields.addText("ObjectName", { MaxLength: 255 }); } catch (e) { }
      try { await auditList.fields.addMultilineText("ErrorMessage"); } catch (e) { }
      // Add audit fields to view
      const auditView = auditList.defaultView;
      try { await auditView.fields.add("SalesforceId"); } catch (e) { }
      try { await auditView.fields.add("ObjectName"); } catch (e) { }
      try { await auditView.fields.add("ErrorMessage"); } catch (e) { }

      // 2. Add Columns
      setStatusMessage("Adding columns to SharePoint List...");
      const spFieldInternalNames: { [key: string]: string } = {};

      for (const mapping of columnMappings) {
        if (mapping.spColumn.toLowerCase() !== 'title') {
          try {
            let fieldResult: any;
            if (mapping.spType === 'MultilineText') {
              fieldResult = await list.fields.addMultilineText(mapping.spColumn, { NumberOfLines: 6, RichText: false, RestrictedMode: true, AppendOnly: false, AllowHyperlink: false });
            } else {
              fieldResult = await list.fields.addText(mapping.spColumn, { MaxLength: 255 });
            }
            spFieldInternalNames[mapping.spColumn] = fieldResult.EntityPropertyName || (fieldResult.data ? fieldResult.data.EntityPropertyName : mapping.spColumn);
          } catch (fieldErr) {
            console.warn(`Field ${mapping.spColumn} might already exist or error:`, fieldErr);
            const existingField = await list.fields.getByTitle(mapping.spColumn)();
            spFieldInternalNames[mapping.spColumn] = existingField.EntityPropertyName;
          }
        }
      }

      // Add fields to default view
      const view = list.defaultView;
      for (const mapping of columnMappings) {
        if (mapping.spColumn.toLowerCase() !== 'title') {
          try {
            await view.fields.add(spFieldInternalNames[mapping.spColumn] || mapping.spColumn);
          } catch (viewErr) {
            // Ignore if already exists in view
          }
        }
      }

      // 3. Migrate Data
      setStatusMessage("Migrating data...");
      let errorCount = 0;
      let successCount = 0;

      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const itemPayload: any = {};

        // Default Title field as SharePoint lists require it if not hidden/optional
        itemPayload.Title = record.Name || record.Id || `Item ${i}`;

        for (const mapping of columnMappings) {
          if (mapping.spColumn.toLowerCase() !== 'title') {
            const internalName = spFieldInternalNames[mapping.spColumn];
            if (internalName) {
              const sfVal = record[mapping.sfColumn];
              itemPayload[internalName] = sfVal ? (typeof sfVal === 'object' ? JSON.stringify(sfVal) : String(sfVal)) : null;
            }
          }
        }

        try {
          await list.items.add(itemPayload);
          successCount++;
        } catch (itemErr) {
          console.error(`Failed to migrate record ${record.Id}`, itemErr);
          errorCount++;

          try {
            await auditList.items.add({
              Title: `Error - ${record.Id}`,
              SalesforceId: record.Id,
              ObjectName: objectApiName,
              ErrorMessage: String(itemErr.message || itemErr)
            });
          } catch (auditErr) {
            console.error("Failed to write to audit log", auditErr);
          }

          if (errorCount > 5) {
            throw new Error(`Migration stopped: More than 5 items failed to migrate. Please check the Audit Log (${auditListName}) for details.`);
          }
        }
      }

      setStatusMessage(`Migration complete! Successfully migrated ${successCount} records. ${errorCount} failures logged to ${auditListName}.`);
    } catch (error) {
      console.error(error);
      setStatusMessage(`Error during migration: ${error.message || error}`);
    } finally {
      setIsMigrating(false);
    }
  };

  const columns: IColumn[] = [
    {
      key: 'sfColumn',
      name: 'Salesforce Column',
      fieldName: 'sfColumn',
      minWidth: 150,
      maxWidth: 250,
      isResizable: true
    },
    {
      key: 'spColumn',
      name: 'SharePoint Column (Editable)',
      fieldName: 'spColumn',
      minWidth: 150,
      maxWidth: 250,
      isResizable: true,
      onRender: (item: IColumnMapping) => (
        <TextField
          value={item.spColumn}
          onChange={(e, val) => handleColumnNameChange(item.sfColumn, val || '')}
        />
      )
    }
  ];

  return (
    <div style={{ padding: '20px', fontFamily: 'Segoe UI, sans-serif' }}>
      <h2>Salesforce to SharePoint Migration</h2>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '20px' }}>
        <TextField
          label="Salesforce Object API Name"
          value={objectApiName}
          onChange={(e, val) => setObjectApiName(val || '')}
          disabled={isAnalyzing || isMigrating}
        />
        <PrimaryButton
          text="Get Total Count"
          onClick={handleGetCount}
          disabled={!objectApiName || isAnalyzing || isMigrating}
        />
        <PrimaryButton
          text="Analysis"
          onClick={handleAnalysis}
          disabled={!objectApiName || isAnalyzing || isMigrating}
        />
      </div>

      {statusMessage && (
        <div style={{ margin: '10px 0', padding: '10px', backgroundColor: '#f3f2f1' }}>
          {statusMessage}
        </div>
      )}
      {totalCount !== null && (
        <div style={{ margin: '10px 0', padding: '10px', backgroundColor: '#e0f7fa' }}>
          Total records: {totalCount}
        </div>
      )}

      {columnMappings.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <TextField
            label="Suggested SharePoint List Name"
            value={listName}
            onChange={(e, val) => setListName(val || '')}
            disabled={isMigrating}
            style={{ marginBottom: '20px' }}
          />

          <DetailsList
            items={columnMappings}
            columns={columns}
            setKey="set"
            layoutMode={DetailsListLayoutMode.justified}
            selectionMode={SelectionMode.none}
          />

          <div style={{ marginTop: '20px' }}>
            <PrimaryButton
              text="Create List & Migrate Data"
              onClick={handleCreateAndMigrate}
              disabled={isMigrating || columnMappings.length === 0}
            />
          </div>
        </div>
      )}
    </div>
  );
};
