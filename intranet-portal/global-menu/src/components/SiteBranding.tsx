import * as React from 'react';
import styles from '../styles/GlobalMenu.module.scss';
import { Image, ImageFit } from '@fluentui/react/lib/Image';
import { Persona, PersonaSize, PersonaPresence } from '@fluentui/react/lib/Persona';

export interface ISiteBrandingProps {
  title: string;
  logoUrl?: string;
}

export const SiteBranding: React.FC<ISiteBrandingProps> = ({ title, logoUrl }) => {
  return (
    <div className={styles.siteBranding}>
      {logoUrl ? (
        <Image 
          src={logoUrl} 
          alt={`${title} logo`} 
          className={styles.siteLogo} 
          imageFit={ImageFit.contain} 
          maximizeFrame={true} 
        />
      ) : (
        <Persona
          text={title}
          size={PersonaSize.size32}
          hidePersonaDetails={true}
          presence={PersonaPresence.none}
          className={styles.siteLogoFallback}
        />
      )}
      <span className={styles.siteTitle}>{title}</span>
    </div>
  );
};
