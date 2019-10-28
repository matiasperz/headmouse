import React, { Component } from 'react';

import Section from '../components/Section';
import InlineSection from '../components/InlineSection';
import Modal from './Modal';
import ErrorModal from '../components/ErrorModal';
import InfoModal from '../components/InfoModal';
import ModuleItem from '../components/ModuleItem';
import { CircleSlider } from 'react-circle-slider';
import Switch from 'react-switch';
import Select from 'react-select';

import anteojosImage from '../../../assets/images/Anteojos.png';
import automaticImage from '../../../assets/images/A.png';
import buttonsImage from '../../../assets/images/Buttons.png';

import './Layout.css'

class Layout extends Component {
    constructor(props) {
        super(props);
        window.ipc.on('app-init', (event, settings) => {
            this.setState({
                ...settings,
                error: null,
                info: null,
                shouldSendToMain: false
            });
        });
        window.ipc.on('app-close', () => window.ipc.send('config', { ...this.state, error: null, info: null }));
        this.state = {
            error: null,
            info: null,
            click: '',
            sensibility: 0,
            delay: 0,
            inverted: false,
            openKeyboard: false,
            shouldSendToMain: false
        };
    }

    errorPrinter = value => {
        this.setState({
            error: value
        });
    }

    infoPrinter = value => {
        this.setState({
            info: value
        });
    }

    componentDidMount() {
        const ipc = window.ipc;

        ipc.on('error', (event, message) => {
            this.errorPrinter(message);
        });
        ipc.on('info', (event, message) => {
            this.infoPrinter(message);
        });
    }

    handleSensibilityChange = value => {
        console.log(value);
        this.setState({ sensibility: value, shouldSendToMain: true });
    };

    handleClickChange = clickType => {
        this.setState({ click: clickType, shouldSendToMain: true });
    }

    handleDelayChange = ({ value }) => {
        console.log(value);
        this.setState({ delay: value, shouldSendToMain: true });
    }

    handleInverterChange = checked => {
        this.setState({ inverted: checked, shouldSendToMain: true });
    }

    handleOpenKeyboardChange = checked => {
        this.setState({ openKeyboard: checked, shouldSendToMain: true });
    }

    shouldComponentUpdate = (nextProps, nextState) => {
        const ipc = window.ipc;

        if (!this.state.shouldSendToMain) return true;    //<--If this is false, we do not send the config to the main process

        if (nextState.sensibility !== this.state.sensibility) {
            ipc.send('send', {
                type: 'SENS',
                payload: nextState.sensibility
            });
            return true;
        }

        if (nextState.delay !== this.state.delay) {
            ipc.send('send', {
                type: 'CLICK_DELAY',
                payload: nextState.delay
            });
            return true;
        }

        if (nextState.inverted !== this.state.inverted) {
            ipc.send('send', {
                type: 'CLICK_INVERT',
                payload: nextState.inverted
            });
            return true;
        }

        if (nextState.openKeyboard !== this.state.openKeyboard) {
            ipc.send('send', {
                type: 'OPEN_KEYBOARD',
                payload: nextState.openKeyboard
            });
            return true;
        }

        if (nextState.click !== this.state.click) {
            ipc.send('send', {
                type: 'MODULE',
                payload: nextState.click
            });
            return true;
        }

        if (nextState.error !== this.state.error) {
            return true;
        }

        if (nextState.info !== this.state.info) {
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
                <Section title="Módulo">
                    <div className="modules-container" >
                        <ModuleItem
                            image={buttonsImage}
                            name="Botones"
                            onClick={_ => this.handleClickChange('RADIO_BUTTONS')}
                            active={this.state.click === 'RADIO_BUTTONS'}
                        />
                        <ModuleItem
                            image={automaticImage}
                            name="Automatico"
                            onClick={_ => this.handleClickChange('AUTO_CLICK')}
                            active={this.state.click === 'AUTO_CLICK'}
                        />
                        <ModuleItem
                            image={anteojosImage}
                            name="Anteojos"
                            onClick={_ => this.handleClickChange('INFRA_GLASSES')}
                            active={this.state.click === 'INFRA_GLASSES'}
                        />
                    </div>
                </Section>
                <InlineSection disabled={this.state.click === 'AUTO_CLICK'} title="Click invertido">
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
                <InlineSection disabled={this.state.click !== 'AUTO_CLICK'} title="Click delay">
                    <Select
                        isDisabled={this.state.click !== 'AUTO_CLICK'}
                        isSearchable={true}
                        value={this.state.delay}
                        onChange={this.handleDelayChange}
                        placeholder={`${(this.state.delay).toString()} seg`}
                        styles={{
                            container: (provided) => ({
                                ...provided,
                                width: 130
                            }),
                            control: (provided) => ({
                                ...provided,
                                background: '#4B4B4B',
                                border: 'none',
                                color: 'white'
                            }),
                            placeholder: (provided) => ({
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
                        <button
                            onClick={_ => { this.state.sensibility + 1 < 5 && this.handleSensibilityChange(this.state.sensibility - 1) }}
                            className={`button delay-button hoverable`}>
                            -
                        </button>
                        <CircleSlider
                            styles={{
                                container: () => ({
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
                        <button
                            onClick={_ => { this.state.sensibility + 1 < 5 && this.handleSensibilityChange(this.state.sensibility + 1) }}
                            className={`button delay-button hoverable`}>
                            +
                        </button>
                    </div>
                </Section>
                <Modal isActive={this.state.error != null}>
                    <ErrorModal errorPrinter={this.errorPrinter} message={this.state.error} />
                </Modal>
                <Modal isActive={this.state.info != null}>
                    <InfoModal infoPrinter={this.infoPrinter} message={this.state.info} />
                </Modal>
            </div>
        );
    }
}

export default Layout;