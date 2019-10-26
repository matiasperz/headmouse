import React from 'react';

import './styles/Section.css';

const Section = props => {
    return (
        <div
            className={`section ${props.disabled === true ?  'transparent' : 'hoverable'}`}>
            <h1 className="title" >{props.title}</h1>
            <div>
                {props.children}
            </div>
        </div>
    );
};

export default Section;