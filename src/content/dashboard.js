import React from 'react';

export class Dashboard extends React.Component {
    constructor(props) {
        super(props);
    }

    makeRepos() {
        return this.props.repos.map(repo => {
            return <div className='organisation col-md-6'>
                <h2 className='organisation__title'>{repo.name}</h2>
                <p className='organisation__description'>{repo.description}</p>
            </div>
        });
    }

    render() {
        return(
            <div className="cbox row">
                <h1 className="cbox__title">Repos belonging to {this.props.orgName}</h1>
                {this.makeRepos()}
            </div>
        );
    }
}

export default Dashboard;
