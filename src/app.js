import React from 'react';
import {
    BrowserRouter as Router,
    Route,
    NavLink
} from 'react-router-dom';
import queryString from 'query-string';
import io from 'socket.io-client';

import Sidebar from './sidebar';
import Dashboard from './content/dashboard';
import Organisations from './content/organisations';
import Notifications from './content/notifications';

export class GithubDashboardApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: {},
            organizations: [],
            activeOrg: null,
            flashMsg: ''
        };
        this.baseUrl = 'https://cnpqmk9lhh.execute-api.eu-central-1.amazonaws.com/prod';
    }

    componentDidMount() {
        this.login();
        const socket = io('http://localhost:3001');
        socket.on('webhook', function(test) {
            console.log(test);
        });
    }

    addSubscription() {
        let user_name = this.state.user.name;
        let org_name = this.state.activeOrg;
        let access_token = localStorage.getItem('access_token');
        let options = {
            method: 'post',
            body: JSON.stringify({ user_name, org_name, access_token })
        };

        fetch(this.baseUrl + '/subscribe', options)
        .then(response => response.json())
        .then(response => {
            if (response.statusCode === 422) this.setState({flashMsg: 'You are already subscribed.'});
            if (response.statusCode === 404) this.setState({flashMsg: 'Unable to add subscription.'});
            if (response.statusCode === 201) this.setState({flashMsg: 'You are now subscribed to ' + this.state.activeOrg + '.'});
            console.log(response)
        });
    }

    onOrgChange(orgChoice) {
        this.setState({activeOrg: orgChoice.value});
    }

    makeOrganizations(access_token) {
        // return fetch(this.baseUrl + '/organisations', options)
        return fetch('http://api.github.com/user/orgs?access_token=' + access_token)
        .then(response => {
            if (response.ok === false) throw Error();
            return response.json();
        })
        .then(response => {
            let organizations = response.map(organization => organization.login);
            this.setState({organizations: organizations});
        })
        .catch(error => this.setState({organizations: []}));
    }

    makeUser(access_token) {
        // return fetch(this.baseUrl + '/user')
        return fetch('https://api.github.com/user?access_token=' + access_token)
        .then(response => {
            if (response.ok === false) throw Error();
            return response.json();
        })
        .then(response => {
            let user = {name: response.login, img_url: response.avatar_url};
            this.setState({user: user});
        })
        .catch(error => this.setState({user: {}}));
    }

    login() {
        let access_token = localStorage.getItem('access_token');
        Promise.all([this.makeUser(access_token), this.makeOrganizations(access_token)]);
    }

    logout() {
        localStorage.removeItem('access_token');
        this.setState({user: {}, organizations: [], activeOrg: null});
    }

    render() {
        return(
            <Router>
                <div className='container-fluid'>
                    <div className='row'>
                        <div className='sidebar col-md-2'>
                            <Sidebar user={this.state.user} organizations={this.state.organizations} onOrgChange={this.onOrgChange.bind(this)} activeOrg={this.state.activeOrg}/>
                            <NavLink className='sidebar__item' activeClassName='sidebar__item--active' to='/' exact={true}>Dashboard</NavLink>
                            <NavLink className='sidebar__item' activeClassName='sidebar__item--active' to='/organisations'>Organisations</NavLink>
                            <NavLink className='sidebar__item' activeClassName='sidebar__item--active' to='/notifications'>Notifications</NavLink>
                            <NavLink className='sidebar__item' activeClassName='sidebar__item--active' to='/login'>Login</NavLink>
                            <NavLink className='sidebar__item' activeClassName='sidebar__item--active' to='/logout'>Logout</NavLink>
                        </div>
                        <div className='col-md-10 offset-md-2'>
                            <div className='alert'><p>{this.state.flashMsg}</p></div>
                            <Route exact path='/' render={props => <Dashboard activeOrg={this.state.activeOrg} addSubscription={this.addSubscription.bind(this)} {...props}/>}/>
                            <Route path='/organisations' render={props => <Organisations username={this.state.user.name} {...props}/>}/>
                            <Route path='/notifications' component={Notifications}/>
                            <Route path='/login' render={(props) => <Login login={this.login.bind(this)} {...props}/>}/>
                            <Route path='/logout' render={(props) => <Logout logout={this.logout.bind(this)} {...props}/>}/>
                        </div>
                    </div>
                </div>
            </Router>
        );
    }
}

// click link with client_id -> github login -> github get client url with code (?code=123123123)
// -> client post code to server -> server use code, client_id, client_secret to get access_token -> access_token to client!
class Login extends React.Component {
    componentDidMount() {
        let githubCode = queryString.parse(this.props.location.search).code;
        let access_token = localStorage.getItem('access_token');
        if (githubCode && !access_token) {
            this.getAccessToken(githubCode);
        }
    }

    getAccessToken(githubCode) {
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
            this.props.login();
        });
    }

    render() {
        return(
            <div className='cbox row'>
                <h1 className='cbox__title'>Login</h1>
                <a href='https://github.com/login/oauth/authorize?client_id=460281c3aceac1aed9cd&amp;allow_signup=false&amp;scope=repo,user,admin:org_hook'>Login</a>
            </div>
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
