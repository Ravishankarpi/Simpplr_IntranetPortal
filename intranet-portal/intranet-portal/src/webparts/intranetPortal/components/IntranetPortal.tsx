import * as React from 'react';
import styles from './IntranetPortal.module.scss';
import type { IIntranetPortalProps } from './IIntranetPortalProps';
import { SalesforceMigration } from './SalesforceMigration';
import { SalesforceUrlConversion } from './SalesforceUrlConversion';
import { Header } from './Header';
import { Home } from './Home';
import { DefaultButton, PrimaryButton } from '@fluentui/react';

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
        {/* <Header context={context} userDisplayName={userDisplayName} /> */}

        {/* Top switcher for Migration & URL Conversion utilities */}
        {(screen === 'migration' || screen === 'urlconversion') && (
          <div style={{ display: 'flex', gap: '10px', padding: '12px 20px', background: '#f3f2f1', borderBottom: '1px solid #edebe9' }}>
            {screen === 'migration' ? (
              <PrimaryButton text="1. Salesforce Data Migration" />
            ) : (
              <DefaultButton
                text="1. Salesforce Data Migration"
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set('screen', 'migration');
                  window.location.href = url.toString();
                }}
              />
            )}

            {screen === 'urlconversion' ? (
              <PrimaryButton text="2. Post-Migration URL & Media Conversion" />
            ) : (
              <DefaultButton
                text="2. Post-Migration URL & Media Conversion"
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set('screen', 'urlconversion');
                  window.location.href = url.toString();
                }}
              />
            )}
          </div>
        )}

        {/* Simple SPA Routing */}
        {screen === 'migration' ? (
          <SalesforceMigration context={context} />
        ) : screen === 'urlconversion' ? (
          <SalesforceUrlConversion context={context} />
        ) : (
          <Home />
        )}
      </section>
    );
  }
}
