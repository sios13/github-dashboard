import React from 'react';
import {
    BrowserRouter as Router,
    Route
} from 'react-router-dom';
import queryString from 'query-string';
import io from 'socket.io-client';

import Sidebar from './sidebar';
import Dashboard from './content/dashboard';
import Settings from './content/settings';

export class GithubDashboardApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            organizations: null,
            activeOrg: null,
            flashMsgs: [],
            hasUnreadNotifications: false
        };
        this.baseUrl = 'https://cnpqmk9lhh.execute-api.eu-central-1.amazonaws.com/prod';

        // this.io = io('localhost:3001');
        this.io = io('http://ec2-18-197-144-88.eu-central-1.compute.amazonaws.com:81/');
        this.io.on('webhook', function(data) {
            console.log('Message from socket server: ' + data);
            this.setState({hasUnreadNotifications: true});
            this.updateUser({hasUnreadNotifications: true}) // TODO gör detta på servern
        }.bind(this));
        this.io.on('connect', function() {
            console.log('Connected to socket server.');
        });
    }

    async componentDidMount() {
        let githubCode = queryString.parse(window.location.search).code;
        let access_token = localStorage.getItem('access_token');
        if (githubCode && !access_token) {
            await this.setAccessToken(githubCode);
        }

        if (localStorage.getItem('access_token')) {
            this.setState({isLoading: true});
            this.login();
            this.setState({isLoading: false});
        }
    }

    setNotificationsRead() {
        this.setState({hasUnreadNotifications: false});
    }

    setAccessToken(githubCode) {
        fetch('https://cnpqmk9lhh.execute-api.eu-central-1.amazonaws.com/prod/login', {
            method: 'post',
            body: JSON.stringify({
                code: githubCode
            })
        })
        .then((response) => { return response.json(); })
        .then((response) => {
            let access_token = JSON.parse(response.message).access_token;
            localStorage.setItem('access_token', access_token);
            this.login();
        });
    }

    addFlashMessage(type, text) {
        let remove = function(index) {
            let array = this.state.flashMsgs.filter(x => parseInt(x.key, 10) !== index);
            this.setState({flashMsgs: array});
        }
        let flashMsgDiv = <div className={type + ' flashMsg cbox'} onClick={remove.bind(this, this.state.flashMsgs.length)} key={this.state.flashMsgs.length}>
            {text}
            <div className='flashMsg__mini'>Click me to hide.</div>
        </div>;
        this.setState({
            flashMsgs: [flashMsgDiv, ...this.state.flashMsgs]
        });
    }

    /* ACTIVITY */
    getActivity(username, organization) {
        return fetch(this.baseUrl + '/activity/' + username + '/' + organization)
        .then(response => response.json())
        .then(response => response.activity)
    }

    updateActivity(username, organization, settings) {
        let options = {
            method: 'post',
            body: JSON.stringify(settings)
        }
        return fetch(this.baseUrl + '/activity/' + username + '/' + organization, options)
        .then(response => response.json())
        .then(response => console.log(response))
    }

    /* USER CRUD */
    getUser(username) {
        // username = username || this.state.user.username;
        return fetch(this.baseUrl + '/users/' + username)
        .then(response => response.json())
        .then(response => response.user);
    }

    createUser(settings) {
        console.log(settings);
        let options = {
            method: 'post',
            body: JSON.stringify(settings)
        }
        return fetch(this.baseUrl + '/users', options)
        .then(response => response.json())
        .then(response => response.user);
    }

    updateUser(settings) {
        let options = {
            method: 'post',
            body: JSON.stringify(settings)
        }
        return fetch(this.baseUrl + '/users/' + this.state.user.username, options)
        .then(response => response.json())
        .then(response => console.log(response));
    }

    /* NOTIFICATION CRUD */
    updateNotificationSetting(settings) {
        let options = {
            method: 'post',
            body: JSON.stringify(settings)
        }
        return fetch(this.baseUrl + '/notifications/' + this.state.user.username + '/' + this.state.activeOrg, options)
        .then(response => response.json())
        .then(response => console.log('Notification settings updated.'));
    }

    getNotificationSettings() {
        return fetch(this.baseUrl + '/notifications/' + this.state.user.username + '/' + this.state.activeOrg)
        .then(response => response.json())
        .then(response => response.data.Item);
    }

    /* SUBSCRIPTION CRUD */
    getSubscription() {
        return fetch(this.baseUrl + '/subscriptions/' + this.state.user.username + '/' + this.state.activeOrg)
        .then(response => response.json())
        .then(response => {
            console.log(response)
            return response.subscription
        })
    }

    updateSubscription(settings) {        
        let options = {method: 'post', body: JSON.stringify(settings)};
        return fetch(this.baseUrl + '/subscriptions/' + this.state.user.username + '/' + this.state.activeOrg, options)
        .then(response => response.json())
        .then(response => {console.log(response)});
    }

    addWebhook() {
        let access_token = localStorage.getItem('access_token');
        let user_name = this.state.user.username;
        let org_name = this.state.activeOrg;

        let options = {
            method: 'post',
            body: JSON.stringify({ access_token, user_name, org_name })
        };
        return fetch(this.baseUrl + '/addwebhook', options)
        .then(response => response.json())
        .then(response => {
            if (response.statusCode === 404) throw Error(404);
            return response;
        });
    }

    onOrgChange(orgChoice) {
        this.setState({activeOrg: orgChoice.value});
    }

    makeOrganizations() {
        // return fetch(this.baseUrl + '/organisations', options)
        let access_token = localStorage.getItem('access_token');
        return fetch('http://api.github.com/user/orgs?access_token=' + access_token)
        .then(response => {
            if (response.ok === false) throw Error();
            return response.json();
        })
        .then(response => {
            let organizations = response.map(org => {
                return {
                    name: org.login,
                    description: org.description,
                    url: org.html_url
                }
            });
            this.setState({organizations: organizations});
        })
        .catch(error => this.setState({organizations: []}));
    }

    makeUser() {
        // return fetch(this.baseUrl + '/user')
        // TODO hämta in user från github om hen redan finns i databasen
        let access_token = localStorage.getItem('access_token');
        return fetch('https://api.github.com/user?access_token=' + access_token)
        .then(response => {
            if (response.ok === false) throw Error();
            return response.json();
        })
        .then(async response => {
            let user = await this.getUser(response.login);
            if (user == null)
                user = await this.createUser({username: response.login, img_url: response.avatar_url, email: response.email});
            await this.setState({user: user});
        })
        .catch(error => this.setState({user: {}}));
    }

    login() {
        return Promise.all([this.makeUser(), this.makeOrganizations()])
        .then(result => {
            if (localStorage.getItem('access_token')) {
                this.io.emit('room', this.state.user.username);
            }
        })
    }

    logout() {
        localStorage.removeItem('access_token');
        this.setState({user: {}, organizations: [], activeOrg: null});
    }

    handleRender() {
        if (localStorage.getItem('access_token')) {
            return <div className='row'>
                <div className='sidebar col-md-2'>
                    <Sidebar
                        user={this.state.user}
                        organizations={this.state.organizations}
                        onOrgChange={this.onOrgChange.bind(this)}
                        activeOrg={this.state.activeOrg}
                        hasUnreadNotifications={this.state.hasUnreadNotifications}
                    />
                </div>
                <div className='col-md-10 offset-md-2'>
                    <div className='flash'>{this.state.flashMsgs}</div>
                </div>
                <div className='col-md-10 offset-md-2'>
                    <Route exact path='/' render={props => <Dashboard
                        activeOrg={this.state.activeOrg}
                        user={this.state.user}
                        updateUser={this.updateUser.bind(this)}
                        getActivity={this.getActivity.bind(this)}
                        updateActivity={this.updateActivity.bind(this)}
                        setNotificationsRead={this.setNotificationsRead.bind(this)}
                        {...props}/>
                    }/>
                    <Route path='/settings' render={props => <Settings
                        user={this.state.user}
                        activeOrg={this.state.activeOrg}
                        addWebhook={this.addWebhook.bind(this)}
                        getSubscription={this.getSubscription.bind(this)}
                        getNotificationSettings={this.getNotificationSettings.bind(this)}
                        updateNotificationSetting={this.updateNotificationSetting.bind(this)}
                        updateUser={this.updateUser.bind(this)}
                        updateSubscription={this.updateSubscription.bind(this)}
                        addFlashMessage={this.addFlashMessage.bind(this)}
                        {...props}
                    />}/>
                    <Route path='/logout' render={(props) => <Logout logout={this.logout.bind(this)} {...props}/>}/>
                </div>
            </div>
        }
        else {
            return <div className='row'>
                <div className='col-md-4 offset-md-4 col-sm-12'>
                    <div className='cbox loginbox'>
                        <h1 className='cbox__title'>Github Dashboard</h1>
                        <p>View your organizations and subscribe to events.</p>
                        <p>
                            <a className='btn btn-info' href='https://github.com/login/oauth/authorize?client_id=460281c3aceac1aed9cd&amp;allow_signup=false&amp;scope=repo,user,admin:org_hook'>Login with Github</a>
                        </p>
                    </div>
                    <p className='loginbox__byline'>Made by <a href='http://github.com/sios13'>Simon Österdahl</a></p>
                </div>
            </div>
        }
    }

    render() {
        return(
            <Router>
                <div className='container-fluid'>
                    {this.handleRender()}
                </div>
            </Router>
        );
    }
}

class Logout extends React.Component {
    // syntetic event istället?
    constructor(props) {
        super(props);
        this.props.logout();
        this.props.history.push('/');
    }

    render() {
        return(<span></span>);
    }
}

export default GithubDashboardApp;
