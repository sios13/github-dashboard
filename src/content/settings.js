import React from 'react';

export class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isReleases: false,
            isCommits: false
        }
        this.baseUrl = 'https://cnpqmk9lhh.execute-api.eu-central-1.amazonaws.com/prod';
        this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    }

    componentDidMount() {
        // load subscription settings
        // this.props.getSubscription();
    }

    async componentDidUpdate(prevProps, prevState) {
        if (prevProps.user !== this.props.user || prevProps.activeOrg !== this.props.activeOrg) {
            if (this.props.user !== null && this.props.activeOrg !== null) {
                let subscription = await this.props.getSubscription();
                let isReleases = subscription.Releases;
                let isCommits = subscription.Commits;
                console.log(subscription);
                console.log(isReleases + ' : ' + isCommits);
                this.setState({isReleases: isReleases, isCommits: isCommits});
            }
        }
    }

    // access_token 234d0560ec9b996f4286e7eab6f76a3e0c067c6a
    async handleCheckboxChange(event) {
        const target = event.target;

        const isChecked = target.checked;
        const name = target.name;
        await this.setState({[name]: isChecked})

        this.props.addSubscription([this.state.isReleases, this.state.isCommits]);
    }

    render() {
        return(
            <div className='row'>
                <div className='col-md-12'>
                    <div className='cbox'>
                        <h1 className='cbox__title'>What</h1>
                        <form>
                            <label>
                                <input
                                    name="isReleases"
                                    type="checkbox"
                                    checked={this.state.isReleases}
                                    onChange={this.handleCheckboxChange}
                                />
                                New releases
                            </label>
                            <br />
                            <label>
                                <input
                                    name="isCommits"
                                    type="checkbox"
                                    checked={this.state.isCommits}
                                    onChange={this.handleCheckboxChange}
                                />
                                New commits
                            </label>
                        </form>
                    </div>
                </div>
                <div className='col-md-12'>
                    <div className='cbox'>
                        <h1 className='cbox__title'>How</h1>
                    </div>
                </div>
            </div>
        );
    }
}

export default Settings;
