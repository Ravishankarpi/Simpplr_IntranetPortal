import * as React from 'react';
import styles from '../styles/GlobalMenu.module.scss';
import { IRecentSearch } from '../models/IGlobalSearch';

export interface IRecentSearchesProps {
  searches: IRecentSearch[];
  onSearchSelect: (query: string) => void;
}

export const RecentSearches: React.FC<IRecentSearchesProps> = ({ searches, onSearchSelect }) => {
  if (!searches || searches.length === 0) return null;

  return (
    <div className={styles.searchSection}>
      <div className={styles.searchSectionTitle}>Recent Searches</div>
      <ul className={styles.searchList}>
        {searches.map(s => (
          <li key={s.id} onClick={() => onSearchSelect(s.query)} className={styles.searchListItem}>
            <span className={styles.searchIcon}>🕒</span>
            <span className={styles.searchText}>{s.query}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
