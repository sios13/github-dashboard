import React from 'react';
import {
    BrowserRouter as Router,
    Route,
    NavLink
} from 'react-router-dom';
import queryString from 'query-string';

import Sidebar from './sidebar';
import Dashboard from './content/dashboard';
import Organisations from './content/organisations';
import Notifications from './content/notifications';

export class GithubDashboardApp extends React.Component {
    constructor(props) {
        super(props);

        let user = localStorage.getItem('user');
        this.state = {
            user: user,
            organizations: [],
            activeOrg: null,
            repos: []
        };
        this.baseUrl = "https://cnpqmk9lhh.execute-api.eu-central-1.amazonaws.com/prod";
    }

    async componentDidMount() {
        this.setState({organizations: await this.getOrganizations()});
    }

    getOrganizations() {
        let access_token = localStorage.getItem('access_token');
        let options = {
            method: 'post',
            body: JSON.stringify({access_token: access_token})
        };

        return fetch(this.baseUrl + '/organisations', options)
        .then((response) => { return response.json(); })
        .then((response) => {
            return response.message.map(organization => organization.organization.login);
        });
    }

    async onOrgChange(orgChoice) {
        await this.setState({activeOrg: orgChoice.value});
        await this.setState({repos: await this.getOrgRepos()});
        console.log(this.state.repos);
    }

    getOrgRepos() {
        let access_token = localStorage.getItem('access_token');
        let options = {
            method: 'GET'
            // body: JSON.stringify({access_token: access_token})
        };

        // return fetch(this.baseUrl + '/repos')
        return fetch('http://api.github.com/orgs/' + this.state.activeOrg + '/repos?access_token=' + access_token, options)
        .then(response => response.json())
        .then(response => {
            return response.map(repo => {
                console.log(repo);
                return {
                    name: repo.name,
                    description: repo.description
                }
            });
        });
    }

    login(user) {
        localStorage.setItem('user', JSON.stringify(user));
        this.setState({
            user: user
        });
    }

    logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        localStorage.removeItem('organizations');
        this.setState({user: null, organisations: null});
    }

    render() {
        return(
            <Router>
                <div className="container-fluid">
                    <div className="row">
                        <div className="sidebar col-md-2">
                            <Sidebar user={this.state.user} organizations={this.state.organizations} onOrgChange={this.onOrgChange.bind(this)}/>
                            <NavLink className="sidebar__item" activeClassName="sidebar__item--active" to="/" exact={true}>Dashboard</NavLink>
                            <NavLink className="sidebar__item" activeClassName="sidebar__item--active" to="/organisations">Organisations</NavLink>
                            <NavLink className="sidebar__item" activeClassName="sidebar__item--active" to="/notifications">Notifications</NavLink>
                            <NavLink className="sidebar__item" activeClassName="sidebar__item--active" to="/login">Login</NavLink>
                            <NavLink className="sidebar__item" activeClassName="sidebar__item--active" to="/logout">Logout</NavLink>
                        </div>
                        <div className="col-md-10 offset-md-2">
                            <Route exact path="/" render={props => <Dashboard orgName={this.state.activeOrg} repos={this.state.repos} {...props}/>}/>
                            <Route path="/organisations" render={props => <Organisations username={this.state.user.name} {...props}/>}/>
                            <Route path="/notifications" component={Notifications}/>
                            <Route path="/login" render={(props) => <Login login={this.login.bind(this)} {...props}/>}/>
                            <Route path="/logout" render={(props) => <Logout logout={this.logout.bind(this)} {...props}/>}/>
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
    constructor(props) {
        super(props);
        this.state = {
            login: "ingenting..."
        }
    }

    componentDidMount() {
        let githubCode = queryString.parse(this.props.location.search).code;
        if (githubCode) {
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
                let url = 'https://api.github.com/user?access_token=' + access_token;
                return fetch(url);
            })
            .then((response) => { return response.json(); })
            .then((response) => {
                let user = {
                    name: response.login,
                    img_url: response.avatar_url
                }
                this.props.login(user);
                console.log(JSON.parse(localStorage.getItem('user')).name);
            });
        }
    }

    render() {
        return(
            <div className="cbox row">
                <h1 className="cbox__title">Login</h1>
                <a href='https://github.com/login/oauth/authorize?client_id=460281c3aceac1aed9cd&amp;allow_signup=false&amp;scope=repo,user'>Login</a>
            </div>
        );
    }
}

class Logout extends React.Component {
    // syntetic event istället?
    constructor(props) {
        super(props);
        this.props.logout();
        this.props.history.push("/");
    }

    render() {
        return(<span></span>);
    }
}

export default GithubDashboardApp;
