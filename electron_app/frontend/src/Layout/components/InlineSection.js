import React from 'react';

import './styles/InlineSection.css';

const InlineSection = props => {
    return (
        <div
            className={`inline-section ${props.disabled === true ?  'transparent' : 'hoverable'}`}>
            <h2 className="title" >{props.title}</h2>
            <div>
                {props.children}
            </div>
        </div>
    );
};

export default InlineSection;