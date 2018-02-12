import React from 'react';
import ReactDOM from 'react-dom';
import {
    BrowserRouter as Router,
    Route,
    Link
} from 'react-router-dom'
import './index.css';
import queryString from 'query-string';

class GithubDashboard extends React.Component {
    render() {
        return(
            <Router>
                <div className="container-fluid">
                    <div className="row">
                        <div className="sidebar col-md-2">
                            <div className="sidebar__title">Github Dashboard</div>
                            <img src="https://avatars3.githubusercontent.com/u/5879360" alt="sios13" className="sidebar__image" />
                            <div className="sidebar__user">sios13</div>
                            <Link className="sidebar__item sidebar__item--title" to="/">Dashboard</Link>
                            <Link className="sidebar__item" to="/organisations">Organisations</Link>
                            <Link className="sidebar__item" to="/login">Login</Link>
                        </div>
                        <div className="col-md-10 col-md-offset-2">
                            <Route exact path="/" component={Home}/>
                            <Route path="/organisations" component={Organisations}/>
                            <Route path="/login" component={Login}/>
                        </div>
                    </div>
                </div>
            </Router>
        );
    }
}

class Home extends React.Component {
    render() {
        return(
            <div className="cbox row">
                <h1 className="cbox__title">Home</h1>
            </div>
        );
    }
}

class Organisations extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            organisations: [<p key="0">Loading organisations...</p>]
        }
        this.baseUrl = "https://cnpqmk9lhh.execute-api.eu-central-1.amazonaws.com/prod";
    }

    componentDidMount() {
        this.getOrganisations();
    }

    // access_token 089bf2bf9968431a5e4149c41feba90ca5ee70ec
    getOrganisations() {
        let options = {
            method: "post",
            body: JSON.stringify({
                github_name: "sios13",
                access_token: "60b450218afa40a5bc238e40ad47704cb93a1f2c"
            })
        };

        fetch(this.baseUrl + '/organisations', options)
        .then((response) => { return response.json(); })
        .then((response) => {
            this.updateOrganisations(response.message);
        })
    }

    updateOrganisations(organisationsNew) {
        organisationsNew.forEach((organisation, index, organisations) => {
            organisations[index] = <Organisation key={index} organisation={organisation}/>
        });
        this.setState({organisations: organisationsNew});
    }

    render() {
        return(
            <div className="cbox row">
                <h1 className="cbox__title">Organisations</h1>
                {this.state.organisations}
            </div>
        );
    }
}

function Organisation(props) {
    let org = props.organisation.organization;
    // let user = props.organisation.user;
    return (
        <div className="organisation col-md-6">
            <img src={org.avatar_url} alt={org.description} className="organisation__image" />
            <h2 className="organisation__title">{org.login}</h2>
            <p className="organisation__description">{org.description}</p>
        </div>
    );
}
// click link with client_id -> github login -> github get client url with code (?code=123123123)
// -> client post code to server -> server use code, client_id, client_secret to get access_token -> access_token to client!
class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            login: "ingenting..."
        }

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
                console.log(access_token);
                // spara access_token i session
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
                <a href='https://github.com/login/oauth/authorize?client_id=460281c3aceac1aed9cd'>Login</a>
            </div>
        );
    }
}

ReactDOM.render(
    <GithubDashboard />,
    document.getElementById('root')
);
