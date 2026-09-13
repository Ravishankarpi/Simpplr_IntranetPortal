import * as React from 'react';
import styles from './IntranetPortal.module.scss';
import type { IIntranetPortalProps } from './IIntranetPortalProps';
import { SalesforceMigration } from './SalesforceMigration';
import { Header } from './Header';
import { Home } from './Home';

export default class IntranetPortal extends React.Component<IIntranetPortalProps> {
  
  public componentDidMount() {
    // Apply edit mode class to body if isEdit=true
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('isEdit') === 'true') {
      document.body.classList.add('is-edit-mode');
    }
  }

  public render(): React.ReactElement<IIntranetPortalProps> {
    const {
      hasTeamsContext,
      context,
      userDisplayName
    } = this.props;

    const urlParams = new URLSearchParams(window.location.search);
    const screen = urlParams.get('screen');

    return (
      <section className={`${styles.intranetPortal} ${hasTeamsContext ? styles.teams : ''}`}>
        <Header context={context} userDisplayName={userDisplayName} />
        
        {/* Simple SPA Routing */}
        {screen === 'migration' ? (
          <SalesforceMigration context={context} />
        ) : (
          <Home />
        )}
      </section>
    );
  }
}
