import * as React from 'react';
import { INavMenuItem, getImageUrl } from '../models/IGlobalNavigationItem';
import styles from '../styles/GlobalMenu.module.scss';
import { CommandBarButton } from '@fluentui/react/lib/Button';
import { TooltipHost } from '@fluentui/react/lib/Tooltip';

export interface IMenuItemProps {
  item: INavMenuItem;
  onDismiss: () => void;
}

export const MenuItem: React.FC<IMenuItemProps> = ({ item, onDismiss }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const onClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    } else if (item.NavUrl) {
      window.open(item.NavUrl, item.OpenInNewTab ? '_blank' : '_self');
      onDismiss();
    }
  };

  const imageUrl = getImageUrl(item.Image);

  const buttonContent = (
    <CommandBarButton
      className={styles.menuItemButton}
      styles={{
        root: { width: '100%', padding: '0 16px', height: '40px', background: 'transparent' },
        rootHovered: { background: 'var(--neutralLighter)' },
        flexContainer: { justifyContent: 'flex-start' }
      }}
      text={item.Title}
      iconProps={imageUrl ? { imageProps: { src: imageUrl, style: { width: 16, height: 16 } } } : undefined}
      menuIconProps={hasChildren ? { iconName: isExpanded ? 'ChevronUp' : 'ChevronDown' } : undefined}
      onClick={onClick}
    />
  );

  return (
    <div className={styles.menuItemWrapper}>
      {item.Description ? (
        <TooltipHost content={item.Description}>
          {buttonContent}
        </TooltipHost>
      ) : (
        buttonContent
      )}

      {hasChildren && isExpanded && (
        <div className={styles.nestedMenu}>
          {item.children.map(child => (
            <MenuItem key={child.Id} item={child} onDismiss={onDismiss} />
          ))}
        </div>
      )}
    </div>
  );
};
