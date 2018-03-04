import React from 'react';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

export class Sidebar extends React.Component {
    render() {
        return(
            <div>
                <div className='sidebar__title'>Github Dashboard</div>
                <User user={this.props.user} />
                <OrganizationsDropDown
                    organizations={this.props.organizations}
                    onOrgChange={this.props.onOrgChange}
                    activeOrg={this.props.activeOrg}
                />
            </div>
        );
    }
}

function User(props) {
    function getUserName() {
        if (props.user) return props.user.name;
        else return '';
    }

    function getImgUrl() {
        if (props.user) return props.user.img_url;
        else return '/logout_image.png';
    }

    return (
        <div className='sidebar__user'>
            <img src={getImgUrl()} alt={getUserName()} className='sidebar__image' />
            <span>{getUserName()}</span>
        </div>
    );
}

function OrganizationsDropDown(props) {
    function makeOrgs(orgs) {
        if (orgs === null) return [];
        return orgs.map(org => {
            return { value: org, label: org }
        });
    }

    return (
        <Dropdown
            className='sidebar__dropdown'
            options={makeOrgs(props.organizations)}
            onChange={props.onOrgChange}
            value={props.activeOrg}
            placeholder='- Select org -'
        />
    );
}

export default Sidebar;
