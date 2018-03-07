import React from 'react';

export class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isFork: false, // Any time a Repository is forked.
            isMember: false, // Any time a User is added or removed as a collaborator to a Repository, or has their permissions modified.
            isMembership: false, // Any time a User is added or removed from a team. Organization hooks only.
            isOrganization: false, // Any time a user is added, removed, or invited to an Organization. Organization hooks only.
            isPublic: false, // Any time a Repository changes from private to public.
            isPush: false, // Any Git push to a Repository, including editing tags or branches. Commits via API actions that update references are also counted.
            isRepository: false, // Any time a Repository is created, deleted (organization hooks only), archived, unarchived, made public, or made private.
            isReleases: false, // Any time a Release is published in a Repository.
            isTeam: false, // Any time a team is created, deleted, modified, or added to or removed from a repository. Organization hooks only.
            isLoading: false,
            email: null
        }
        this.baseUrl = 'https://cnpqmk9lhh.execute-api.eu-central-1.amazonaws.com/prod';
        this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
        this.handleEmailChange = this.handleEmailChange.bind(this);
    }

    componentDidMount() {
        // load subscription settings
        // this.props.getSubscription();
    }

    async componentDidUpdate(prevProps, prevState) {
        if (this.props.user === null || this.props.activeOrg === null) return

        if (prevProps.user !== this.props.user || prevProps.activeOrg !== this.props.activeOrg) {
            await this.setState({isLoading: true});

            let subscription = await this.props.getSubscription() || {};
            await this.setState({
                isFork: subscription.isFork || false,
                isMember: subscription.isMember || false,
                isMembership: subscription.isMembership || false,
                isOrganization: subscription.isOrganization || false,
                isPublic: subscription.isPublic || false,
                isPush: subscription.isPush || false,
                isRepository: subscription.isRepository || false,
                isReleases: subscription.isReleases || false,
                isTeam: subscription.isTeam || false
            });

            let notificationSettings = await this.props.getNotificationSettings() || {};
            await this.setState({isEmail: notificationSettings.isEmail || false});

            await this.setState({email: this.props.user.email});

            await this.setState({isLoading: false});
        }
    }

    // access_token 234d0560ec9b996f4286e7eab6f76a3e0c067c6a
    async handleCheckboxChange(event) {
        const isChecked = event.target.checked;
        const name = event.target.name;

        let addWebhookPromise = this.props.addWebhook;
        let updateSubscriptionPromise = this.props.updateSubscription;

        try {
            await addWebhookPromise();
            await updateSubscriptionPromise({[name]: isChecked});
            await this.setState({[name]: isChecked});
            console.log('Subscription and webhook successfully added/updated.');
        }
        catch(error) {
            console.log('Unable to subscribe to this organization.');
        }
    }

    async handleEmailChange() {
        let updateNotificationPromise = this.props.updateNotificationSetting;
        let updateUserPromise = this.props.updateUser;

        await updateNotificationPromise({isEmail: this.state.isEmail});
        await updateUserPromise({email: this.state.email})
        await this.setState({isEmail: this.state.isEmail ? false : true});
    }

    getSubscriptionSettings() {
        if (this.props.activeOrg === null) return <p>Select organization.</p>
        if (this.state.isLoading) return <p>Loading...</p>
        return <form>
            <p>Choose the events you would like to subscribe to.</p>
            <label>
                <input name='isFork' type='checkbox' checked={this.state.isFork} onChange={this.handleCheckboxChange} />
                Fork
            </label>
            <br />
            <label>
                <input name='isMember' type='checkbox' checked={this.state.isMember} onChange={this.handleCheckboxChange} />
                Member
            </label>
            <br />
            <label>
                <input name='isMembership' type='checkbox' checked={this.state.isMembership} onChange={this.handleCheckboxChange} />
                Membership
            </label>
            <br />
            <label>
                <input name='isOrganization' type='checkbox' checked={this.state.isOrganization} onChange={this.handleCheckboxChange} />
                Organization
            </label>
            <br />
            <label>
                <input name='isPublic' type='checkbox' checked={this.state.isPublic} onChange={this.handleCheckboxChange} />
                Public
            </label>
            <br />
            <label>
                <input name='isPush' type='checkbox' checked={this.state.isPush} onChange={this.handleCheckboxChange} />
                Push
            </label>
            <br />
            <label>
                <input name='isRepository' type='checkbox' checked={this.state.isRepository} onChange={this.handleCheckboxChange} />
                Repository
            </label>
            <br />
            <label>
                <input name='isReleases' type='checkbox' checked={this.state.isReleases} onChange={this.handleCheckboxChange} />
                Releases
            </label>
            <br />
            <label>
                <input name='isTeam' type='checkbox' checked={this.state.isTeam} onChange={this.handleCheckboxChange} />
                Team
            </label>
        </form>
    }

    getNotificationSettings() {
        if (this.props.activeOrg === null) return <p>Select organization.</p>
        if (this.state.isLoading) return <p>Loading...</p>
        return <form>
            <p>Choose how you would like to be notified.</p>
            <label>
                <input name='isEmail' type='checkbox' checked={this.state.isEmail} onChange={this.handleEmailChange} />
                <span> Email to </span>
                <input type='email' onChange={(event) => {this.setState({email: event.target.value, isEmail: false})}} defaultValue={this.state.email} />
            </label>
        </form>
    }

    render() {
        return(
            <div className='row'>
                <div className='col-md-12'>
                    <div className='cbox'>
                        <h1 className='cbox__title'>Subscriptions</h1>
                        {this.getSubscriptionSettings()}
                    </div>
                </div>
                <div className='col-md-12'>
                    <div className='cbox'>
                        <h1 className='cbox__title'>Notifications</h1>
                        {this.getNotificationSettings()}
                    </div>
                </div>
            </div>
        );
    }
}

export default Settings;
