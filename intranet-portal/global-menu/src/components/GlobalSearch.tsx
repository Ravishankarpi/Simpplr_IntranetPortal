import * as React from 'react';
import { SearchBox } from '@fluentui/react/lib/SearchBox';
import { Callout, DirectionalHint } from '@fluentui/react/lib/Callout';
import { SearchPanel } from './SearchPanel';
import styles from '../styles/GlobalMenu.module.scss';
import { IRecentSearch, ISearchSuggestion } from '../models/IGlobalSearch';

export const GlobalSearch: React.FC = () => {
  const [isCalloutVisible, setIsCalloutVisible] = React.useState(false);
  const searchBoxRef = React.useRef<HTMLDivElement>(null);

  // Mock data for UI development
  const mockRecentSearches: IRecentSearch[] = [
    { id: '1', query: 'Leave policy' },
    { id: '2', query: 'Microsoft 365' },
    { id: '3', query: 'Recruitment' }
  ];

  const mockSuggestions: ISearchSuggestion[] = [
    { id: 's1', title: 'HR Policies', url: '#' },
    { id: 's2', title: 'Employee Benefits', url: '#' },
    { id: 's3', title: 'IT Support', url: '#' }
  ];

  const onSearchSelect = (query: string) => {
    console.log('Selected search query:', query);
    setIsCalloutVisible(false);
  };

  const onSuggestionSelect = (suggestion: ISearchSuggestion) => {
    console.log('Selected suggestion:', suggestion.title);
    setIsCalloutVisible(false);
  };

  return (
    <div className={styles.globalSearchContainer} ref={searchBoxRef}>
      <SearchBox
        placeholder="Search SharePoints"
        onFocus={() => setIsCalloutVisible(true)}
        className={styles.globalSearchBox}
      />
      {isCalloutVisible && (
        <Callout
          target={searchBoxRef.current}
          onDismiss={() => setIsCalloutVisible(false)}
          setInitialFocus
          directionalHint={DirectionalHint.bottomRightEdge}
          className={styles.searchCallout}
        >
          <SearchPanel
            isVisible={isCalloutVisible}
            onDismiss={() => setIsCalloutVisible(false)}
            recentSearches={mockRecentSearches}
            suggestions={mockSuggestions}
            onSearchSelect={onSearchSelect}
            onSuggestionSelect={onSuggestionSelect}
          />
        </Callout>
      )}
    </div>
  );
};
