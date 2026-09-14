import * as React from 'react';
import styles from './SiteAbout.module.scss';
import type { ISiteAboutProps } from './ISiteAboutProps';
import { getSP } from '../../../shared/pnpjsConfig';
import "@pnp/sp/site-groups";

export interface ISiteAboutState {
  siteTitle: string;
  siteDescription: string;
  owners: any[];
  members: any[];
  visitors: any[];
  loading: boolean;
}

export default class SiteAbout extends React.Component<ISiteAboutProps, ISiteAboutState> {
  constructor(props: ISiteAboutProps) {
    super(props);
    this.state = {
      siteTitle: '',
      siteDescription: '',
      owners: [],
      members: [],
      visitors: [],
      loading: true
    };
  }

  public async componentDidMount() {
    await this.fetchSiteData();
  }

  public async componentDidUpdate(prevProps: ISiteAboutProps) {
    if (prevProps.customOwners !== this.props.customOwners ||
        prevProps.customMembers !== this.props.customMembers ||
        prevProps.customVisitors !== this.props.customVisitors) {
      await this.fetchSiteData();
    }
  }

  private async fetchSiteData() {
    this.setState({ loading: true });
    try {
      const sp = getSP(this.props.context);
      const web = sp.web;
      
      // Fetch Site Info
      const webData = await web.select("Title", "Description")();
      
      let owners = [];
      let members = [];
      let visitors = [];

      // Resolve Owners
      if (this.props.customOwners && this.props.customOwners.length > 0) {
        owners = this.props.customOwners;
      } else {
        try {
          owners = await web.associatedOwnerGroup.users();
        } catch (e) {
          console.warn("Could not fetch associatedOwnerGroup", e);
        }
      }

      // Resolve Members
      if (this.props.customMembers && this.props.customMembers.length > 0) {
        members = this.props.customMembers;
      } else {
        try {
          members = await web.associatedMemberGroup.users();
        } catch (e) {
          console.warn("Could not fetch associatedMemberGroup", e);
        }
      }

      // Resolve Visitors
      if (this.props.customVisitors && this.props.customVisitors.length > 0) {
        visitors = this.props.customVisitors;
      } else {
        try {
          visitors = await web.associatedVisitorGroup.users();
        } catch (e) {
          console.warn("Could not fetch associatedVisitorGroup", e);
        }
      }

      this.setState({
        siteTitle: webData.Title,
        siteDescription: webData.Description,
        owners,
        members,
        visitors,
        loading: false
      });
    } catch (err) {
      console.error("Error fetching site about info: ", err);
      this.setState({ loading: false });
    }
  }

  private renderUserAvatar(user: any) {
    const name = user.Title || user.text || user.fullName || "User";
    const email = user.Email || user.secondaryText || user.email || "";
    
    // For PropertyFieldPeoplePicker, it might have a slightly different object structure
    const loginName = user.loginName || user.LoginName || email;
    const avatarUrl = email ? `/_layouts/15/userphoto.aspx?size=S&username=${email}` : '';
    const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

    return (
      <div className={styles.userCard} key={loginName}>
        {avatarUrl ? (
          <img className={styles.avatar} src={avatarUrl} alt={name} onError={(e) => { (e.target as any).style.display = 'none'; }} />
        ) : (
          <div className={styles.avatar}>{initials}</div>
        )}
        <div className={styles.userInfo}>
          <span className={styles.userName} title={name}>{name}</span>
          <span className={styles.userEmail} title={email}>{email}</span>
        </div>
      </div>
    );
  }

  public render(): React.ReactElement<ISiteAboutProps> {
    const { siteTitle, siteDescription, owners, members, visitors, loading } = this.state;

    return (
      <section className={`${styles.siteAbout} ${this.props.hasTeamsContext ? styles.teams : ''}`}>
        {loading ? (
          <div>Loading site information...</div>
        ) : (
          <>
            <div className={styles.header}>
              <h2 className={styles.title}>{siteTitle}</h2>
              {siteDescription && <p className={styles.description}>{siteDescription}</p>}
            </div>

            <div className={styles.personnelSection}>
              {owners.length > 0 && (
                <div className={styles.group}>
                  <h3 className={styles.groupTitle}>Owners</h3>
                  <div className={styles.userList}>
                    {owners.map(user => this.renderUserAvatar(user))}
                  </div>
                </div>
              )}

              {members.length > 0 && (
                <div className={styles.group}>
                  <h3 className={styles.groupTitle}>Members</h3>
                  <div className={styles.userList}>
                    {members.map(user => this.renderUserAvatar(user))}
                  </div>
                </div>
              )}

              {visitors.length > 0 && (
                <div className={styles.group}>
                  <h3 className={styles.groupTitle}>Visitors</h3>
                  <div className={styles.userList}>
                    {visitors.map(user => this.renderUserAvatar(user))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    );
  }
}
