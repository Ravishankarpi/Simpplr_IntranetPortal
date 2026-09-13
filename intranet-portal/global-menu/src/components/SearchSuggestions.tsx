import * as React from 'react';
import styles from '../styles/GlobalMenu.module.scss';
import { ISearchSuggestion } from '../models/IGlobalSearch';

export interface ISearchSuggestionsProps {
  suggestions: ISearchSuggestion[];
  onSuggestionSelect: (suggestion: ISearchSuggestion) => void;
}

export const SearchSuggestions: React.FC<ISearchSuggestionsProps> = ({ suggestions, onSuggestionSelect }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className={styles.searchSection}>
      <div className={styles.searchSectionTitle}>Suggested</div>
      <ul className={styles.searchList}>
        {suggestions.map(s => (
          <li key={s.id} onClick={() => onSuggestionSelect(s)} className={styles.searchListItem}>
            <span className={styles.searchIcon}>🔍</span>
            <span className={styles.searchText}>{s.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
