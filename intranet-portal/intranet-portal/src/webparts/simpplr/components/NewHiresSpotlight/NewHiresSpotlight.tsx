import * as React from 'react';
import { useState, useEffect } from 'react';
import { INewHiresSpotlightProps, INewHireItem } from './INewHiresSpotlightProps';
import { defaultNewHiresMockData } from './NewHiresSpotlightMockData';
import { getSP } from '../../../../shared/pnpjsConfig';
import styles from './NewHiresSpotlight.module.scss';

/**
 * Helper to safely extract a URL string from various SharePoint field types
 * (plain text, multiline text, HTML, or Hyperlink object).
 */
const parseUrlValue = (val: unknown): string => {
  if (!val) return '';
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
      return trimmed;
    }
    const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) return srcMatch[1];
    const hrefMatch = trimmed.match(/href=["']([^"']+)["']/i);
    if (hrefMatch && hrefMatch[1]) return hrefMatch[1];
    return trimmed;
  }
  if (typeof val === 'object' && val !== null) {
    const obj = val as Record<string, unknown>;
    if (typeof obj.Url === 'string') return obj.Url;
    if (typeof obj.url === 'string') return obj.url;
    if (typeof obj.serverRelativeUrl === 'string') return obj.serverRelativeUrl;
    if (typeof obj.ServerRelativeUrl === 'string') return obj.ServerRelativeUrl;
  }
  return '';
};

const AVATAR_COLORS = [
  '#0078d4', // Microsoft Blue
  '#107c41', // Forest Green
  '#5c2d91', // Royal Purple
  '#d83b01', // Burnt Orange
  '#008272', // Teal
  '#a80000', // Crimson
  '#004e8c', // Deep Navy
  '#8764b8', // Lavender
  '#ca5010', // Amber
  '#038387'  // Cyan
];

const getAvatarBgColor = (name: string): string => {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

export const NewHiresSpotlight: React.FC<INewHiresSpotlightProps> = (props) => {
  const [employees, setEmployees] = useState<INewHireItem[]>(props.items || defaultNewHiresMockData);
  const [imageErrorMap, setImageErrorMap] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    // If items were explicitly passed via props, use them directly
    if (props.items && props.items.length > 0) {
      setEmployees(props.items);
      return;
    }

    let isMounted = true;

    const loadNewHiresFromSharePoint = async (): Promise<void> => {
      if (!props.context) return;

      try {
        const sp = getSP(props.context);
        const listTitle = 'Simpplr__People__c_Migration';
        const list = sp.web.lists.getByTitle(listTitle);

        // Exact SharePoint internal name for profile photo URL
        const PHOTO_INTERNAL_NAME = 'Simpplr__External_Full_Photo_URL0';

        let items: Array<Record<string, unknown>> = [];

        // 1. Query SharePoint list using the exact internal name
        try {
          items = await list.items
            .select('Id', 'Title', PHOTO_INTERNAL_NAME)
            .top(10)();
        } catch (primarySelectErr) {
          console.warn(`Direct select with ${PHOTO_INTERNAL_NAME} failed, falling back to top(10):`, primarySelectErr);
          try {
            items = await list.items.top(10)();
          } catch (listErr) {
            console.warn('Could not query items from list:', listErr);
          }
        }

        if (isMounted && items && items.length > 0) {
          const spEmployees: INewHireItem[] = items.map((item: Record<string, unknown>, idx: number) => {
            // Extract profile photo URL from Simpplr__External_Full_Photo_URL0
            const rawPhotoVal =
              item[PHOTO_INTERNAL_NAME] ||
              item.Simpplr__External_Full_Photo_URL0 ||
              item.Simpplr__External_Photo_URL0 ||
              '';

            const photoUrl = parseUrlValue(rawPhotoVal);

            // Employee name from Title column (hover tooltip requirement)
            const empName = (typeof item.Title === 'string' && item.Title.trim())
              ? item.Title.trim()
              : (typeof item.Simpplr__Name__c === 'string' && item.Simpplr__Name__c.trim())
                ? item.Simpplr__Name__c.trim()
                : (typeof item.Name === 'string' && item.Name.trim())
                  ? item.Name.trim()
                  : `New Hire ${idx + 1}`;

            return {
              id: String(item.Id || idx),
              name: empName,
              imageUrl: photoUrl // When empty/unavailable, component renders initials
            };
          });

          if (spEmployees.length >= 10) {
            setEmployees(spEmployees.slice(0, 10));
          } else {
            // Fill remaining slots up to 10 with mock data to guarantee 10 portraits
            const combined = [...spEmployees, ...defaultNewHiresMockData.slice(spEmployees.length, 10)];
            setEmployees(combined);
          }
        }
      } catch (err) {
        // Fallback gracefully to mock data if SharePoint list is not available
        console.warn('Simpplr__People__c_Migration not available, using mock data:', err);
      }
    };

    loadNewHiresFromSharePoint().catch(console.error);

    return () => {
      isMounted = false;
    };
  }, [props.context, props.items]);

  const handleImageError = (id: string): void => {
    setImageErrorMap((prev) => ({ ...prev, [id]: true }));
  };

  const getInitials = (name: string): string => {
    if (!name) return 'NH';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return (parts[0] ? parts[0].substring(0, 2) : 'NH').toUpperCase();
  };

  const titleText = props.title || 'Welcome New Hires!';

  return (
    <section className={styles.container} aria-label={titleText}>
      <h2 className={styles.title}>{titleText}</h2>

      <ul className={styles.grid} role="list">
        {employees.slice(0, 10).map((employee) => {
          const hasError = !employee.imageUrl || imageErrorMap[employee.id];

          return (
            <li key={employee.id} className={styles.portraitItem} role="listitem">
              <div
                className={styles.portraitWrapper}
                title={employee.name} // Displays employee name only on hover
                aria-label={employee.name}
              >
                {!hasError ? (
                  <img
                    src={employee.imageUrl}
                    alt={employee.name}
                    className={styles.portraitImage}
                    onError={() => handleImageError(employee.id)}
                    loading="lazy"
                  />
                ) : (
                  <div
                    className={styles.initialsFallback}
                    aria-label={employee.name}
                    style={{ backgroundColor: getAvatarBgColor(employee.name) }}
                  >
                    {getInitials(employee.name)}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default NewHiresSpotlight;
