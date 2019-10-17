import React, { Component } from 'react';

import Section from '../components/Section';
import Header from '../components/Header';

import { CircleSlider } from 'react-circle-slider';
import Switch from 'react-switch';

class Layout extends Component {
    constructor(props) {
        super(props);
        this.state = {
            click: 'autoclick',
            // sensibility: 0,
            delay: 0,
            inverted: false
        };
    }

    // handleSensibilityChange = newSensibility => {
    //     this.setState({ sensibility: newSensibility });
    // };

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
        console.log(`Inverted click: ${this.state.inverted}`);
        console.log(`Delay: ${this.state.delay}`);
        console.log(`Click type: ${this.state.click}`);
    }

    shouldComponentUpdate = (nextProps, nextState) => {
        if (
            nextState.sensibility !== this.state.sensibility ||
            nextState.delay !== this.state.delay ||
            nextState.inverted !== this.state.inverted ||
            nextState.click !== this.state.click
        ) return true;
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
                    <div className="column" style={{ 'justifyContent': 'space-between'}}>
                        <a
                            onClick={_ => this.handleClickChange('autoclick')}
                            className="button">
                            Autoclick
                        </a>
                        <a
                            onClick={_ => this.handleClickChange('buttons')}
                            className="button">
                            Buttons
                            </a>
                        <a
                            onClick={_ => this.handleClickChange('glasses')}
                            className="button">
                            Glasses
                        </a>
                    </div>
                </Section>
                <div className="column">
                    <Section>
                        <Header
                            title={'Invert click'}
                            description={'Change click actions'}
                        />
                        <Switch
                            disabled={true}
                            className="switch"
                            onColor='#CE9FFC'
                            offColor='#7367f0'
                            onChange={this.handleInverterChange}
                            checked={this.state.inverted}
                            height={50}
                            width={100}
                        />
                    </Section>
                    <Section>
                        <Header
                            title={'Delay'}
                            description={'Select the click delay on auto-click mode'}
                        />
                        <CircleSlider
                            disabled={true}
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
                    </Section>
                </div>
            </div>
        );
    }
}

export default Layout;