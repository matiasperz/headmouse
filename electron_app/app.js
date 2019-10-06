const serialport = require('serialport');

class app {
    constructor() {
        this.establishArduinoComunication();
    }

    establishArduinoComunication = async () => {
        this.serialForm = document.getElementById('serialForm');
        this.inputMessage = document.getElementById('inputMessage');
        this.ARDUINO_ADRESS = await this.findArduinoPort();
        this.SerialPort = new serialport(this.ARDUINO_ADRESS, { baudRate: 9600 });
        this.serialForm.addEventListener('submit', this.send);
    }

    findArduinoPort = async () => {
        try {
            const availablePorts = await serialport.list();
            const MY_ARDUINO = availablePorts.filter(port => port.manufacturer.match(/Arduino LLC/))[0];

            if(!MY_ARDUINO){
                throw "Arduino not found";
            }
            
            return MY_ARDUINO.comName;
        } catch (error) {
            console.log(error);
        }
    }

    send = (e) => {
        e.preventDefault();
        this.SerialPort.write(this.inputMessage.value);
    }   
}

const myApp = new app();