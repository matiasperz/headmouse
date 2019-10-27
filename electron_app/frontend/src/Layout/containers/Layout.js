import React, { Component } from 'react';

import Section from '../components/Section';
import InlineSection from '../components/InlineSection';
import Modal from './Modal';
import ErrorModal from '../components/ErrorModal';
import ModuleItem from '../components/ModuleItem';
import { CircleSlider } from 'react-circle-slider';
import Switch from 'react-switch';
import Select from 'react-select';

import anteojosImage from '../../assets/images/Anteojos.png';
import automaticImage from '../../assets/images/A.png';
import buttonsImage from '../../assets/images/Buttons.png';

import serialport from '../../utils/serialport';

import './Layout.css'

class Layout extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            click: 'AUTO_CLICK',
            sensibility: 0,
            delay: 0,
            inverted: false,
            openKeyboard: false
        };
    }

    errorPrinter = value => {
        this.setState({
            error: value
        });
    }

    componentDidMount(){
        serialport.bindErrorPrinter(this.errorPrinter);
    }

    handleSensibilityChange = value => {
        console.log(value);
        this.setState({ sensibility: value });
    };

    handleClickChange = clickType => {
        this.setState({ click: clickType });
    }

    handleDelayChange = ({ value }) => {
        console.log(value);
        this.setState({ delay: value });
    };

    handleInverterChange = checked => {
        this.setState({ inverted: checked });
    }

    handleOpenKeyboardChange = checked => {
        this.setState({ openKeyboard: checked });
    }

    shouldComponentUpdate = (nextProps, nextState) => {
        if (nextState.sensibility !== this.state.sensibility) {
            serialport.send({
                type: 'SENS',
                payload: nextState.sensibility
            });
            return true;
        }

        if (nextState.delay !== this.state.delay) {
            serialport.send({
                type: 'CLICK_DELAY',
                payload: nextState.delay
            });
            return true;
        }

        if (nextState.inverted !== this.state.inverted) {
            serialport.send({
                type: 'CLICK_INVERT',
                payload: nextState.inverted
            });
            return true;
        }

        if (nextState.openKeyboard !== this.state.openKeyboard) {
            serialport.send({
                type: 'OPEN_KEYBOARD',
                payload: nextState.openKeyboard
            });
            return true;
        }

        if (nextState.click !== this.state.click) {
            serialport.send({
                type: 'MODULE',
                payload: nextState.click
            });
            return true;
        }

        if (nextState.error !== this.state.error){
            return true;
        }

        return false;
    }

    render() {
        return (
            <div className="layout">
                <h1 className="title">
                    Configuración: 
                </h1>
                <Section title="Modulo">
                    <div className="modules-container" >
                        <ModuleItem
                            image={buttonsImage}
                            name="Botones" 
                            onClick={_ => this.handleClickChange('RADIO_BUTTONS')}
                            active={ this.state.click === 'RADIO_BUTTONS' }
                        />
                        <ModuleItem 
                            image={automaticImage} 
                            name="Automatico" 
                            onClick={_ => this.handleClickChange('AUTO_CLICK')}
                            active={ this.state.click === 'AUTO_CLICK' }
                        />
                        <ModuleItem 
                            image={anteojosImage} 
                            name="Anteojos" 
                            onClick={_ => this.handleClickChange('INFRA_GLASSES')}
                            active={ this.state.click === 'INFRA_GLASSES' }
                        />
                    </div>
                </Section>
                <InlineSection disabled={ this.state.click === 'AUTO_CLICK' } title="Click invertido">
                    <Switch
                        disabled={this.state.click === 'AUTO_CLICK' ? true : false}
                        className="switch"
                        onColor='#44D949'
                        offColor='#E54343'
                        onChange={this.handleInverterChange}
                        checked={this.state.inverted}
                        height={30}
                        width={60}
                        uncheckedIcon={false}
                        checkedIcon={false}
                    />
                </InlineSection>
                <InlineSection title="Abrir teclado">
                    <Switch 
                        className="switch"
                        onColor='#44D949'
                        offColor='#E54343'
                        onChange={this.handleOpenKeyboardChange}
                        checked={this.state.openKeyboard}
                        height={30}
                        width={60}
                        uncheckedIcon={false}
                        checkedIcon={false}
                    />
                </InlineSection>
                <InlineSection disabled={ this.state.click !== 'AUTO_CLICK' } title="Click delay">
                    <Select
                        isDisabled = { this.state.click !== 'AUTO_CLICK' }
                        isSearchable={true}
                        value={this.state.delay}
                        onChange={this.handleDelayChange}
                        placeholder={`${this.state.delay.toString()} seg`}
                        styles={{
                            container: (provided)=>({
                                ...provided,
                                width: 130
                            }),
                            control: (provided)=>({
                                ...provided,
                                background: '#4B4B4B',
                                border: 'none',
                                color: 'white'
                            }),
                            placeholder: (provided)=>({
                                ...provided,
                                color: 'white'
                            })
                        }}
                        options={
                            [
                                { value: 0, label: '0' },
                                { value: 1, label: '1' },
                                { value: 2, label: '2' },
                                { value: 3, label: '3' },
                                { value: 4, label: '4' }
                            ]
                        }
                    />
                </InlineSection>
                <Section title="Sensibilidad" >
                    <div className="flex h-centered">
                        <CircleSlider
                            styles={{
                                container: ()=>({
                                    background: 'red'
                                })
                            }}
                            value={this.state.sensibility}
                            max={4}
                            knobRadius={14}
                            circleWidth={14}
                            showTooltip={true}
                            circleColor={'#CEC9D4'}
                            tooltipColor={'#FFFFFF'}
                            gradientColorFrom={'#CE9FFC'}
                            gradientColorTo={'#7367f0'}
                            onChange={this.handleSensibilityChange}
                        />
                    </div>
                </Section>
                <Modal isActive={this.state.error != null}>
                    <ErrorModal errorPrinter={this.errorPrinter} message={this.state.error} />
                </Modal>
            </div>
        );
    }
}

export default Layout;