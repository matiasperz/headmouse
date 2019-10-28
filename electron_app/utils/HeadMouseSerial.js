const serialport = require('serialport');
const Readline = require('@serialport/parser-readline')

class HeadMouseSerial {
    constructor(){
        this.updateHandlers = [];
    }

    updateHandler(type, message){
        this.updateHandlers.map((hander) => {
            hander(type, message);
        });
    }

    establishArduinoComunication = async () => {
        try {
            if(this.SerialPort){
                if(this.SerialPort.isOpen){
                    this.SerialPort.close();
                    this.SerialPort = undefined;
                }else{
                    this.SerialPort = undefined;
                }
            }
            this.ARDUINO_ADRESS = await this._findArduinoPort();
            this.SerialPort = new serialport(this.ARDUINO_ADRESS, { baudRate: 9600 });

            const parser = new Readline();
            this.SerialPort.pipe(parser);

            this._bindEvents(parser);
            this.updateHandler("connected", null);
        } catch (error) {
            this.updateHandler("error", error.message);
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
                        this.updateHandler("error", jsonEvent.payload);
                    break;

                    case 'MESSAGE':
                        this.updateHandler("info", jsonEvent.payload);
                        console.log(`> ${jsonEvent.payload}`);
                    break;

                    case 'ACTION':
                        this.updateHandler("action", jsonEvent.payload);
                    break;

                    default:
                        console.log(`> ${jsonEvent.payload}`);
                    break;
                }
            }catch(error){
                this.updateHandler("error", error.message);
            }
        });
    }

    subscribeUpdater(updateHandler){
        this.updateHandlers.push(updateHandler);
    }

    unsubscribeUpdater(updateHander) {
        const index = this.updateHandlers.findIndex(handler => {
            return handler === updateHander
        })

        this.updateHandlers.splice(index, 1);
    }

    sendInitialConfig = ({ click, sensibility, delay, inverted, openKeyboard }) => {
        const json = {
            type: "INITIAL_CONFIG",
            payload: [
                {
                    type: "MODULE",
                    payload: click
                },
                {
                    type: "SENS",
                    payload: sensibility
                },
                {
                    type: "CLICK_DELAY",
                    payload: delay
                },
                {
                    type: "CLICK_INVERT",
                    payload: inverted
                },
                {
                    type: "OPEN_KEYBOARD",
                    payload: openKeyboard
                }
            ]
        }

        try{
            setTimeout(() => {
                console.log(JSON.stringify(json));
                this.SerialPort.write(JSON.stringify(json));
            }, 4000);
        }catch(error){
            this.updateHandler("error" ,"Conecte el HeadMouse para configurar");
        }
    }

    send = ({ type, payload }) => {
        const json = {
            type: type,
            payload: payload
        }
        
        try {
            this.SerialPort.write(JSON.stringify(json));
        } catch (error) {
            this.updateHandler("error" ,"Conecte el HeadMouse para configurar");
        }
    }
}

module.exports = (new HeadMouseSerial());