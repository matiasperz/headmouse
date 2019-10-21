const serialport = require('serialport');

class app {
    constructor() {
        this.establishArduinoComunication();
    }

    establishArduinoComunication = async () => {
        this.ARDUINO_ADRESS = await this.findArduinoPort();
        this.SerialPort = new serialport(this.ARDUINO_ADRESS, { baudRate: 9600 });
    }

    findArduinoPort = async () => {
        try {
            const availablePorts = await serialport.list();
            const MY_ARDUINO = availablePorts.filter(port => port.manufacturer.match(/Arduino LLC/))[0];

            if (!MY_ARDUINO) {
                throw new Error("Arduino not found");
            }

            return MY_ARDUINO.comName;
        } catch (error) {
            console.log(error);
        }
    }

    send = ({ type, payload }) => {
        this.SerialPort.write({
            type: type,
            payload: payload
        });
    }
}

export default new app();