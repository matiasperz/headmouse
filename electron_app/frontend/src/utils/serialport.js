import serialport from 'serialport';
const Readline = require('@serialport/parser-readline')

class app {
    constructor() {
        this._establishArduinoComunication();
    }

    _establishArduinoComunication = async () => {
        try {
            this.ARDUINO_ADRESS = await this._findArduinoPort();
            console.log(this.ARDUINO_ADRESS);
            this.SerialPort = new serialport(this.ARDUINO_ADRESS, { baudRate: 9600 });
            
            const parser = new Readline();
            this.SerialPort.pipe(parser);

            this._bindEvents(parser);
        } catch (error) {
            this.errorPrinter(error.message);
        }
    }

    _findArduinoPort = async () => {
        try {
            const availablePorts = await serialport.list();
            const MY_ARDUINO = availablePorts.filter(port => {
                return port.manufacturer && port.manufacturer.includes("Arduino");
            })[0];

            if (!MY_ARDUINO) {
                throw new Error("El HeadMouse no esta conectado");
            }

            return MY_ARDUINO.comName;
        } catch (error) {
            throw error;
        }
    }

    _bindEvents(_parser){
        _parser.on('data', line => {
            try{
                const jsonEvent = JSON.parse(line);
                
                switch(jsonEvent.type){
                    case 'ERROR':
                        this.errorPrinter(jsonEvent.payload);
                    break;

                    case 'MESSAGE':
                        this.infoPrinter(jsonEvent.payload)
                    break;
                }
            }catch(error){
                this.errorPrinter(error.message);
            }
        });
    }

    bindErrorPrinter(errorPrinter){
        this.errorPrinter = errorPrinter;
    }

    bindInfoPrinter(infoPrinter){
        this.infoPrinter = infoPrinter;
    }

    send = ({ type, payload }) => {
        const json = {
            type: type,
            payload: payload
        }
        
        try {
            this.SerialPort.write(JSON.stringify(json));
        } catch (error) {
            this.errorPrinter("Conecte el HeadMouse para configurar");
        }    
    }
}

export default new app();