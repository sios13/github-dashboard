import React from 'react';

export class Organisations extends React.Component {
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
        let access_token = localStorage.getItem('access_token');
        console.log(access_token);
        let options = {
            method: "post",
            body: JSON.stringify({
                github_name: "sios13",
                access_token: access_token
            })
        };

        fetch(this.baseUrl + '/organisations', options)
        .then((response) => { return response.json(); })
        .then((response) => {
            console.log(response.message);
            if (Array.isArray(response.message)) {
                this.updateOrganisations(response.message);
            }
            else {
                this.setState({
                    organisations: [<p key="0">No organisations found.</p>]
                });
            }
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

export default Organisations;
