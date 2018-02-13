import React from 'react';
import {
    BrowserRouter as Router,
    Route,
    NavLink,
    Nav
} from 'react-router-dom';
import queryString from 'query-string';

import Sidebar from './sidebar';
import Home from './content/home';
import Organisations from './content/organisations';
import Notifications from './content/notifications';

export class GithubDashboardApp extends React.Component {
    constructor(props) {
        super(props);
        let user = JSON.parse(localStorage.getItem('user'));
        if (user === null) {
            this.state = {
                user: {
                    name: 'Not logged in',
                    img_url: '/logout_image.png'
                }
            }
        }
        else {
            this.state = {
                user: user
            }
        }
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
        this.setState({
            user: {
                name: 'Not logged in',
                img_url: '/logout_image.png'
            }
        });
    }

    render() {
        return(
            <Router>
                <div className="container-fluid">
                    <div className="row">
                        <div className="sidebar col-md-2">
                            <Sidebar user={this.state.user} />
                            <NavLink className="sidebar__item sidebar__item--title" to="/">Dashboard</NavLink>
                            <NavLink className="sidebar__item" activeClassName="sidebar__item--active" to="/organisations">Organisations</NavLink>
                            <NavLink className="sidebar__item" to="/notifications">Notifications</NavLink>
                            <NavLink className="sidebar__item" to="/login">Login</NavLink>
                            <NavLink className="sidebar__item" to="/logout">Logout</NavLink>
                        </div>
                        <div className="col-md-10 offset-md-2">
                            <Route exact path="/" component={Home}/>
                            <Route path="/organisations" component={Organisations}/>
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
        console.log(this.props);
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
        else {
            console.log("nej");
        }
    }

    componentDidMount() {
        // fetch('https://github.com/login/oauth/authorize?client_id=460281c3aceac1aed9cd')
        // .then((response) => console.log(response));
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
