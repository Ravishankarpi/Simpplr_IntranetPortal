import * as React from 'react';
import styles from './SiteBanner.module.scss';
import type { ISiteBannerProps } from './ISiteBannerProps';

export default class SiteBanner extends React.Component<ISiteBannerProps> {

  /* ── Determine if the banner has been configured ── */
  private get isConfigured(): boolean {
    const p = this.props;
    return !!(p.title || p.description || p.backgroundImageUrl || p.backgroundColor || p.eyebrowText);
  }

  /* ── Overlay style ────────────────────────────────── */
  private getOverlayStyle(): React.CSSProperties {
    const { overlayType, overlayOpacity } = this.props;
    if (!overlayType || overlayType === 'none') return {};
    const opacity = overlayOpacity !== undefined ? overlayOpacity : 0.35;
    const color = overlayType === 'light'
      ? `rgba(255,255,255,${opacity})`
      : `rgba(0,0,0,${opacity})`;
    return { background: color };
  }

  /* ── Banner root style (background + layout props) ── */
  private getBannerStyle(): React.CSSProperties {
    const {
      backgroundType, backgroundColor,
      bannerHeight, borderRadius, showBoxShadow
    } = this.props;

    const base: React.CSSProperties = {
      minHeight: `${bannerHeight || 180}px`,
      borderRadius: `${borderRadius !== undefined ? borderRadius : 10}px`,
      boxShadow: showBoxShadow !== false ? '0 4px 20px rgba(0,0,0,0.12)' : 'none',
    };

    if (backgroundType === 'image') return base;

    const bg = backgroundColor || 'linear-gradient(135deg, #c8e652 0%, #94cc00 100%)';
    return { ...base, background: bg };
  }

  /* ── Inner row style (padding + alignment) ────────── */
  private getInnerStyle(textColor: string): React.CSSProperties {
    const { contentPadding, contentAlignment } = this.props;
    const pad = contentPadding || 28;
    const justify =
      contentAlignment === 'right'  ? 'flex-end' :
      contentAlignment === 'center' ? 'center'   : 'flex-start';
    return {
      color: textColor,
      padding: `${pad}px ${pad + 8}px`,
      justifyContent: justify,
    };
  }

  /* ── Content block alignment ─────────────────────── */
  private getContentStyle(): React.CSSProperties {
    const { contentAlignment } = this.props;
    return {
      alignItems:
        contentAlignment === 'center' ? 'center'     :
        contentAlignment === 'right'  ? 'flex-end'   : 'flex-start',
      textAlign: (contentAlignment || 'left') as React.CSSProperties['textAlign'],
    };
  }

  /* ── Site image style ─────────────────────────────── */
  private getSiteImageStyle(): React.CSSProperties {
    const { siteImageSize, siteImageShape } = this.props;
    const size = siteImageSize || 100;
    const radius =
      siteImageShape === 'circle'  ? '50%'  :
      siteImageShape === 'square'  ? '4px'  : '12px';
    return { width: `${size}px`, height: `${size}px`, borderRadius: radius };
  }

  /* ── Background image style ───────────────────────── */
  private getBgImageStyle(): React.CSSProperties {
    const fit = (this.props.backgroundImageFit || 'cover') as React.CSSProperties['objectFit'];
    return { objectFit: fit };
  }

  /* ── Button style ─────────────────────────────────── */
  private getButtonStyle(textColor: string): React.CSSProperties {
    const { buttonStyle, buttonBgColor, buttonTextColor, buttonBorderRadius } = this.props;
    const br =
      buttonBorderRadius === 'pill'    ? '100px' :
      buttonBorderRadius === 'square'  ? '4px'   : '6px';

    if (buttonStyle === 'solid') {
      return {
        background: buttonBgColor || 'rgba(0,0,0,0.72)',
        color: buttonTextColor || '#ffffff',
        borderRadius: br,
      };
    }
    return {
      color: buttonTextColor || textColor,
      borderColor: buttonTextColor || textColor,
      borderRadius: br,
    };
  }

  /* ── CTA button CSS class ─────────────────────────── */
  private getButtonClass(): string {
    const variant = this.props.buttonStyle || 'solid';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return `${styles.ctaButton} ${(styles as any)[variant] || (styles as any).solid}`;
  }

  /* ── Placeholder ──────────────────────────────────── */
  private renderPlaceholder(): React.ReactElement {
    return (
      <div className={styles.placeholder}>
        <div className={styles.placeholderIcon}>🖼️</div>
        <p className={styles.placeholderTitle}>Site Banner</p>
        <p className={styles.placeholderHint}>
          Configure this banner in the property pane →<br />
          Set a title, description, background, and CTA button.
        </p>
      </div>
    );
  }

  public render(): React.ReactElement<ISiteBannerProps> {
    const {
      hasTeamsContext,
      backgroundType,
      backgroundImageUrl,
      textColor,
      showSiteImage,
      siteImageUrl,
      showEyebrow,
      eyebrowText,
      showTitle,
      title,
      titleFontSize,
      showDescription,
      description,
      showButton,
      buttonText,
      buttonUrl,
      buttonOpenInNewTab,
    } = this.props;

    if (!this.isConfigured) {
      return this.renderPlaceholder();
    }

    const resolvedTextColor = textColor || '#1a1a1a';

    return (
      <div
        className={`${styles.siteBanner} ${hasTeamsContext ? styles.teams : ''}`}
        style={this.getBannerStyle()}
      >
        {/* Background image */}
        {backgroundType === 'image' && backgroundImageUrl && (
          <img
            className={styles.bgImage}
            src={backgroundImageUrl}
            alt=""
            aria-hidden="true"
            style={this.getBgImageStyle()}
          />
        )}

        {/* Overlay */}
        <div className={styles.overlay} style={this.getOverlayStyle()} aria-hidden="true" />

        {/* Inner content row */}
        <div className={styles.inner} style={this.getInnerStyle(resolvedTextColor)}>

          {/* Site image */}
          {showSiteImage && siteImageUrl && (
            <div className={styles.siteImageWrapper}>
              <img
                className={styles.siteImage}
                src={siteImageUrl}
                alt="Site logo"
                style={this.getSiteImageStyle()}
              />
            </div>
          )}

          {/* Text content */}
          <div className={styles.content} style={this.getContentStyle()}>
            {showEyebrow && eyebrowText && (
              <p className={styles.eyebrow}>{eyebrowText}</p>
            )}
            {showTitle && title && (
              <h2
                className={styles.bannerTitle}
                style={{ fontSize: titleFontSize ? `${titleFontSize}px` : 'clamp(22px, 3.5vw, 38px)' }}
              >
                {title}
              </h2>
            )}
            {showDescription && description && (
              <p className={styles.bannerDescription}>{description}</p>
            )}
          </div>

          {/* CTA Button */}
          {showButton && buttonText && (
            <div className={styles.ctaWrapper}>
              <a
                href={buttonUrl || '#'}
                target={buttonOpenInNewTab ? '_blank' : '_self'}
                rel={buttonOpenInNewTab ? 'noopener noreferrer' : undefined}
                className={this.getButtonClass()}
                style={this.getButtonStyle(resolvedTextColor)}
              >
                {buttonText}
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }
}
