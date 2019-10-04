const serialport = require('serialport');

class app {
    async constructor() {
        this.serialForm = document.getElementById('serialForm');
        this.inputMessage = document.getElementById('inputMessage');
        this.ARDUINO_ADRESS = await this.findArduinoPort();
        this.SerialPort = new serialport(this.ARDUINO_ADRESS);
        this.serialForm.addEventListener('submit', send(e));
    }

    findArduinoPort = async () => {
        await serialport.list((error, ports) => {
            if(error){
                console.log(error);
            }
    
            const MY_ARDUINO = ports.filter(port => port.manufacturer === 'Arduino LLC')[0];
            MY_ARDUINO.comName;
        });
    }

    send = () => {
        this.SerialPort.write(this.inputMessage.value);
    }
}

const myApp = new app();