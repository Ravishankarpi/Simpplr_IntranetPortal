import * as React from 'react';
import styles from '../styles/GlobalMenu.module.scss';
import { RecentSearches } from './RecentSearches';
import { SearchSuggestions } from './SearchSuggestions';
import { IRecentSearch, ISearchSuggestion } from '../models/IGlobalSearch';

export interface ISearchPanelProps {
  isVisible: boolean;
  onDismiss: () => void;
  recentSearches: IRecentSearch[];
  suggestions: ISearchSuggestion[];
  onSearchSelect: (query: string) => void;
  onSuggestionSelect: (suggestion: ISearchSuggestion) => void;
}

export const SearchPanel: React.FC<ISearchPanelProps> = ({ 
  isVisible, 
  onDismiss, 
  recentSearches, 
  suggestions,
  onSearchSelect,
  onSuggestionSelect
}) => {
  if (!isVisible) return null;

  return (
    <div className={styles.searchPanel}>
      <RecentSearches searches={recentSearches} onSearchSelect={onSearchSelect} />
      <SearchSuggestions suggestions={suggestions} onSuggestionSelect={onSuggestionSelect} />
    </div>
  );
};
