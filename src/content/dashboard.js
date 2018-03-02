import React from 'react';

export class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            repos: []
        }
    }

    componentDidMount() {
        this.makeRepos();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.activeOrg !== this.props.activeOrg) {
            this.makeRepos();
        }
    }

    makeRepos() {
        let access_token = localStorage.getItem('access_token');
        // return fetch(this.baseUrl + '/repos', options)
        fetch('http://api.github.com/orgs/' + this.props.activeOrg + '/repos?access_token=' + access_token)
        .then(response => {
            if (response.ok === false) throw Error();
            return response.json()
        })
        .then(response => {
            let repos = response.map((repo, i) => {
                return <div key={i} className='repo'>
                    <div className='repo__name'>{repo.name}</div>
                    {/* <div className='repo__desc'>{repo.description}</div> */}
                </div>;
            });
            this.setState({repos: repos});
        })
        .catch(error => this.setState({repos: <p>No repos found.</p>}));
    }

    render() {
        return(
            <div className='row'>
                <div className='col-md-6 col-sm-12'>
                    <div className='cbox'>
                        <h1 className='cbox__title'>{this.props.activeOrg}</h1>
                        <button onClick={this.props.addSubscription}>Subscribe to all actions in {this.props.activeOrg}</button>
                    </div>
                </div>
                <div className='col-md-6 col-sm-12'>
                    <div className='cbox'>
                        <h1 className='cbox__title'>Repos</h1>
                        {this.state.repos}
                    </div>
                </div>
            </div>
        );
    }
}

export default Dashboard;
