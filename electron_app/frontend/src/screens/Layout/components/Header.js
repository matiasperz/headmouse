import React from 'react';

const Header = props => {
    return (
        <div className="column">
            <h1 className="font-montserrat">{props.title}</h1>
            <h2 className="font-montserrat">{props.description}</h2>
        </div>
    );
};

export default Header;