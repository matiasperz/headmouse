import React from 'react';

import './styles/InfoModal.css';

const InfoModal = (props) => {
    return (
        <div className="info-container">
            <div className="info-header">
                <h2>INFO</h2>
                <svg onClick={()=>{ props.infoPrinter(null) }} className="close" xmlns="http://www.w3.org/2000/svg" width="14.893" height="14.893" viewBox="0 0 14.893 14.893">
                    <g id="Cross" transform="translate(1.061 1.061)">
                        <line id="Line_11" data-name="Line 11" y1="12.772" x2="12.772" fill="none" stroke="#fff" stroke-width="3"/>
                        <line id="Line_12" data-name="Line 12" x2="12.772" y2="12.772" fill="none" stroke="#fff" stroke-width="3"/>
                    </g>
                </svg>
            </div>
            <div className="info-content">
                <h3>
                    {props.message}
                </h3>
            </div>
        </div>
    );
};

export default InfoModal;