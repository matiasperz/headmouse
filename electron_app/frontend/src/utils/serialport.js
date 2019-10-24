import serialport from 'serialport';
const Readline = require('@serialport/parser-readline')

class app {
    constructor() {
        this.establishArduinoComunication();
    }

    establishArduinoComunication = async () => {
        try {
            this.ARDUINO_ADRESS = await this.findArduinoPort();
            console.log(this.ARDUINO_ADRESS);
            this.SerialPort = new serialport(this.ARDUINO_ADRESS, { baudRate: 9600 });
            
            const parser = new Readline();
            this.SerialPort.pipe(parser);

            parser.on('data', line => console.log(`> ${line}`));
        } catch (error) {
            console.log(error);
        }
    }

    findArduinoPort = async () => {
        try {
            const availablePorts = await serialport.list();
            const MY_ARDUINO = availablePorts.filter(port => {
                return port.manufacturer && port.manufacturer.includes("Arduino");
            })[0];

            if (!MY_ARDUINO) {
                throw new Error("Arduino not found");
            }

            return MY_ARDUINO.comName;
        } catch (error) {
            throw error;
        }
    }
    
    send = ({ type, payload }) => {
        const json = {
            type: type,
            payload: payload
        }
        console.log(json);
        this.SerialPort.write(JSON.stringify(json));
    }
}

export default new app();