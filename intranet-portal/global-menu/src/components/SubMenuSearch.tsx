import * as React from 'react';
import { SearchBox } from '@fluentui/react/lib/SearchBox';
import styles from '../styles/GlobalMenu.module.scss';

export interface ISubMenuSearchProps {
  value: string;
  onChange: (newValue: string) => void;
}

export const SubMenuSearch: React.FC<ISubMenuSearchProps> = ({ value, onChange }) => {
  return (
    <div className={styles.subMenuSearch}>
      <SearchBox
        placeholder="Search..."
        value={value}
        onChange={(_, newValue) => onChange(newValue || '')}
        styles={{
          root: { borderRadius: '20px', padding: '0 8px', border: '1px solid var(--neutralTertiaryAlt)' }
        }}
      />
    </div>
  );
};
