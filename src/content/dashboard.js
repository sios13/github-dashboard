import React from 'react';
import FontAwesome from 'react-fontawesome';

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
        if (this.props.activeOrg) {
            this.getOrg();
            if (this.props.user !== null) this.getEvents();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.activeOrg !== this.props.activeOrg && this.props.user !== null) {
            this.getEvents();
            this.getOrg();
        }
    }

    async getEvents() {
        this.setState({events: <p><FontAwesome name='fas fa-spinner' spin /> <i>Loading events...</i></p>});

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
            events.sort(function(a,b) {return (b.time > a.time) ? 1 : ((a.time > b.time) ? -1 : 0);} );
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
                if (event.type === 'team') text = 'Created, deleted or modified a team.'
                return <div className={'event' + (event.time > userLastActive ? ' event--highlight' : '')} key={i}>
                    <img className='event__image' src={event.body.sender.avatar_url} alt='Sender' />
                    <span className='event__time'>{test.toLocaleDateString() + ' ' + test.toLocaleTimeString()}</span>
                    <span className='event__type'>{text}</span>
                    <span className='event__user'>by <a href={event.body.sender.html_url}>{event.body.sender.login}</a></span>
                </div>
            });
            if (eventsHtml.length === 0) eventsHtml = <p><i>No events found.</i></p>
            this.setState({events: eventsHtml});
        })

        let date = new Date();
        let time = date.getTime();
        this.props.updateActivity(this.props.user.username, this.props.activeOrg, {time: time});
        this.props.setNotificationsRead();
        this.props.updateUser({hasUnreadNotifications: false})
        // await this.props.updateUser({active: 123});
    }

    getOrg() {
        this.setState({org: <p><FontAwesome name='fas fa-spinner' spin /> <i>Loading organization...</i></p>});

        fetch('http://api.github.com/orgs/' + this.props.activeOrg)
        .then(response => response.json())
        .then(org => {
            let orgHtml = <div>
                <h1 className='cbox__title'>{org.name || org.login}</h1>
                <p>{org.description}</p>
                <p>{org.location}</p>
            </div>
            this.setState({org: orgHtml});
        })
    }

    handleRender() {
        if (this.props.activeOrg) {
            return <div className='row'>
                <div className='col-md-6 col-sm-12'>
                    <div className='cbox'>
                        {this.state.org}
                    </div>
                </div>
                <div className='col-md-6 col-sm-12'>
                    <div className='cbox'>
                        <h1 className='cbox__title'>Flow</h1>
                        <p>Events you have received.</p>
                        {this.state.events}
                    </div>
                </div>
            </div>
        }
        else {
            return <div className='row'>
                <div className='col-md-12'>
                    <div className='cbox'>
                        <h1 className='cbox__title'>Dashboard</h1>
                        <p><i>Select an organization.</i></p>
                    </div>
                </div>
            </div>
        }
    }

    render() {
        return(
            this.handleRender()
        );
    }
}

export default Dashboard;
