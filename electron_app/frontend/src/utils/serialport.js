import serialport from 'serialport';

class app {
    constructor() {
        this.establishArduinoComunication();
    }

    establishArduinoComunication = async () => {
        try {
            this.ARDUINO_ADRESS = await this.findArduinoPort();
            this.SerialPort = new serialport(this.ARDUINO_ADRESS, { baudRate: 9600 });
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
        this.SerialPort.write(JSON.stringify(json));
    }
}

export default new app();