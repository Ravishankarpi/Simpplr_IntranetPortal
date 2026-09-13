import * as React from 'react';
import { INavMenuItem, getImageUrl } from '../models/IGlobalNavigationItem';
import styles from '../styles/GlobalMenu.module.scss';
import { CommandBarButton, IButtonStyles } from '@fluentui/react/lib/Button';
import { Callout, DirectionalHint } from '@fluentui/react/lib/Callout';
import { TooltipHost } from '@fluentui/react/lib/Tooltip';
import { SubMenu } from './SubMenu';

export interface IGlobalNavigationProps {
  items: INavMenuItem[];
}

const buttonStyles: IButtonStyles = {
  root: { height: 48, padding: '0 16px', background: 'transparent' },
  rootHovered: { background: 'var(--bodyBackgroundHovered)' },
  label: { fontWeight: 600 }
};

export const GlobalNavigation: React.FC<IGlobalNavigationProps> = ({ items }) => {
  return (
    <div className={styles.globalNavigation}>
      {items.map((item) => (
        <TopLevelMenuItem key={item.Id} item={item} />
      ))}
    </div>
  );
};

interface ITopLevelMenuItemProps {
  item: INavMenuItem;
}

const TopLevelMenuItem: React.FC<ITopLevelMenuItemProps> = ({ item }) => {
  const [menuTarget, setMenuTarget] = React.useState<HTMLElement | null>(null);

  const hasChildren = item.children && item.children.length > 0;

  const onClick = (ev: React.MouseEvent<HTMLElement>) => {
    if (hasChildren) {
      setMenuTarget(menuTarget ? null : ev.currentTarget);
    } else if (item.NavUrl) {
      window.open(item.NavUrl, item.OpenInNewTab ? '_blank' : '_self');
    }
  };

  const onDismiss = () => {
    setMenuTarget(null);
  };

  const imageUrl = getImageUrl(item.Image);

  const buttonContent = (
    <CommandBarButton
      styles={buttonStyles}
      text={item.Title}
      iconProps={imageUrl ? { imageProps: { src: imageUrl, style: { width: 16, height: 16 } } } : undefined}
      menuIconProps={hasChildren ? { iconName: 'ChevronDown' } : undefined}
      onClick={onClick}
    />
  );

  return (
    <div className={styles.topLevelItem}>
      {item.Description ? (
        <TooltipHost content={item.Description}>
          {buttonContent}
        </TooltipHost>
      ) : (
        buttonContent
      )}

      {hasChildren && menuTarget && (
        <Callout
          target={menuTarget}
          onDismiss={onDismiss}
          directionalHint={DirectionalHint.bottomLeftEdge}
          isBeakVisible={false}
          setInitialFocus
        >
          <SubMenu items={item.children!} onDismiss={onDismiss} />
        </Callout>
      )}
    </div>
  );
};
