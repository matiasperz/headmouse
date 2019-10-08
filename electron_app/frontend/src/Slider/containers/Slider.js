import React, { PureComponent } from 'react';

import { CircleSlider } from 'react-circle-slider';

import '../Slider.css'

class Slider extends PureComponent {
    constructor(props) {
        super(props);
        this.state = { value: 0 };
    }
 
    handleChange = value => {
        console.log(`Changed value ${value}`);
        this.setState({ value });
    };

    render() {
        return (
            <CircleSlider
                value={this.state.value}
                max={10}
                knobRadius={12}
                circleWidth={10}
                showTooltip={true}
                circleColor={'#CEC9D4'}
                //tooltipColor={'#476577'}
                tooltipColor={'#ffffff'}
                gradientColorFrom={'#CE9FFC'}
                gradientColorTo={'#7367f0'}
                onChange={this.handleChange}
            />
        );
    }
}

export default Slider;