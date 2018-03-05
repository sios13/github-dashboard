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
            isTeam: false // Any time a team is created, deleted, modified, or added to or removed from a repository. Organization hooks only.
        }
        this.baseUrl = 'https://cnpqmk9lhh.execute-api.eu-central-1.amazonaws.com/prod';
        this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    }

    componentDidMount() {
        // load subscription settings
        // this.props.getSubscription();
    }

    async componentDidUpdate(prevProps, prevState) {
        if (prevProps.user !== this.props.user || prevProps.activeOrg !== this.props.activeOrg) {
            if (this.props.user !== null && this.props.activeOrg !== null) {
                let subscription = await this.props.getSubscription() || {};
                console.log(subscription);
                let isFork = subscription.isFork ? true : false;
                let isMember = subscription.isMember ? true : false;
                let isMembership = subscription.isMembership ? true : false;
                let isOrganization = subscription.isOrganization ? true : false;
                let isPublic = subscription.isPublic ? true : false;
                let isPush = subscription.isPush ? true : false;
                let isRepository = subscription.isRepository ? true : false;
                let isReleases = subscription.isReleases ? true : false;
                let isTeam = subscription.isTeam ? true : false;
                this.setState({isFork, isMember, isMembership, isOrganization, isPublic, isPush, isRepository, isReleases, isTeam});
            }
        }
    }

    // access_token 234d0560ec9b996f4286e7eab6f76a3e0c067c6a
    async handleCheckboxChange(event) {
        const target = event.target;

        const isChecked = target.checked;
        const name = target.name;
        await this.setState({[name]: isChecked})

        let addSubscriptionPromise = this.props.addSubscription([
            this.state.isFork,
            this.state.isMember,
            this.state.isMembership,
            this.state.isOrganization,
            this.state.isPublic,
            this.state.isPush,
            this.state.isRepository,
            this.state.isReleases,
            this.state.isTeam
        ]);
        let addWebhookPromise = this.props.addWebhook();
        Promise.all([addSubscriptionPromise, addWebhookPromise])
        .then(result => console.log('subscription and webhook added/updated.'))
        .catch(error => {
            if (error.message === '404') return console.log('Unable to subscribe to this organization.');
            console.log('error when adding subscription and webook.')
        })
    }

    render() {
        return(
            <div className='row'>
                <div className='col-md-12'>
                    <div className='cbox'>
                        <h1 className='cbox__title'>Subscriptions</h1>
                        <p>Choose the events you want to subscribe to.</p>
                        <form>
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
                    </div>
                </div>
                <div className='col-md-12'>
                    <div className='cbox'>
                        <h1 className='cbox__title'>Notifications</h1>
                    </div>
                </div>
            </div>
        );
    }
}

export default Settings;
