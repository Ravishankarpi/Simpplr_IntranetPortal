import * as React from 'react';
import { INavMenuItem } from '../models/IGlobalNavigationItem';
import { SubMenuSearch } from './SubMenuSearch';
import styles from '../styles/GlobalMenu.module.scss';
import { MenuItem } from './MenuItem';

export interface ISubMenuProps {
  items: INavMenuItem[];
  onDismiss: () => void;
}

export const SubMenu: React.FC<ISubMenuProps> = ({ items, onDismiss }) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filterItems = (nodes: INavMenuItem[], query: string): INavMenuItem[] => {
    if (!query) return nodes;

    return nodes.map(node => {
      const matches = node.Title.toLowerCase().indexOf(query.toLowerCase()) > -1;
      const filteredChildren = filterItems(node.children, query);

      if (matches || filteredChildren.length > 0) {
        return { ...node, children: filteredChildren };
      }
      return null;
    }).filter(node => node !== null) as INavMenuItem[];
  };

  const displayedItems = filterItems(items, searchQuery);

  return (
    <div className={styles.subMenuContainer}>
      <SubMenuSearch value={searchQuery} onChange={setSearchQuery} />
      <div className={styles.subMenuList}>
        {displayedItems.length > 0 ? (
          displayedItems.map((item) => (
            <MenuItem key={item.Id} item={item} onDismiss={onDismiss} />
          ))
        ) : (
          <div className={styles.noResults}>No results found</div>
        )}
      </div>
    </div>
  );
};
