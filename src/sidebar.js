import React from 'react';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

export class Sidebar extends React.Component {
    render() {
        return(
            <div>
                <div className="sidebar__title">Github Dashboard</div>
                <User user={this.props.user} />
                <OrganizationsDropDown organizations={this.props.organizations} onOrgChange={this.props.onOrgChange}/>
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
        <div className="sidebar__user">
            <img src={getImgUrl()} alt={getUserName()} className="sidebar__image" />
            <span>{getUserName()}</span>
        </div>
    );
}

function OrganizationsDropDown(props) {
    function getPreparedOrgs() {
        return props.organizations.map(org => {
            return { value: org, label: org }
        });
    }

    return (
        <Dropdown options={getPreparedOrgs()} onChange={props.onOrgChange} value={getPreparedOrgs()[0]} placeholder="Select an option" />
    );
}

export default Sidebar;
