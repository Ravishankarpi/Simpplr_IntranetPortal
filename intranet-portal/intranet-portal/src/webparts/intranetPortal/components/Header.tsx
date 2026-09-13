import * as React from 'react';
import { useState, useEffect } from 'react';
import { SearchBox, Icon, Persona, PersonaSize } from '@fluentui/react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import styles from './Header.module.scss';
import { NavigationService } from './NavigationService';
import { INavItem } from './navigationConfig';

export interface IHeaderProps {
  context: WebPartContext;
  userDisplayName: string;
}

const NavMenuItem: React.FC<{ item: INavItem }> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasSubNav = item.subNav && item.subNav.length > 0;

  const handleMouseEnter = () => setIsOpen(true);
  const handleMouseLeave = () => setIsOpen(false);

  const renderLink = (navItem: INavItem, className: string) => {
    if (navItem.url) {
      // Ensure URL is absolute if it starts with 'sites/'
      const href = navItem.url.startsWith('sites/') 
        ? `${window.location.origin}/${navItem.url}` 
        : navItem.url;
      return (
        <a 
          href={href} 
          className={className} 
          target={navItem.openInNewTab ? "_blank" : "_self"}
          rel="noopener noreferrer"
        >
          {navItem.title}
          {hasSubNav && <Icon iconName="ChevronDown" style={{ marginLeft: 4, fontSize: 10 }} />}
        </a>
      );
    }
    return (
      <div className={className}>
        {navItem.title}
        {hasSubNav && <Icon iconName="ChevronDown" style={{ marginLeft: 4, fontSize: 10 }} />}
      </div>
    );
  };

  return (
    <div 
      className={styles.navItem} 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave}
    >
      {renderLink(item, '')}
      
      {hasSubNav && (
        <div className={`${styles.dropdownMenu} ${isOpen ? styles.show : ''}`}>
          {item.subNav!.map((subItem, index) => (
            <div key={index} style={{ position: 'relative' }} className={styles.dropdownItemWrapper}>
              {subItem.url ? (
                <a 
                  href={subItem.url.startsWith('sites/') ? `${window.location.origin}/${subItem.url}` : subItem.url} 
                  className={styles.dropdownItem}
                  target={subItem.openInNewTab ? "_blank" : "_self"}
                >
                  {subItem.title}
                  {subItem.subNav && subItem.subNav.length > 0 && <Icon iconName="ChevronRight" style={{ fontSize: 10 }} />}
                </a>
              ) : (
                <div className={styles.dropdownItem}>
                  {subItem.title}
                  {subItem.subNav && subItem.subNav.length > 0 && <Icon iconName="ChevronRight" style={{ fontSize: 10 }} />}
                </div>
              )}

              {/* Recursive Sub-menus */}
              {subItem.subNav && subItem.subNav.length > 0 && (
                <div className={styles.subDropdownMenu}>
                  {subItem.subNav.map((nestedItem, nestedIndex) => (
                    nestedItem.url ? (
                      <a 
                        key={nestedIndex}
                        href={nestedItem.url.startsWith('sites/') ? `${window.location.origin}/${nestedItem.url}` : nestedItem.url} 
                        className={styles.dropdownItem}
                        target={nestedItem.openInNewTab ? "_blank" : "_self"}
                      >
                        {nestedItem.title}
                      </a>
                    ) : (
                      <div key={nestedIndex} className={styles.dropdownItem}>
                        {nestedItem.title}
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const Header: React.FC<IHeaderProps> = ({ context, userDisplayName }) => {
  const [navItems, setNavItems] = useState<INavItem[]>([]);

  useEffect(() => {
    const initNav = async () => {
      await NavigationService.ensureNavigationList(context);
      const items = await NavigationService.getNavigationItems(context);
      setNavItems(items);
    };
    initNav();
  }, [context]);

  return (
    <div className={styles.headerContainer}>
      <div className={styles.searchSection}>
        <SearchBox 
          placeholder="Search The Source..." 
          onSearch={newValue => console.log('Search for', newValue)} 
        />
      </div>

      <div className={styles.navSection}>
        {navItems.map((item, index) => (
          <NavMenuItem key={index} item={item} />
        ))}
      </div>

      <div className={styles.rightSection}>
        <Icon iconName="Ringer" className={styles.notificationIcon} />
        <Persona 
          text={userDisplayName} 
          size={PersonaSize.size32} 
          hidePersonaDetails={true}
          title={userDisplayName}
        />
      </div>
    </div>
  );
};
