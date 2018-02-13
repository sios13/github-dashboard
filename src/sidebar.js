import React from 'react';

export class Sidebar extends React.Component {
    render() {
        return(
            <div>
                <div className="sidebar__title">Github Dashboard</div>
                <img src={this.props.user.img_url} alt={this.props.user.name} className="sidebar__image" />
                <div className="sidebar__user">{this.props.user.name}</div>
            </div>
        );
    }
}

export default Sidebar;
