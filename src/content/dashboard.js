import React from 'react';

export class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            org: null,
            events: null
        }
        this.baseUrl = 'https://cnpqmk9lhh.execute-api.eu-central-1.amazonaws.com/prod';
    }

    componentDidMount() {
        // this.makeRepos();
        // this.getEvents();
        this.getOrg();
        if (this.props.user !== null) this.getEvents();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.activeOrg !== this.props.activeOrg && this.props.user !== null) {
            this.getEvents();
            this.getOrg();
        }
    }

    async getEvents() {
        // let userLastActive = this.props.user.active || 0;
        let activity = await this.props.getActivity(this.props.user.username, this.props.activeOrg)
        activity = activity[0] || {};
        let userLastActive = activity.time || 0;

        await fetch(this.baseUrl + '/events/' + this.props.activeOrg + '/' + this.props.user.username)
        .then(response => response.json())
        .then(response => {
            let events = response.events.map(event => {
                return {
                    type: event.type,
                    body: JSON.parse(event.body),
                    organization: event.organization,
                    time: event.time
                }
            });
            let eventsHtml = events.map((event, i) => {
                let test = new Date(event.time);
                let text = '';
                if (event.type === 'fork') text = 'Forked a repository.'
                if (event.type === 'member') text = 'Added, removed or modified a collaborator.'
                if (event.type === 'membership') text = 'Added or removed a user from a team.'
                if (event.type === 'organization') text = 'Added, removed or invited user to organization.'
                if (event.type === 'public') text = 'Made a repository public.'
                if (event.type === 'push') text = 'Made a push to a reposotory.'
                if (event.type === 'repository') text = 'Made a change to a repository.'
                if (event.type === 'release') text = 'Made a release.'
                if (event.type === 'team') text = 'Created, deleted, modified a team.'
                return <div className={'event' + (event.time > userLastActive ? ' event--highlight' : '')} key={i}>
                    <img className='event__image' src={event.body.sender.avatar_url} alt='Sender' />
                    <span className='event__time'>{test.toLocaleDateString() + ' ' + test.toLocaleTimeString()}</span>
                    <span className='event__type'>{text}</span>
                    <span className='event__user'>by <a href={event.body.sender.html_url}>{event.body.sender.login}</a></span>
                </div>
            });
            this.setState({events: eventsHtml});
        })

        let date = new Date();
        let time = date.getTime();
        this.props.updateActivity(this.props.user.username, this.props.activeOrg, {time: time});
        // await this.props.updateUser({active: 123});
    }

    getOrg() {
        fetch('http://api.github.com/orgs/' + this.props.activeOrg)
        .then(response => response.json())
        .then(org => {
            let orgHtml = <div className='cbox'>
                <h1 className='cbox__title'>{org.name || org.login}</h1>
                <p>{org.description}</p>
                <p>{org.location}</p>
            </div>
            this.setState({org: orgHtml});
        })
    }

    render() {
        return(
            <div className='row'>
                <div className='col-md-6 col-sm-12'>
                    {this.state.org}
                </div>
                <div className='col-md-6 col-sm-12'>
                    <div className='cbox'>
                        <h1 className='cbox__title'>Flow</h1>
                        <p>Events you have received.</p>
                        {this.state.events}
                    </div>
                </div>
            </div>
        );
    }
}

export default Dashboard;
