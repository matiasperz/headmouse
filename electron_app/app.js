const serialport = require('serialport');

class app {
    constructor() {
        this.serialForm = document.getElementById('serialForm');
        this.inputMessage = document.getElementById('inputMessage');
        this.findArduinoPort()
            .then(ARDUINO_PORT => {
                this.SerialPort = new serialport(ARDUINO_PORT)
                this.serialForm.addEventListener('submit', this.send());
            })
            .catch(error => console.log(error));
    }

    findArduinoPort = async () => {
        const MY_ARDUINO = await serialport.list((error, ports) => {
            if (error) {
                console.log('No se pudo encontrar tu arduino 😫');
            }

            ports.filter(port => port.manufacturer.includes('Arduino'));
        });
        return MY_ARDUINO[0].comName;
    }

    send = () => {
        this.SerialPort.write(this.inputMessage.value);
    }
}

const myApp = new app();