import React from 'react';

import './styles/Styles.css'

const Section = props => {
    return (
        <div
            className={`section ${props.disabled === true ?  'transparent' : 'hoverable'}`}>
            {props.children}
        </div>
    );
};

export default Section;