import React from 'react';
import ReactDOM from 'react-dom';
import {
    BrowserRouter as Router,
    Route,
    Link
} from 'react-router-dom'
import './index.css';

class GithubDashboard extends React.Component {
    render() {
        return(
            <Router>
                <div className="container-fluid">
                    <div className="row">
                        <div className="sidebar col-md-2">
                            <div className="sidebar__title">Github Dashboard</div>
                            <img src="https://avatars3.githubusercontent.com/u/5879360" alt="" className="sidebar__image"></img>
                            <div className="sidebar__user">sios13</div>
                            <Link className="sidebar__item sidebar__item--title" to="/">Dashboard</Link>
                            <Link className="sidebar__item" to="/organisations">Organisations</Link>
                            <Link className="sidebar__item" to="/test">Test</Link>
                        </div>
                        <div className="col-md-10 col-md-offset-2">
                            <Route exact path="/" component={Home}/>
                            <Route path="/organisations" component={Organisations}/>
                            <Route path="/test" component={Test}/>
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
        this.getOrganisations();
    }

    // access_token 089bf2bf9968431a5e4149c41feba90ca5ee70ec
    getOrganisations() {
        let options = {
            method: "post",
            body: JSON.stringify({
                github_name: "sios13",
                access_token: "089bf2bf9968431a5e4149c41feba90ca5ee70ec"
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

class Test extends React.Component {
    render() {
        return(
            <div className="cbox row">
                <h1 className="cbox__title">Test</h1>
            </div>
        );
    }
}

ReactDOM.render(
    <GithubDashboard />,
    document.getElementById('root')
);
