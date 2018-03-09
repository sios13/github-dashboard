import React from 'react';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import { NavLink } from 'react-router-dom';
import FontAwesome from 'react-fontawesome';

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
                <NavLink className='sidebar__item' activeClassName='sidebar__item--active' to='/' exact={true}><FontAwesome name='rocket' />Dashboard</NavLink>
                <NavLink className='sidebar__item' activeClassName='sidebar__item--active' to='/settings'>Settings</NavLink>
                <NavLink className='sidebar__item' activeClassName='sidebar__item--active' to='/respositories'>Repositories</NavLink>
                <NavLink className='sidebar__item' activeClassName='sidebar__item--active' to='/members'>Members</NavLink>
                <NavLink className='sidebar__item' activeClassName='sidebar__item--active' to='/login'>Login</NavLink>
                <NavLink className='sidebar__item' activeClassName='sidebar__item--active' to='/logout'>Logout</NavLink>
            </div>
        );
    }
}

function User(props) {
    function getUserName() {
        if (props.user) return props.user.username;
        else return '';
    }

    function getImgUrl() {
        if (props.user && props.user.img_url) return props.user.img_url;
        else return '/logout_image.png';
    }

    return (
        <div className='sidebar__user'>
            <img src={getImgUrl()} alt={getUserName()} className='sidebar__image' />
            <span className='sidebar__usertext'>{getUserName()}</span>
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
