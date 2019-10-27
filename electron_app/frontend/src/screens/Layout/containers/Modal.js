import React from 'react';
import ReactDOM from 'react-dom';

import './Modal.css';

function Modal(props){
    if(!props.isActive){
        return null;
    }

    return ReactDOM.createPortal(
        <div className="Modal">
            <div className="Modal__container">
                { props.children }
            </div>
        </div>
        , document.getElementById('modal')
    );
}

export default Modal;
