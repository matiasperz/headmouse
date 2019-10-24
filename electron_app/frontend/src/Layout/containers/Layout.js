import React, { Component } from 'react';

import Section from '../components/Section';
import Header from '../components/Header';

import { CircleSlider } from 'react-circle-slider';
import Switch from 'react-switch';
import Select from 'react-select';

import serialport from '../../utils/serialport';

class Layout extends Component {
    constructor(props) {
        super(props);
        this.state = {
            click: 'AUTO_CLICK',
            sensibility: 0,
            delay: 0,
            inverted: false
        };
    }

    handleSensibilityChange = ({ value }) => {
        this.setState({ sensibility: value });
    };

    handleClickChange = clickType => {
        this.setState({ click: clickType });
    }

    handleDelayChange = newDelay => {
        this.setState({ delay: newDelay });
    };

    handleInverterChange = checked => {
        this.setState({ inverted: checked });
    }

    componentDidUpdate = _ => {
        
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

        if (nextState.click !== this.state.click) {
            serialport.send({
                type: 'MODULE',
                payload: nextState.click
            });
            return true;
        }

        return false;
    }

    render() {
        return (
            <div className="layout">
                <Section>
                    <Header
                        title={'Click'}
                        description={'Select the method to perform clicks'}
                    />
                    <div className="switch">
                        <button
                            onClick={_ => this.handleClickChange('AUTO_CLICK')}
                            className={`button hoverable top-button ${this.state.click === 'AUTO_CLICK' ? 'bordered' : null}`}>
                            Autoclick
                        </button>
                        <button
                            onClick={_ => this.handleClickChange('RADIO_BUTTONS')}
                            className={`button hoverable center-button ${this.state.click === 'RADIO_BUTTONS' ? 'bordered' : null}`}>
                            Buttons
                        </button>
                        <button
                            onClick={_ => this.handleClickChange('INFRA_GLASSES')}
                            className={`button hoverable bottom-button ${this.state.click === 'INFRA_GLASSES' ? 'bordered' : null}`}>
                            Glasses
                        </button>
                    </div>
                </Section>
                <Section>
                    <Header
                        title={'Invert click'}
                        description={'Change click actions'}
                    />
                    <Switch
                        disabled={this.state.click === 'AUTO_CLICK' ? true : false}
                        className="switch"
                        onColor='#CE9FFC'
                        offColor='#7367f0'
                        onChange={this.handleInverterChange}
                        checked={this.state.inverted}
                        height={50}
                        width={100}
                    />
                    <hr />
                    <div className="column">
                        <Header
                            title={'Sensibility'}
                            description={null}
                        />
                        <Select
                            className="switch font-montserrat select"
                            isSearchable={true}
                            value={this.state.sensibility}
                            onChange={this.handleSensibilityChange}
                            placeholder={this.state.sensibility.toString()}
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
                    </div>
                </Section>
                <Section
                    disabled={this.state.click === 'AUTO_CLICK' ? false : true}
                >
                    <Header
                        title={'Delay'}
                        description={'Select the click delay on auto-click mode'}
                    />
                    <button
                        disabled={this.state.click === 'AUTO_CLICK' ? false : true}
                        onClick={_ => {
                            if (this.state.delay + 1 < 5) return this.handleDelayChange(this.state.delay + 1)
                        }}
                        className={`button delay-button ${this.state.click !== 'AUTO_CLICK' ? null : 'hoverable'}`}>
                        +
                    </button>
                    <CircleSlider
                        disabled={this.state.click === 'AUTO_CLICK' ? false : true}
                        value={this.state.delay}
                        max={4}
                        knobRadius={12}
                        circleWidth={10}
                        showTooltip={true}
                        circleColor={'#CEC9D4'}
                        tooltipColor={'#FFFFFF'}
                        gradientColorFrom={'#CE9FFC'}
                        gradientColorTo={'#7367f0'}
                        onChange={this.handleDelayChange}
                    />
                    <button
                        disabled={this.state.click === 'AUTO_CLICK' ? false : true}
                        onClick={_ => {
                            if (this.state.delay - 1 > -1) return this.handleDelayChange(this.state.delay - 1)
                        }}
                        className={`button delay-button ${this.state.click !== 'AUTO_CLICK' ? null : 'hoverable'}`}>
                        -
                    </button>
                </Section>
            </div>
        );
    }
}

export default Layout;