import React from 'react';

import './styles/ModuleItem.css';

const ModuleItem = (props) => {
    return (
        <div disabled={props.disabled} className={`container ${props.active ? 'active' : ''}`}>
            <div onClick={props.onClick} className="img-container" >
                <img src={props.image} alt="module-logo"/>
            </div>
            <h4 className="text">{props.name}</h4>
        </div>
    );
}

export default ModuleItem;